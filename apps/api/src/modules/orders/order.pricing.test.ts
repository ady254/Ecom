import { describe, it, expect } from 'vitest';
import {
  round2,
  toPaise,
  computeShipping,
  resolveUnitPrice,
  computeCouponDiscount,
  createOrderSchema,
} from './order.pricing.js';
import { SHIPPING } from '@minara/config';
import { generateOrderId } from '@minara/utils';

describe('money math', () => {
  it('round2 rounds to 2 decimal places', () => {
    expect(round2(10.005)).toBe(10.01);
    expect(round2(999.999)).toBe(1000);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });

  it('toPaise converts rupees to integer paise (what Razorpay charges)', () => {
    expect(toPaise(499)).toBe(49900);
    expect(toPaise(1099.5)).toBe(109950);
    expect(Number.isInteger(toPaise(123.456))).toBe(true);
  });
});

describe('computeShipping', () => {
  it('is free at or above the threshold', () => {
    expect(computeShipping(SHIPPING.freeShippingThreshold)).toBe(0);
    expect(computeShipping(SHIPPING.freeShippingThreshold + 1)).toBe(0);
  });

  it('charges standard shipping below the threshold', () => {
    expect(computeShipping(SHIPPING.freeShippingThreshold - 1)).toBe(SHIPPING.standardShippingCharge);
    expect(computeShipping(0)).toBe(SHIPPING.standardShippingCharge);
  });
});

describe('resolveUnitPrice', () => {
  const product = {
    price: 500,
    variants: [
      { name: 'Size', options: [{ label: 'Small' }, { label: 'Large', price: 750 }] },
    ],
  };

  it('uses the base price when no variant is chosen', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveUnitPrice(product as any)).toBe(500);
  });

  it('uses the variant option price when the admin set one', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveUnitPrice(product as any, { Size: 'Large' })).toBe(750);
  });

  it('falls back to base price for options without a price', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveUnitPrice(product as any, { Size: 'Small' })).toBe(500);
  });

  it('ignores unknown variant selections', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveUnitPrice(product as any, { Size: 'DoesNotExist' })).toBe(500);
  });
});

describe('computeCouponDiscount', () => {
  it('percentage coupon with maxDiscount cap', () => {
    const coupon = { type: 'percentage' as const, value: 20, maxDiscount: 150 };
    expect(computeCouponDiscount(coupon, 500)).toBe(100); // 20% of 500
    expect(computeCouponDiscount(coupon, 2000)).toBe(150); // capped
  });

  it('fixed coupon never exceeds the subtotal', () => {
    const coupon = { type: 'fixed' as const, value: 300, maxDiscount: undefined };
    expect(computeCouponDiscount(coupon, 1000)).toBe(300);
    expect(computeCouponDiscount(coupon, 200)).toBe(200); // clamped — no negative totals
  });
});

describe('createOrderSchema — the client can never set prices', () => {
  const validBody = {
    items: [{ product: 'a1b2c3d4e5f6a7b8c9d0e1f2', quantity: 2 }],
    shippingAddress: {
      fullName: 'Test Customer',
      phone: '9876543210',
      addressLine1: '12 MG Road',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500064',
      country: 'India',
    },
    paymentMethod: 'cod',
    guestInfo: { name: 'Test', email: 'Test@Example.com', phone: '9876543210' },
  };

  it('accepts a valid order and strips any client-sent price fields', () => {
    const withPriceInjection = {
      ...validBody,
      items: [{ ...validBody.items[0], price: 0.01, name: 'hacked', total: 1 }],
      subtotal: 1,
      total: 1,
      discount: 99999,
    };
    const result = createOrderSchema.safeParse(withPriceInjection);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0]).not.toHaveProperty('price');
      expect(result.data.items[0]).not.toHaveProperty('total');
      expect(result.data).not.toHaveProperty('subtotal');
      expect(result.data).not.toHaveProperty('total');
      expect(result.data).not.toHaveProperty('discount');
      expect(result.data.guestInfo?.email).toBe('test@example.com'); // normalized
    }
  });

  it('rejects invalid product ids, zero/negative/huge quantities', () => {
    const cases = [
      { product: 'not-an-objectid', quantity: 1 },
      { product: validBody.items[0].product, quantity: 0 },
      { product: validBody.items[0].product, quantity: -3 },
      { product: validBody.items[0].product, quantity: 9999 },
      { product: validBody.items[0].product, quantity: 1.5 },
    ];
    for (const item of cases) {
      expect(createOrderSchema.safeParse({ ...validBody, items: [item] }).success).toBe(false);
    }
  });

  it('rejects non-serviceable states and malformed pincodes/phones', () => {
    const bad = (patch: object) =>
      createOrderSchema.safeParse({
        ...validBody,
        shippingAddress: { ...validBody.shippingAddress, ...patch },
      }).success;
    expect(bad({ state: 'Atlantis' })).toBe(false);
    expect(bad({ pincode: '12345' })).toBe(false);
    expect(bad({ phone: '1234567890' })).toBe(false); // must start 6-9
  });
});

describe('generateOrderId', () => {
  it('matches the MIN-YYYY-XXXXXXXXXX format', () => {
    const id = generateOrderId();
    expect(id).toMatch(/^MIN-\d{4}-[A-HJ-NP-Z2-9]{10}$/);
  });

  it('produces no collisions across 50k IDs (collision-safe at real volume)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50_000; i++) seen.add(generateOrderId());
    expect(seen.size).toBe(50_000);
  });
});
