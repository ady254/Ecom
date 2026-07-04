import { OrderModel, IOrder } from './order.model.js';
import { UserModel } from '../users/user.model.js';
import { releaseStock, releaseCoupon, toPaise } from './order.pricing.js';
import { getRazorpay } from '../../config/razorpay.js';
import {
  sendMail,
  orderConfirmationTemplate,
  orderCancelledTemplate,
} from '../../config/email.js';

export const resolveOrderEmail = async (
  order: Pick<IOrder, 'guestInfo' | 'user'>
): Promise<string | undefined> => {
  if (order.guestInfo?.email) return order.guestInfo.email;
  if (order.user) {
    const user = await UserModel.findById(order.user).select('email').lean();
    return user?.email;
  }
  return undefined;
};

export const sendOrderConfirmationEmail = async (order: IOrder): Promise<void> => {
  const email = await resolveOrderEmail(order);
  if (!email) return;
  sendMail({
    to: email,
    subject: `Order Confirmed — ${order.orderId} | MINARA`,
    html: orderConfirmationTemplate({
      name: order.shippingAddress.fullName,
      orderId: order.orderId,
      total: order.total,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    }),
  }).catch(console.error);
};

/**
 * Mark an order as paid. Idempotent: the atomic filter means concurrent
 * calls (browser confirm + webhook) can only transition it once, so the
 * confirmation email is sent exactly once.
 */
export const markOrderPaid = async (
  orderId: string,
  razorpayPaymentId: string
): Promise<IOrder | null> => {
  const order = await OrderModel.findOneAndUpdate(
    { orderId, paymentStatus: { $ne: 'paid' } },
    {
      $set: { paymentStatus: 'paid', razorpayPaymentId },
      $push: {
        timeline: { status: 'confirmed', message: 'Payment received', timestamp: new Date() },
      },
    },
    { new: true }
  );
  if (order) {
    if (order.status === 'pending') {
      order.status = 'confirmed';
      await order.save();
    }
    await sendOrderConfirmationEmail(order);
  }
  return order;
};

export interface CancelOptions {
  reason: string;
  /** Skip the customer email (used by the stale-payment sweeper). */
  silent?: boolean;
}

/**
 * Cancel an order: atomically claims the status transition (so the sweeper,
 * the customer and an admin can't double-cancel), restores stock, releases
 * the coupon use, and auto-refunds a captured Razorpay payment.
 * Returns null if the order was not in a cancellable state.
 */
export const cancelOrder = async (
  order: IOrder,
  { reason, silent }: CancelOptions
): Promise<IOrder | null> => {
  const claimed = await OrderModel.findOneAndUpdate(
    { _id: order._id, status: { $in: ['pending', 'confirmed'] } },
    {
      $set: { status: 'cancelled' },
      $push: { timeline: { status: 'cancelled', message: reason, timestamp: new Date() } },
    },
    { new: true }
  );
  if (!claimed) return null;

  // Return reserved inventory and the coupon use to the pool
  await releaseStock(
    claimed.items.map((i) => ({ product: String(i.product), quantity: i.quantity }))
  );
  await releaseCoupon(claimed.couponCode);

  // Auto-refund captured online payments
  if (claimed.paymentStatus === 'paid' && claimed.razorpayPaymentId) {
    try {
      const razorpay = getRazorpay();
      await razorpay.payments.refund(claimed.razorpayPaymentId, {
        amount: toPaise(claimed.total),
        speed: 'normal',
        notes: { orderId: claimed.orderId, reason },
      });
      claimed.paymentStatus = 'refunded';
      claimed.timeline.push({
        status: 'refunded',
        message: 'Payment refunded to original payment method (5-7 business days)',
        timestamp: new Date(),
      });
      await claimed.save();
    } catch (err) {
      console.error(`Refund failed for ${claimed.orderId}:`, err);
      claimed.timeline.push({
        status: 'cancelled',
        message: 'Automatic refund failed — manual refund required',
        timestamp: new Date(),
      });
      await claimed.save();
    }
  }

  if (!silent) {
    const email = await resolveOrderEmail(claimed);
    if (email) {
      sendMail({
        to: email,
        subject: `Order Cancelled — ${claimed.orderId} | MINARA`,
        html: orderCancelledTemplate({
          name: claimed.shippingAddress.fullName,
          orderId: claimed.orderId,
          reason,
        }),
      }).catch(console.error);
    }
  }

  return claimed;
};

/**
 * Cancel Razorpay orders whose payment was never completed (browser closed,
 * card declined, …) so their reserved stock returns to the shop. Runs from
 * a periodic sweeper in server.ts.
 */
export const sweepStaleUnpaidOrders = async (olderThanMinutes = 30): Promise<number> => {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
  const stale = await OrderModel.find({
    paymentMethod: 'razorpay',
    paymentStatus: { $in: ['pending', 'failed'] },
    status: 'pending',
    createdAt: { $lt: cutoff },
  });

  let cancelled = 0;
  for (const order of stale) {
    const result = await cancelOrder(order, {
      reason: 'Payment was not completed — order expired',
      silent: true,
    });
    if (result) cancelled++;
  }
  if (cancelled > 0) console.log(`🧹 Sweeper: cancelled ${cancelled} stale unpaid order(s)`);
  return cancelled;
};
