import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';

const router = Router();

function getRazorpay() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError('Razorpay is not configured on this server', 503);
  }
  return new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
}

// POST /api/v1/payments/razorpay/create-order
router.post(
  '/razorpay/create-order',
  asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw new AppError('Valid amount is required', 400);

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `rzp_${Date.now()}`,
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID,
      },
    });
  })
);

// POST /api/v1/payments/razorpay/verify
router.post(
  '/razorpay/verify',
  asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new AppError('Missing payment verification fields', 400);
    }
    if (!env.RAZORPAY_KEY_SECRET) throw new AppError('Razorpay not configured', 503);

    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature) throw new AppError('Invalid payment signature', 400);

    res.json({ success: true, message: 'Payment verified' });
  })
);

export default router;
