'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Gift, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const SEEN_KEY = 'minara-offer-popup-seen';
const SHOW_DELAY_MS = 5000;
const COUNTDOWN_SECONDS = 15 * 60;
const COUPON_CODE = 'WELCOME10';

// Never interrupt someone who is paying or reviewing an order
const SUPPRESSED_PATHS = ['/checkout', '/orders'];

/**
 * Hadiyah-style first-visit offer popup: shows once per visitor after a short
 * delay, with a countdown timer for urgency and a copyable coupon code.
 */
export default function OfferPopup() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (SUPPRESSED_PATHS.some((p) => pathname.startsWith(p))) return;
    if (localStorage.getItem(SEEN_KEY)) return;

    const timer = setTimeout(() => {
      localStorage.setItem(SEEN_KEY, String(Date.now()));
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
    // Intentionally only on first mount — navigating shouldn't restart the delay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown tick
  useEffect(() => {
    if (!open || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [open, secondsLeft]);

  const close = useCallback(() => setOpen(false), []);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  const copyCode = () => {
    navigator.clipboard
      .writeText(COUPON_CODE)
      .then(() => toast.success(`${COUPON_CODE} copied — paste it at checkout!`))
      .catch(() => toast(`Use code ${COUPON_CODE} at checkout`));
  };

  const shopNow = () => {
    copyCode();
    close();
    router.push('/products');
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label="First order discount offer"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              {/* Header band */}
              <div className="relative bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-dark,#071830)] px-8 pt-8 pb-10 text-center">
                <button
                  onClick={close}
                  aria-label="Close offer"
                  className="absolute top-3 right-3 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={17} />
                </button>
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40 flex items-center justify-center">
                  <Gift size={24} className="text-[var(--color-gold)]" />
                </div>
                <p className="text-[var(--color-gold)] text-[10px] font-semibold tracking-[3px] uppercase mb-2 flex items-center justify-center gap-1.5">
                  <Sparkles size={11} /> Exclusive Welcome Offer
                </p>
                <h2 className="font-heading text-3xl text-white leading-tight">
                  10% Off Your
                  <br />
                  First Order
                </h2>
              </div>

              <div className="px-8 py-6 text-center">
                {/* Coupon code */}
                <button
                  onClick={copyCode}
                  className="w-full flex items-center justify-center gap-2.5 border-2 border-dashed border-[var(--color-gold)] bg-[var(--color-cream)] rounded-xl py-3.5 mb-4 group transition-colors hover:bg-[var(--color-gold)]/10"
                  aria-label={`Copy coupon code ${COUPON_CODE}`}
                >
                  <span className="font-mono text-lg font-bold tracking-[3px] text-[var(--color-navy)]">
                    {COUPON_CODE}
                  </span>
                  <Copy size={15} className="text-[var(--color-gold-dark)] group-hover:scale-110 transition-transform" />
                </button>

                {/* Countdown */}
                <p className="text-xs text-gray-400 mb-1.5">Offer reserved for you for</p>
                <div className="flex items-center justify-center gap-1.5 mb-5" aria-live="polite">
                  <span className="min-w-[44px] py-1.5 rounded-lg bg-[var(--color-navy)] text-white font-mono font-bold text-lg">
                    {mm}
                  </span>
                  <span className="text-[var(--color-navy)] font-bold">:</span>
                  <span className="min-w-[44px] py-1.5 rounded-lg bg-[var(--color-navy)] text-white font-mono font-bold text-lg">
                    {ss}
                  </span>
                </div>

                <button
                  onClick={shopNow}
                  className="w-full py-3.5 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-sm font-bold tracking-widest uppercase hover:bg-[var(--color-gold-dark)] transition-colors"
                >
                  Shop Gifts Now
                </button>
                <button
                  onClick={close}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  No thanks, maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
