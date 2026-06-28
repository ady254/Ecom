import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  productIds: string[];
  toggle: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) => {
        set((state) => {
          const exists = state.productIds.includes(productId);
          return {
            productIds: exists
              ? state.productIds.filter((id) => id !== productId)
              : [...state.productIds, productId],
          };
        });
      },

      isInWishlist: (productId) => get().productIds.includes(productId),

      clear: () => set({ productIds: [] }),
    }),
    {
      name: 'minara-wishlist',
    }
  )
);
