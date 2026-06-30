'use client';

import { Package, RefreshCw, Shield, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const badges: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'On orders above ₹999 — Pan India',
  },
  {
    icon: Shield,
    title: '100% Secure Payments',
    desc: 'Razorpay 256-bit SSL encryption',
  },
  {
    icon: Package,
    title: 'Premium Gift Wrapping',
    desc: 'Every order packed beautifully',
  },
  {
    icon: RefreshCw,
    title: 'Easy 7-Day Returns',
    desc: 'Hassle-free return & refund policy',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
                className="
                  group flex items-start gap-3
                  bg-[var(--color-cream)] rounded-xl p-4
                  border border-[rgba(207,169,106,0.18)]
                  hover:border-[rgba(207,169,106,0.5)]
                  hover:shadow-[0_4px_20px_rgba(207,169,106,0.12)]
                  hover:-translate-y-0.5
                  transition-all duration-200
                "
              >
                <div className="
                  w-10 h-10 rounded-full shrink-0
                  bg-white border border-[rgba(207,169,106,0.3)]
                  flex items-center justify-center
                  group-hover:border-[var(--color-gold)]
                  group-hover:bg-[rgba(207,169,106,0.06)]
                  transition-all duration-200
                ">
                  <Icon
                    size={17}
                    strokeWidth={1.5}
                    className="text-[var(--color-gold-dark)] group-hover:text-[var(--color-gold)] transition-colors duration-200"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-navy)] leading-snug">
                    {b.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
