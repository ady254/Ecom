import { describe, it, expect, vi, beforeEach } from 'vitest';
import { priceOrderItems } from './order.pricing.js';

// priceOrderItems reads products straight from Mongo; stub the model so the COD
// gate can be exercised without a database. vi.hoisted lets the mock factory —
// which vitest lifts above the imports — reach this spy.
const { find } = vi.hoisted(() => ({ find: vi.fn() }));
vi.mock('../products/product.model.js', () => ({
  ProductModel: { find },
}));

type ProductRow = {
  _id: string;
  name: string;
  price: number;
  isActive: boolean;
  images: { url: string }[];
  variants: never[];
  codAvailable?: boolean;
};

const mockProducts = (rows: ProductRow[]) => {
  find.mockReturnValue({ lean: () => Promise.resolve(rows) });
};

const product = (over: Partial<ProductRow> & { _id: string; name: string }): ProductRow => ({
  price: 500,
  isActive: true,
  images: [{ url: 'https://img/1.jpg' }],
  variants: [],
  ...over,
});

const line = (id: string) => ({ product: id, quantity: 1 });

beforeEach(() => find.mockReset());

describe('priceOrderItems — COD eligibility', () => {
  it('reports nothing when every product allows COD', async () => {
    mockProducts([product({ _id: 'a1', name: 'Gift Box', codAvailable: true })]);
    const { codIneligible } = await priceOrderItems([line('a1')]);
    expect(codIneligible).toEqual([]);
  });

  it('names the product when the admin has switched COD off', async () => {
    mockProducts([product({ _id: 'a1', name: 'Engraved Frame', codAvailable: false })]);
    const { codIneligible } = await priceOrderItems([line('a1')]);
    expect(codIneligible).toEqual(['Engraved Frame']);
  });

  it('treats products saved before the flag existed as COD-eligible', async () => {
    mockProducts([product({ _id: 'a1', name: 'Legacy Product' })]); // codAvailable undefined
    const { codIneligible } = await priceOrderItems([line('a1')]);
    expect(codIneligible).toEqual([]);
  });

  it('blocks a mixed cart on the strength of one prepaid-only item', async () => {
    mockProducts([
      product({ _id: 'a1', name: 'Gift Box', codAvailable: true }),
      product({ _id: 'a2', name: 'Engraved Frame', codAvailable: false }),
    ]);
    const { codIneligible } = await priceOrderItems([line('a1'), line('a2')]);
    expect(codIneligible).toEqual(['Engraved Frame']);
  });

  it('lists each blocking product once, even across repeated lines', async () => {
    mockProducts([
      product({ _id: 'a1', name: 'Frame', codAvailable: false }),
      product({ _id: 'a2', name: 'Vase', codAvailable: false }),
    ]);
    const { codIneligible } = await priceOrderItems([
      { product: 'a1', quantity: 1, variant: { Size: 'S' } },
      { product: 'a1', quantity: 2, variant: { Size: 'L' } },
      line('a2'),
    ]);
    expect(codIneligible).toEqual(['Frame', 'Vase']);
  });

  it('still prices the order normally while flagging COD', async () => {
    mockProducts([product({ _id: 'a1', name: 'Frame', price: 250, codAvailable: false })]);
    const { subtotal, pricedItems } = await priceOrderItems([{ product: 'a1', quantity: 2 }]);
    expect(subtotal).toBe(500);
    expect(pricedItems[0]).toMatchObject({ name: 'Frame', price: 250, quantity: 2 });
  });
});
