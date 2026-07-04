import { Router, Request, Response } from 'express';
import { OrderModel } from '../orders/order.model.js';
import { markOrderPaid, resolveOrderEmail } from '../orders/order.lifecycle.js';
import { toPaise } from '../orders/order.pricing.js';
import { verifyWebhookSignature } from '../../utils/payment.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { sendMail, paymentFailedTemplate } from '../../config/email.js';

const router = Router();

interface RazorpayWebhookPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Razorpay webhook — the authoritative signal that money moved. Even if the
 * customer's browser dies right after paying, this still marks the order paid.
 *
 * Mounted in app.ts with express.raw() BEFORE the JSON body parser, because
 * the signature is an HMAC of the exact raw bytes Razorpay sent.
 */
export const razorpayWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    console.error('Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured');
    res.status(503).json({ success: false });
    return;
  }

  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body as Buffer;
  if (typeof signature !== 'string' || !Buffer.isBuffer(rawBody)) {
    res.status(400).json({ success: false, message: 'Bad request' });
    return;
  }
  if (!verifyWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)) {
    res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    return;
  }

  const event = JSON.parse(rawBody.toString('utf8'));
  const payment: RazorpayWebhookPayment | undefined = event?.payload?.payment?.entity;

  switch (event.event) {
    case 'payment.captured': {
      if (!payment) break;
      const order = await OrderModel.findOne({ razorpayOrderId: payment.order_id });
      if (!order || order.paymentStatus === 'paid') break; // unknown or already handled

      if (payment.amount !== toPaise(order.total) || payment.currency !== 'INR') {
        console.error(
          `⚠️ Webhook amount mismatch for ${order.orderId}: expected ${toPaise(order.total)}, got ${payment.amount} ${payment.currency}`
        );
        break;
      }
      await markOrderPaid(order.orderId, payment.id);
      break;
    }

    case 'payment.failed': {
      if (!payment) break;
      const order = await OrderModel.findOneAndUpdate(
        { razorpayOrderId: payment.order_id, paymentStatus: 'pending' },
        {
          $set: { paymentStatus: 'failed' },
          $push: {
            timeline: { status: 'pending', message: 'Payment attempt failed', timestamp: new Date() },
          },
        },
        { new: true }
      );
      if (order) {
        const email = await resolveOrderEmail(order);
        if (email) {
          sendMail({
            to: email,
            subject: 'Payment Failed — MINARA',
            html: paymentFailedTemplate({ name: order.shippingAddress.fullName }),
          }).catch(console.error);
        }
      }
      break;
    }

    case 'refund.processed': {
      if (!payment) break;
      await OrderModel.findOneAndUpdate(
        { razorpayPaymentId: payment.id, paymentStatus: { $ne: 'refunded' } },
        {
          $set: { paymentStatus: 'refunded' },
          $push: {
            timeline: { status: 'refunded', message: 'Refund processed by Razorpay', timestamp: new Date() },
          },
        }
      );
      break;
    }

    default:
      break; // Acknowledge events we don't handle
  }

  res.json({ success: true });
});

export default router;
