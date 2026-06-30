import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  slug: string;
  variant?: Record<string, string>;
}

function variantKey(v?: Record<string, string>): string {
  return JSON.stringify(v ?? {});
}

function isSameItem(a: CartItem, productId: string, variant?: Record<string, string>): boolean {
  return a.productId === productId && variantKey(a.variant) === variantKey(variant);
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variant?: Record<string, string>) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => isSameItem(i, item.productId, item.variant));
          if (existing) {
            return {
              items: state.items.map((i) =>
                isSameItem(i, item.productId, item.variant)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter((i) => !isSameItem(i, productId, variant)),
        }));
      },

      updateQuantity: (productId, quantity, variant) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            isSameItem(i, productId, variant) ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'minara-cart',
    }
  )
);
