'use client';

import { motion } from 'framer-motion';
import { Package, RefreshCw, Shield, Truck } from 'lucide-react';

const badges = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹999' },
  { icon: Shield, title: 'Secure Payments', desc: 'Razorpay encrypted' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Package, title: 'Gift Wrapping', desc: 'Complimentary on all orders' },
];

export default function TrustBadges() {
  return (
    <section className="py-10 bg-[var(--color-cream)]">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-[var(--shadow-soft)]"
            >
              <div className="w-10 h-10 rounded-full bg-[rgba(207,169,106,0.12)] flex items-center justify-center shrink-0">
                <badge.icon size={18} className="text-[var(--color-gold-dark)]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--color-navy)]">{badge.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{badge.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
