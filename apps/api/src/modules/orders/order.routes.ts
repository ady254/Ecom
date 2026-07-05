import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { OrderModel, IOrder } from './order.model.js';
import { authenticate, optionalAuth, AuthRequest } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { verifyRazorpaySignature } from '../../utils/payment.js';
import { generateOrderId, calculateEstimatedDelivery } from '@minara/utils';
import { SHIPPING, ORDER_STATUSES } from '@minara/config';
import { env } from '../../config/env.js';
import { getRazorpay } from '../../config/razorpay.js';
import {
  createOrderSchema,
  confirmPaymentSchema,
  CreateOrderInput,
  priceOrderItems,
  claimCoupon,
  releaseCoupon,
  reserveStock,
  releaseStock,
  computeShipping,
  round2,
  toPaise,
} from './order.pricing.js';
import {
  resolveOrderEmail,
  sendOrderConfirmationEmail,
  markOrderPaid,
  cancelOrder,
  buildTrackUrl,
} from './order.lifecycle.js';
import { sendMail, orderShippedTemplate, orderDeliveredTemplate } from '../../config/email.js';

const router = Router();

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many orders placed from this device. Please try again later.' },
});

/**
 * An order can be read/cancelled by: an admin, the logged-in owner, or anyone
 * who knows BOTH the (unguessable) orderId and the email it was placed with —
 * the latter is what makes one-click links in order emails work without login.
 */
const assertOrderAccess = async (order: IOrder, req: AuthRequest, email?: string): Promise<void> => {
  if (req.user?.role === 'admin') return;
  if (order.user && order.user.toString() === req.user?.userId) return;

  // Email-verified access (guest orders, or email links opened while logged out)
  const orderEmail = (await resolveOrderEmail(order))?.toLowerCase();
  if (!orderEmail) throw new AppError('Unauthorized', 403);
  if (!email) throw new AppError('EMAIL_REQUIRED', 401);
  if (email.trim().toLowerCase() !== orderEmail) throw new AppError('Unauthorized', 403);
};

// ─── Customer Routes ──────────────────────────────────────────────────────────

// POST /api/v1/orders — Create a new order (prices resolved server-side)
router.post(
  '/',
  orderLimiter,
  optionalAuth,
  validate(createOrderSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const body = req.body as CreateOrderInput;

    if (!req.user && !body.guestInfo) {
      throw new AppError('Guest info required for guest checkout', 400);
    }
    if (body.paymentMethod === 'razorpay' && (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)) {
      throw new AppError('Online payment is not available right now. Please use Cash on Delivery.', 503);
    }

    // 1. Authoritative pricing from the database — client prices are never trusted
    const { pricedItems, subtotal } = await priceOrderItems(body.items);
    const shippingCharge = computeShipping(subtotal);

    // 2. Atomically claim the coupon (throws if invalid/expired/limit reached)
    let discount = 0;
    let couponCode: string | undefined;
    if (body.couponCode) {
      const claimed = await claimCoupon(body.couponCode, subtotal);
      discount = claimed.discount;
      couponCode = claimed.coupon.code;
    }

    const total = round2(subtotal + shippingCharge - discount);
    const delivery = calculateEstimatedDelivery(SHIPPING.processingDays, SHIPPING.estimatedDays.max);
    const stockLines = pricedItems.map((i) => ({ product: i.product, quantity: i.quantity }));

    // 3. Reserve stock (all-or-nothing; oversell-safe)
    try {
      await reserveStock(stockLines);
    } catch (err) {
      await releaseCoupon(couponCode);
      throw err;
    }

    // 4. Create the order, then (for online payment) the Razorpay order
    let order: IOrder | undefined;
    try {
      order = await OrderModel.create({
        orderId: generateOrderId(),
        user: req.user?.userId || null,
        guestInfo: !req.user ? body.guestInfo : undefined,
        items: pricedItems,
        shippingAddress: body.shippingAddress,
        subtotal,
        shippingCharge,
        discount,
        total,
        couponCode,
        giftMessage: body.giftMessage,
        paymentMethod: body.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        expectedDelivery: delivery.to,
        timeline: [{ status: 'pending', message: 'Order placed', timestamp: new Date() }],
      });

      if (body.paymentMethod === 'razorpay') {
        const razorpay = getRazorpay();
        const rzpOrder = await razorpay.orders.create({
          amount: toPaise(total),
          currency: 'INR',
          receipt: order.orderId,
          notes: { orderId: order.orderId },
        });
        order.razorpayOrderId = rzpOrder.id;
        await order.save();

        res.status(201).json({
          success: true,
          message: 'Order created. Complete payment to confirm.',
          data: {
            order,
            payment: {
              keyId: env.RAZORPAY_KEY_ID,
              razorpayOrderId: rzpOrder.id,
              amount: rzpOrder.amount,
              currency: rzpOrder.currency,
            },
          },
        });
        return;
      }
    } catch (err) {
      // Roll back everything we claimed so nothing leaks
      await releaseStock(stockLines);
      await releaseCoupon(couponCode);
      if (order) await OrderModel.deleteOne({ _id: order._id });
      throw err;
    }

    // COD order — confirmed immediately
    await sendOrderConfirmationEmail(order);
    res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } });
  })
);

