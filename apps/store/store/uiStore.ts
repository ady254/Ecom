import { create } from 'zustand';

interface UIStore {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  /** True while the PDP's sticky mobile buy bar is on screen — floating
   *  widgets (WhatsApp) lift themselves above it. */
  stickyBarVisible: boolean;
  setStickyBarVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  stickyBarVisible: false,
  setStickyBarVisible: (visible) => set({ stickyBarVisible: visible }),
}));
