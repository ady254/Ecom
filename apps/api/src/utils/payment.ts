import crypto from 'crypto';

const timingSafeEqualHex = (aHex: string, b: string): boolean => {
  const a = Buffer.from(aHex);
  const bBuf = Buffer.from(b);
  if (a.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(a, bBuf);
};

/**
 * Verify the checkout signature Razorpay returns to the browser:
 * HMAC-SHA256(`${orderId}|${paymentId}`) with the key secret.
 */
export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  keySecret: string
): boolean => {
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return timingSafeEqualHex(expected, signature);
};

/**
 * Verify a Razorpay webhook: HMAC-SHA256 of the RAW request body with the
 * webhook secret, sent in the `x-razorpay-signature` header.
 */
export const verifyWebhookSignature = (
  rawBody: Buffer | string,
  signature: string,
  webhookSecret: string
): boolean => {
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return timingSafeEqualHex(expected, signature);
};
