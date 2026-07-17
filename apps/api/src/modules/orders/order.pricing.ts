import { z } from 'zod';
import { ProductModel, IProduct } from '../products/product.model.js';
import { CouponModel, ICoupon } from '../coupons/coupon.model.js';
import { AppError } from '../../utils/AppError.js';
import { SHIPPING, SERVICEABLE_STATES } from '@minara/config';

// ─── Validation Schemas ───────────────────────────────────────────────────────
// The client only ever tells us WHAT it wants to buy (product + quantity +
// variant). Names, images and — critically — prices are always resolved from
// the database on the server. Any price fields sent by the client are ignored.

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product id');

export const orderItemSchema = z.object({
  product: objectId,
  quantity: z.number().int().min(1).max(50),
  variant: z.record(z.string().max(100), z.string().max(200)).optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  shippingAddress: z.object({
    fullName: z.string().trim().min(1).max(100),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    addressLine1: z.string().trim().min(1).max(200),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100),
    state: z
      .string()
      .trim()
      .refine((s) => (SERVICEABLE_STATES as readonly string[]).includes(s), {
        message: 'We do not currently deliver to this state',
      }),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
    country: z.string().trim().max(56).default('India'),
  }),
  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().trim().toUpperCase().max(40).optional(),
  giftMessage: z.string().trim().max(300).optional(),
  guestInfo: z
    .object({
      name: z.string().trim().min(1).max(100),
      email: z.string().trim().toLowerCase().email(),
      phone: z.string().trim().max(15),
    })
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const confirmPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1).max(100),
  razorpayPaymentId: z.string().min(1).max(100),
  razorpaySignature: z.string().min(1).max(200),
});

// ─── Pure Pricing Functions (unit-tested) ─────────────────────────────────────

export const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Rupees → paise, the integer unit Razorpay expects. */
export const toPaise = (rupees: number): number => Math.round(rupees * 100);

export const computeShipping = (subtotal: number): number =>
  subtotal >= SHIPPING.freeShippingThreshold ? 0 : SHIPPING.standardShippingCharge;

/**
 * Resolve the authoritative unit price for a product + chosen variant.
 * If an admin has set a price on the matching variant option, it replaces the
 * base price; otherwise the base price applies.
 */
export const resolveUnitPrice = (
  product: Pick<IProduct, 'price' | 'variants'>,
  variant?: Record<string, string>
): number => {
  let price = product.price;
  if (variant) {
    for (const group of product.variants ?? []) {
      const chosen = group.name ? variant[group.name] : undefined;
      if (!chosen) continue;
      const option = group.options?.find((o) => o.label === chosen);
      if (option?.price != null) price = option.price;
    }
  }
  return price;
};

export type CouponLike = Pick<ICoupon, 'type' | 'value' | 'maxDiscount'>;

export const computeCouponDiscount = (coupon: CouponLike, subtotal: number): number => {
  let discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.type === 'percentage' && coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  return round2(Math.min(discount, subtotal));
};

// ─── DB-Backed Pricing ────────────────────────────────────────────────────────

export interface PricedItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: Record<string, string>;
}

/**
 * Look up every ordered product in the database and price the order from
 * DB values only. Throws if a product is missing or inactive.
 *
 * `codIneligible` lists the names of any products the admin has switched COD
 * off for — the caller decides what to do with it, since it only matters when
 * the customer actually asked to pay cash on delivery.
 */
export const priceOrderItems = async (
  items: OrderItemInput[]
): Promise<{ pricedItems: PricedItem[]; subtotal: number; codIneligible: string[] }> => {
  const ids = [...new Set(items.map((i) => i.product))];
  const products = await ProductModel.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const codIneligible = new Set<string>();

  const pricedItems: PricedItem[] = items.map((item) => {
    const product = byId.get(item.product);
    if (!product || !product.isActive) {
      throw new AppError('One of the products in your cart is no longer available', 409);
    }
    // Products saved before this flag existed have no value — those predate any
    // COD restriction, so absence means "COD is fine".
    if (product.codAvailable === false) codIneligible.add(product.name);
    return {
      product: item.product,
      name: product.name,
      image: product.images?.[0]?.url ?? '',
      price: resolveUnitPrice(product, item.variant),
      quantity: item.quantity,
      variant: item.variant,
    };
  });

  const subtotal = round2(pricedItems.reduce((acc, i) => acc + i.price * i.quantity, 0));
  return { pricedItems, subtotal, codIneligible: [...codIneligible] };
};

// ─── Coupon Claim / Release ───────────────────────────────────────────────────

/**
 * Atomically claim one use of a coupon (increments usageCount only when all
 * conditions still hold, so the usage limit can never be oversubscribed).
 * Throws 400 if the code is invalid — silently charging full price would
 * surprise the customer.
 */
export const claimCoupon = async (
  code: string,
  subtotal: number
): Promise<{ coupon: ICoupon; discount: number }> => {
  const now = new Date();
  const coupon = await CouponModel.findOneAndUpdate(
    {
      code: code.toUpperCase(),
      isActive: true,
      minOrderAmount: { $lte: subtotal },
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] },
        {
          $or: [
            { usageLimit: null },
            { usageLimit: { $exists: false } },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
          ],
        },
      ],
    },
    { $inc: { usageCount: 1 } },
    { new: true }
  );

  if (!coupon) {
    throw new AppError('This coupon is not valid for your order', 400);
  }
  return { coupon, discount: computeCouponDiscount(coupon, subtotal) };
};

export const releaseCoupon = async (code?: string): Promise<void> => {
  if (!code) return;
  await CouponModel.findOneAndUpdate(
    { code: code.toUpperCase(), usageCount: { $gt: 0 } },
    { $inc: { usageCount: -1 } }
  );
};

// ─── Stock Reservation ────────────────────────────────────────────────────────

export interface StockLine {
  product: string;
  quantity: number;
}

/**
 * Atomically reserve stock for every line item. Each decrement only succeeds
 * while stock >= quantity, so two simultaneous buyers of the last unit can
 * never both win. If any line fails, everything reserved so far is released.
 */
export const reserveStock = async (items: StockLine[]): Promise<void> => {
  const reserved: StockLine[] = [];
  for (const item of items) {
    const updated = await ProductModel.findOneAndUpdate(
      { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true, select: '_id' }
    );
    if (!updated) {
      await releaseStock(reserved);
      const product = await ProductModel.findById(item.product).select('name stock').lean();
      throw new AppError(
        product
          ? `Sorry, only ${Math.max(product.stock, 0)} unit(s) of "${product.name}" left in stock`
          : 'One of the products in your cart is no longer available',
        409
      );
    }
    reserved.push(item);
  }
};

export const releaseStock = async (items: StockLine[]): Promise<void> => {
  await Promise.all(
    items.map((i) => ProductModel.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } }))
  );
};
