import { Router } from 'express';
import { OrderModel } from './order.model.js';
import { authenticate, optionalAuth, AuthRequest } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { generateOrderId, calculateEstimatedDelivery } from '@minara/utils';
import { SHIPPING } from '@minara/config';
import { sendMail, orderConfirmationTemplate, orderShippedTemplate } from '../../config/email.js';

const router = Router();

// ─── Customer Routes ──────────────────────────────────────────────────────────

// POST /api/v1/orders — Create a new order
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { items, shippingAddress, paymentMethod, couponCode, guestInfo } = req.body;

    if (!items?.length) throw new AppError('Order must have at least one item', 400);
    if (!shippingAddress) throw new AppError('Shipping address is required', 400);
    if (!paymentMethod) throw new AppError('Payment method is required', 400);
    if (!req.user && !guestInfo) throw new AppError('Guest info required for guest checkout', 400);

    // Server-side price calculation
    const subtotal = items.reduce(
      (acc: number, item: { price: number; quantity: number }) => acc + item.price * item.quantity,
      0
    );
    const shippingCharge = subtotal >= SHIPPING.freeShippingThreshold ? 0 : SHIPPING.standardShippingCharge;
    const discount = 0; // Coupon applied in Phase 2
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
      couponCode,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending',
      expectedDelivery: delivery.to,
      timeline: [{ status: 'pending', message: 'Order placed', timestamp: new Date() }],
    });

    // Send confirmation email
    const recipientEmail = req.user ? shippingAddress.email : guestInfo?.email;
    const recipientName = shippingAddress.fullName;
    if (recipientEmail) {
      sendMail({
        to: recipientEmail,
        subject: `Order Confirmed — ${order.orderId} | MINARA`,
        html: orderConfirmationTemplate({
          name: recipientName,
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

    // Only allow owner or admin
    if (req.user?.role !== 'admin') {
      const isOwner = order.user?.toString() === req.user?.userId;
      if (!isOwner) throw new AppError('Unauthorized', 403);
    }

    res.json({ success: true, message: 'Order fetched', data: { order } });
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

    // Send shipped email
    const email = order.guestInfo?.email;
    const name = order.shippingAddress.fullName;
    if (email) {
      sendMail({
        to: email,
        subject: `Your MINARA order is shipped! 🚀 — ${order.orderId}`,
        html: orderShippedTemplate({ name, orderId: order.orderId, awbNumber }),
      }).catch(console.error);
    }

    res.json({ success: true, message: 'AWB number saved and order marked shipped', data: { order } });
  })
);

export default router;