// POST /api/v1/orders/:orderId/pay/confirm — Verify and capture a Razorpay payment
router.post(
  '/:orderId/pay/confirm',
  optionalAuth,
  validate(confirmPaymentSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await OrderModel.findOne({ orderId: req.params.orderId });
    if (!order) throw new AppError('Order not found', 404);
    if (order.paymentMethod !== 'razorpay') throw new AppError('Not an online-payment order', 400);
    if (order.paymentStatus === 'paid') {
      res.json({ success: true, message: 'Payment already confirmed', data: { order } });
      return;
    }
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
      throw new AppError('Payment does not belong to this order', 400);
    }
    if (!env.RAZORPAY_KEY_SECRET) throw new AppError('Payment gateway not configured', 503);

    // 1. Signature proves the payment came from Razorpay for THIS Razorpay order
    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, env.RAZORPAY_KEY_SECRET)) {
      throw new AppError('Invalid payment signature', 400);
    }

    // 2. Fetch the payment from Razorpay: amount, currency and state are
    //    verified against what the SERVER charged — not what the client says.
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (payment.order_id !== order.razorpayOrderId) {
      throw new AppError('Payment does not belong to this order', 400);
    }
    if (Number(payment.amount) !== toPaise(order.total) || payment.currency !== 'INR') {
      throw new AppError('Payment amount mismatch', 400);
    }
    if (payment.status === 'authorized') {
      await razorpay.payments.capture(razorpayPaymentId, toPaise(order.total), 'INR');
    } else if (payment.status !== 'captured') {
      throw new AppError(`Payment not completed (status: ${payment.status})`, 400);
    }

    const paid = await markOrderPaid(order.orderId, razorpayPaymentId);
    res.json({
      success: true,
      message: 'Payment confirmed',
      data: { order: paid ?? order },
    });
  })
);

// GET /api/v1/orders/my — Get user's orders
router.get(
  '/my',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      OrderModel.find({ user: req.user!.userId }).sort('-createdAt').skip(skip).limit(limit),
      OrderModel.countDocuments({ user: req.user!.userId }),
    ]);

    res.json({
      success: true,
      message: 'Orders fetched',
      data: { orders },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

// GET /api/v1/orders/:orderId — Get single order
router.get(
  '/:orderId',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await OrderModel.findOne({ orderId: req.params.orderId });
    if (!order) throw new AppError('Order not found', 404);

    await assertOrderAccess(order, req, req.query.email as string | undefined);

    res.json({ success: true, message: 'Order fetched', data: { order } });
  })
);

// POST /api/v1/orders/:orderId/cancel — Customer: cancel an order
router.post(
  '/:orderId/cancel',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await OrderModel.findOne({ orderId: req.params.orderId });
    if (!order) throw new AppError('Order not found', 404);

    await assertOrderAccess(order, req, req.body?.email as string | undefined);

    const cancelled = await cancelOrder(order, { reason: 'Order cancelled by customer' });
    if (!cancelled) {
      throw new AppError(`Order cannot be cancelled — it is already ${order.status}`, 400);
    }

    res.json({ success: true, message: 'Order cancelled successfully', data: { order: cancelled } });
  })
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/v1/orders — Admin: get all orders
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const query = status ? { status } : {};
    const [orders, total] = await Promise.all([
      OrderModel.find(query).sort('-createdAt').skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Orders fetched',
      data: { orders },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  message: z.string().trim().max(500).optional(),
});

// PATCH /api/v1/orders/:orderId/status — Admin: update order status
router.patch(
  '/:orderId/status',
  authenticate,
  requireAdmin,
  validate(updateStatusSchema),
  asyncHandler(async (req, res) => {
    const { status, message: msg } = req.body as z.infer<typeof updateStatusSchema>;
    const order = await OrderModel.findOne({ orderId: req.params.orderId });
    if (!order) throw new AppError('Order not found', 404);

    // Cancellation goes through the full lifecycle (stock restore + refund)
    if (status === 'cancelled') {
      const cancelled = await cancelOrder(order, { reason: msg || 'Order cancelled by MINARA' });
      if (!cancelled) throw new AppError(`Order cannot be cancelled — it is already ${order.status}`, 400);
      res.json({ success: true, message: 'Order cancelled', data: { order: cancelled } });
      return;
    }

    order.status = status;
    order.timeline.push({ status, message: msg || `Status updated to ${status}`, timestamp: new Date() });
    await order.save();

    if (status === 'delivered') {
      const email = await resolveOrderEmail(order);
      if (email) {
        sendMail({
          to: email,
          subject: `Your MINARA order has arrived! — ${order.orderId}`,
          html: orderDeliveredTemplate({
            name: order.shippingAddress.fullName,
            orderId: order.orderId,
            trackUrl: buildTrackUrl(order.orderId, email),
          }),
        }).catch(console.error);
      }
    }

    res.json({ success: true, message: 'Order status updated', data: { order } });
  })
);

// PATCH /api/v1/orders/:orderId/awb — Admin: enter XpressBees AWB number
router.patch(
  '/:orderId/awb',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { awbNumber } = req.body;
    if (!awbNumber || typeof awbNumber !== 'string' || awbNumber.length > 50) {
      throw new AppError('AWB number is required', 400);
    }

    const order = await OrderModel.findOne({ orderId: req.params.orderId });
    if (!order) throw new AppError('Order not found', 404);

    order.awbNumber = awbNumber;
    order.status = 'shipped';
    order.timeline.push({
      status: 'shipped',
      message: `Shipped via XpressBees. AWB: ${awbNumber}`,
      timestamp: new Date(),
    });
    await order.save();

    const email = await resolveOrderEmail(order);

    if (email) {
      sendMail({
        to: email,
        subject: `Your MINARA order is shipped! — ${order.orderId}`,
        html: orderShippedTemplate({
          name: order.shippingAddress.fullName,
          orderId: order.orderId,
          awbNumber,
          trackUrl: buildTrackUrl(order.orderId, email),
        }),
      }).catch(console.error);
    }

    res.json({ success: true, message: 'AWB number saved and order marked shipped', data: { order } });
  })
);

export default router;
