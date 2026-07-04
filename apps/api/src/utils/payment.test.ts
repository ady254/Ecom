import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature, verifyWebhookSignature } from './payment.js';

const KEY_SECRET = 'test_key_secret_for_unit_tests';
const WEBHOOK_SECRET = 'test_webhook_secret_for_unit_tests';

const sign = (data: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(data).digest('hex');

describe('verifyRazorpaySignature', () => {
  const orderId = 'order_MkWq1x2y3z';
  const paymentId = 'pay_NkXr4a5b6c';

  it('accepts a valid signature', () => {
    const signature = sign(`${orderId}|${paymentId}`, KEY_SECRET);
    expect(verifyRazorpaySignature(orderId, paymentId, signature, KEY_SECRET)).toBe(true);
  });

  it('rejects a signature made with the wrong secret', () => {
    const signature = sign(`${orderId}|${paymentId}`, 'attacker_secret');
    expect(verifyRazorpaySignature(orderId, paymentId, signature, KEY_SECRET)).toBe(false);
  });

  it('rejects a signature for a different payment (replay across orders)', () => {
    const signature = sign(`${orderId}|${paymentId}`, KEY_SECRET);
    expect(verifyRazorpaySignature('order_DIFFERENT', paymentId, signature, KEY_SECRET)).toBe(false);
    expect(verifyRazorpaySignature(orderId, 'pay_DIFFERENT', signature, KEY_SECRET)).toBe(false);
  });

  it('rejects garbage and empty signatures without throwing', () => {
    expect(verifyRazorpaySignature(orderId, paymentId, '', KEY_SECRET)).toBe(false);
    expect(verifyRazorpaySignature(orderId, paymentId, 'not-hex-at-all', KEY_SECRET)).toBe(false);
  });
});

describe('verifyWebhookSignature', () => {
  const body = Buffer.from(JSON.stringify({ event: 'payment.captured', payload: {} }));

  it('accepts a valid webhook signature over the raw body', () => {
    const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
    expect(verifyWebhookSignature(body, signature, WEBHOOK_SECRET)).toBe(true);
  });

  it('rejects when the body was tampered with', () => {
    const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
    const tampered = Buffer.from(body.toString().replace('captured', 'failed'));
    expect(verifyWebhookSignature(tampered, signature, WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects a signature from the wrong secret', () => {
    const signature = crypto.createHmac('sha256', 'wrong').update(body).digest('hex');
    expect(verifyWebhookSignature(body, signature, WEBHOOK_SECRET)).toBe(false);
  });
});
