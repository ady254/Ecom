import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const UserRole = z.enum(['customer', 'admin']);
export type UserRole = z.infer<typeof UserRole>;

export const OrderStatus = z.enum([
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const PaymentMethod = z.enum(['razorpay', 'cod']);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

export const PaymentStatus = z.enum(['pending', 'paid', 'failed', 'refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

// ─── Address ──────────────────────────────────────────────────────────────────

export const AddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().length(10),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});
export type Address = z.infer<typeof AddressSchema>;

// ─── User ─────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: UserRole,
  googleId: z.string().optional(),
  avatar: z.string().optional(),
  addresses: z.array(AddressSchema),
  wishlist: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// ─── Category ─────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().nullable(),
  order: z.number().default(0),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

// ─── Product Variant ──────────────────────────────────────────────────────────

export const ProductVariantSchema = z.object({
  name: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      price: z.number().optional(),
      stock: z.number().optional(),
    })
  ),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// ─── Product ──────────────────────────────────────────────────────────────────

export const ProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().optional(),
  images: z.array(z.string()).min(1),
  category: z.string(),
  tags: z.array(z.string()),
  stock: z.number().min(0),
  variants: z.array(ProductVariantSchema),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  codAvailable: z.boolean().default(true),
  weight: z.number().optional(),
  sku: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

// ─── Cart Item ────────────────────────────────────────────────────────────────

export const CartItemSchema = z.object({
  product: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  variant: z.record(z.string()).optional(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

// ─── Order ────────────────────────────────────────────────────────────────────

export const OrderItemSchema = z.object({
  product: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number(),
  variant: z.record(z.string()).optional(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  _id: z.string(),
  orderId: z.string(),
  user: z.string().nullable(),
  guestInfo: z
    .object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
    })
    .optional(),
  items: z.array(OrderItemSchema),
  shippingAddress: AddressSchema,
  subtotal: z.number(),
  shippingCharge: z.number(),
  discount: z.number(),
  total: z.number(),
  couponCode: z.string().optional(),
  paymentMethod: PaymentMethod,
  paymentStatus: PaymentStatus,
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  awbNumber: z.string().optional(),
  status: OrderStatus,
  timeline: z.array(
    z.object({
      status: OrderStatus,
      message: z.string(),
      timestamp: z.string(),
    })
  ),
  expectedDelivery: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;

// ─── Review ───────────────────────────────────────────────────────────────────

export const ReviewSchema = z.object({
  _id: z.string(),
  product: z.string(),
  user: z.string(),
  userName: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string(),
  isApproved: z.boolean(),
  createdAt: z.string(),
});
export type Review = z.infer<typeof ReviewSchema>;

// ─── Coupon ───────────────────────────────────────────────────────────────────

export const CouponSchema = z.object({
  _id: z.string(),
  code: z.string(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number(),
  minOrderAmount: z.number(),
  maxDiscountAmount: z.number().optional(),
  usageLimit: z.number(),
  usedCount: z.number(),
  isActive: z.boolean(),
  expiresAt: z.string(),
  createdAt: z.string(),
});
export type Coupon = z.infer<typeof CouponSchema>;

// ─── Banner ───────────────────────────────────────────────────────────────────

export const BannerSchema = z.object({
  _id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string(),
  mobileImage: z.string().optional(),
  link: z.string().optional(),
  position: z.enum(['hero', 'middle', 'footer']),
  isActive: z.boolean(),
  order: z.number(),
  createdAt: z.string(),
});
export type Banner = z.infer<typeof BannerSchema>;

// ─── Notification ─────────────────────────────────────────────────────────────

export const NotificationSchema = z.object({
  _id: z.string(),
  user: z.string(),
  type: z.enum(['order', 'promo', 'system']),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  orderId: z.string().optional(),
  createdAt: z.string(),
});
export type Notification = z.infer<typeof NotificationSchema>;

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Zod Validation Schemas ───────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().optional(),
  images: z.array(z.string()).min(1),
  category: z.string(),
  tags: z.array(z.string()),
  stock: z.number().min(0),
  variants: z.array(ProductVariantSchema),
  isFeatured: z.boolean().default(false),
  weight: z.number().optional(),
  sku: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const CreateCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().nullable().optional(),
  order: z.number().default(0),
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  shippingAddress: AddressSchema,
  paymentMethod: PaymentMethod,
  couponCode: z.string().optional(),
  guestInfo: z
    .object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
    })
    .optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
