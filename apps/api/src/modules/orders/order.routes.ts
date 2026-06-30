import { Router } from 'express';
import crypto from 'crypto';
import { OrderModel } from './order.model.js';
import { ProductModel } from '../products/product.model.js';
import { UserModel } from '../users/user.model.js';
import { CouponModel } from '../coupons/coupon.model.js';
import { authenticate, optionalAuth, AuthRequest } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { generateOrderId, calculateEstimatedDelivery } from '@minara/utils';
import { SHIPPING } from '@minara/config';
import { env } from '../../config/env.js';
import { sendMail, orderConfirmationTemplate, orderShippedTemplate } from '../../config/email.js';

const router = Router();

// ─── Customer Routes ──────────────────────────────────────────────────────────

// POST /api/v1/orders — Create a new order
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      items,
      shippingAddress,
      paymentMethod,
      couponCode,
      giftMessage,
      guestInfo,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!items?.length) throw new AppError('Order must have at least one item', 400);
    if (!shippingAddress) throw new AppError('Shipping address is required', 400);
    if (!paymentMethod) throw new AppError('Payment method is required', 400);
    if (!req.user && !guestInfo) throw new AppError('Guest info required for guest checkout', 400);

    // ── Razorpay signature verification ───────────────────────────────────────
    if (paymentMethod === 'razorpay') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new AppError('Razorpay payment details are required', 400);
      }
      if (!env.RAZORPAY_KEY_SECRET) {
        throw new AppError('Payment gateway not configured', 503);
      }
      const expected = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      if (expected !== razorpaySignature) {
        throw new AppError('Invalid payment signature', 400);
      }
    }

    // ── Server-side price calculation ─────────────────────────────────────────
    const subtotal = items.reduce(
      (acc: number, item: { price: number; quantity: number }) => acc + item.price * item.quantity,
      0
    );
    const shippingCharge = subtotal >= SHIPPING.freeShippingThreshold ? 0 : SHIPPING.standardShippingCharge;

    // ── Coupon validation & discount ──────────────────────────────────────────
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await CouponModel.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        const expired = coupon.expiresAt && coupon.expiresAt < now;
        const limitReached = coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit;
        const belowMin = subtotal < coupon.minOrderAmount;

        if (!expired && !limitReached && !belowMin) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          } else {
            discount = coupon.value;
          }
          discount = Math.min(discount, subtotal); // can't discount more than subtotal
          appliedCoupon = coupon;
        }
      }
    }

    const total = subtotal + shippingCharge - discount;
    const delivery = calculateEstimatedDelivery(SHIPPING.processingDays, SHIPPING.estimatedDays.max);

    const order = await OrderModel.create({
      orderId: generateOrderId(),
      user: req.user?.userId || null,
      guestInfo: !req.user ? guestInfo : undefined,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      discount,
      total,
      couponCode: appliedCoupon ? couponCode.toUpperCase() : undefined,
      giftMessage: giftMessage ? String(giftMessage).slice(0, 300) : undefined,
      paymentMethod,
      paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
      razorpayOrderId: razorpayOrderId ?? undefined,
      razorpayPaymentId: razorpayPaymentId ?? undefined,
      status: 'pending',
      expectedDelivery: delivery.to,
      timeline: [{ status: 'pending', message: 'Order placed', timestamp: new Date() }],
    });

    // ── Increment coupon usage ────────────────────────────────────────────────
    if (appliedCoupon) {
      await CouponModel.findByIdAndUpdate(appliedCoupon._id, { $inc: { usageCount: 1 } });
    }

    // ── Decrement product stock ───────────────────────────────────────────────
    await Promise.all(
      (items as Array<{ product: string; quantity: number }>).map((item) =>
        ProductModel.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
      )
    );

    // ── Confirmation email ────────────────────────────────────────────────────
    let recipientEmail: string | undefined;
    if (req.user) {
      const user = await UserModel.findById(req.user.userId).select('email').lean();
      recipientEmail = user?.email;
    } else {
      recipientEmail = guestInfo?.email;
    }

    if (recipientEmail) {
      sendMail({
        to: recipientEmail,
        subject: `Order Confirmed — ${order.orderId} | MINARA`,
        html: orderConfirmationTemplate({
          name: shippingAddress.fullName,
          orderId: order.orderId,
          total,
          items: items.map((i: { name: string; quantity: number; price: number }) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      }).catch(console.error);
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } });
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

    if (req.user?.role !== 'admin') {
      if (order.user) {
        // Registered-user order: requesting user must be the owner
        if (order.user.toString() !== req.user?.userId) {
          throw new AppError('Unauthorized', 403);
        }
      } else if (req.user) {
        // Logged-in user trying to access a guest order that isn't theirs
        throw new AppError('Unauthorized', 403);
      }
      // Unauthenticated request for a guest order: orderId is proof of ownership
    }

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

    if (req.user?.role !== 'admin') {
      if (order.user) {
        if (order.user.toString() !== req.user?.userId) throw new AppError('Unauthorized', 403);
      } else if (req.user) {
        throw new AppError('Unauthorized', 403);
      }
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new AppError(`Order cannot be cancelled — it is already ${order.status}`, 400);
    }

    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      message: 'Order cancelled by customer',
      timestamp: new Date(),
    });
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', data: { order } });
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

// PATCH /api/v1/orders/:orderId/status — Admin: update order status
router.patch(
  '/:orderId/status',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status, message: msg } = req.body;
    const order = await OrderModel.findOne({ orderId: req.params.orderId });
    if (!order) throw new AppError('Order not found', 404);

    order.status = status;
    order.timeline.push({ status, message: msg || `Status updated to ${status}`, timestamp: new Date() });
    await order.save();

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
    if (!awbNumber) throw new AppError('AWB number is required', 400);

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

    // Resolve email from guest or registered user
    let email = order.guestInfo?.email;
    if (!email && order.user) {
      const user = await UserModel.findById(order.user).select('email').lean();
      email = user?.email;
    }

    if (email) {
      sendMail({
        to: email,
        subject: `Your MINARA order is shipped! — ${order.orderId}`,
        html: orderShippedTemplate({
          name: order.shippingAddress.fullName,
          orderId: order.orderId,
          awbNumber,
        }),
      }).catch(console.error);
    }

    res.json({ success: true, message: 'AWB number saved and order marked shipped', data: { order } });
  })
);

export default router;
