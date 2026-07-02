'use client';

import { Search, ShoppingBag, PackageCheck } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const steps: { num: string; title: string; desc: string; icon: LucideIcon }[] = [
  {
    num: '01',
    title: 'Browse & Pick',
    desc: 'Explore handpicked Islamic gifts across 8 collections. Filter by price, category, or occasion.',
    icon: Search,
  },
  {
    num: '02',
    title: 'Place Your Order',
    desc: 'Pay securely via UPI, cards, or cash on delivery. Your order is confirmed instantly.',
    icon: ShoppingBag,
  },
  {
    num: '03',
    title: 'We Pack & Ship',
    desc: 'Beautifully wrapped and dispatched within 24 hours. Delivered pan-India with tracking.',
    icon: PackageCheck,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HowItWorks() {
  return (
    <section className="py-16 bg-[var(--color-navy)]">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[var(--color-gold)] text-[10px] font-semibold tracking-[3px] uppercase mb-3">
            Simple. Reliable. Beautiful.
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-white">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Desktop connector line */}
          <div className="hidden md:block absolute top-[34px] left-[calc(16.6%+2rem)] right-[calc(16.6%+2rem)] h-px bg-gradient-to-r from-transparent via-[rgba(207,169,106,0.3)] to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                variants={itemVariants}
                className="relative flex flex-col items-center text-center"
              >
                {/* Icon bubble */}
                <div className="relative z-10 mb-6">
                  {/* Outer ring */}
                  <div className="w-[68px] h-[68px] rounded-full border border-[rgba(207,169,106,0.25)] flex items-center justify-center">
                    {/* Inner filled circle */}
                    <div className="w-[52px] h-[52px] rounded-full bg-[rgba(207,169,106,0.1)] border border-[rgba(207,169,106,0.35)] flex items-center justify-center group-hover:bg-[rgba(207,169,106,0.2)] transition-colors">
                      <Icon
                        size={22}
                        strokeWidth={1.5}
                        className="text-[var(--color-gold)]"
                      />
                    </div>
                  </div>
                </div>

                <span className="text-[var(--color-gold)] text-[10px] font-bold tracking-[3px] uppercase mb-2">
                  Step {step.num}
                </span>
                <h3 className="font-heading text-xl text-white mb-2.5">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-[220px]">{step.desc}</p>

                {/* Mobile connector */}
                {i < steps.length - 1 && (
                  <div className="md:hidden w-px h-8 bg-gradient-to-b from-[rgba(207,169,106,0.4)] to-transparent mt-6" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
