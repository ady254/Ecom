'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Gift, Sparkles, Lock, Banknote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useCodEligibility } from '@/hooks/useCodEligibility';
import { formatCurrency } from '@minara/utils';

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 99;

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  // This drawer is mounted on every page, so only look COD up while it's open.
  const { codAllowed } = useCodEligibility(cartOpen ? items.map((i) => i.productId) : []);

  const sub = subtotal();
  const freeShipping = sub >= FREE_SHIPPING_THRESHOLD;
  const shipping = freeShipping ? 0 : (items.length > 0 ? SHIPPING_CHARGE : 0);
  const total = sub + shipping;
  const progress = Math.min((sub / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap effect
  useEffect(() => {
    if (!cartOpen) return;
    const focusableElements = drawerRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select'
    );
    if (!focusableElements || focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus the first element when drawer opens (e.g., close button or link)
    setTimeout(() => firstElement?.focus(), 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} className="text-[var(--color-navy)]" />
                <h2 className="font-heading text-xl text-[var(--color-navy)]">Your Cart</h2>
                {items.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-[10px] font-bold flex items-center justify-center">
                    {items.reduce((a, i) => a + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-[var(--color-cream)] flex items-center justify-center">
                  <Gift size={36} className="text-gray-300" />
                </div>
                <div>
                  <p className="font-heading text-xl text-[var(--color-navy)] mb-1">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add some beautiful gifts to get started</p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-navy)] text-white text-sm font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors"
                >
                  Explore Gifts <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="px-6 py-3 bg-[var(--color-cream)]">
                  {freeShipping ? (
                    <p className="text-xs text-emerald-600 font-medium text-center">
                      🎉 You have free shipping!
                    </p>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        Add <span className="font-semibold text-[var(--color-navy)]">{formatCurrency(FREE_SHIPPING_THRESHOLD - sub)}</span> more for free shipping
                      </p>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[var(--color-gold)] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                  {items.map((item) => (
                    <div key={`${item.productId}-${JSON.stringify(item.variant ?? {})}`} className="flex gap-4">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--color-cream)] shrink-0 relative"
                      >
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl"><Gift size={20} className="text-gray-300" strokeWidth={1.5} /></div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-[var(--color-navy)] line-clamp-2 hover:text-[var(--color-gold-dark)] transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.variant && Object.keys(item.variant).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.variant).map(([label, value]) => (
                              <span key={label} className="inline-flex items-center gap-1 text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">
                                <Sparkles size={8} />
                                {label}: <strong>{value}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-[var(--color-navy)] mt-1">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors text-gray-500"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors text-gray-500"
                          >
                            <Plus size={10} />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.variant)}
                            className="ml-auto p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 pt-5 pb-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatCurrency(sub)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className={freeShipping ? 'text-emerald-600 font-medium' : ''}>
                        {freeShipping ? 'Free' : formatCurrency(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-[var(--color-navy)] text-base pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--color-navy)] text-white font-semibold tracking-wider rounded-full hover:bg-[var(--color-navy-light)] transition-all duration-300 hover:shadow-lg"
                  >
                    Checkout · {formatCurrency(total)}
                    <ArrowRight size={16} />
                  </Link>

                  {/* Trust microcopy — reduces last-second hesitation */}
                  <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Lock size={10} /> Secure checkout
                    </span>
                    <span className="flex items-center gap-1">
                      <Banknote size={10} /> {codAllowed ? 'COD available' : 'Prepaid only'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gift size={10} /> Gift-wrapped free
                    </span>
                  </div>

                  <button
                    onClick={closeCart}
                    className="w-full text-center text-sm text-gray-400 hover:text-[var(--color-navy)] transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
