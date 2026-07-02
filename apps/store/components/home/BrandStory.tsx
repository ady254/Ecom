'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const stats = [
  { num: 500,  suffix: '+',   label: 'Curated Gifts' },
  { num: 4200, suffix: '+',   label: 'Orders Delivered' },
  { num: 4.9,  suffix: ' ★',  label: 'Average Rating', decimal: 1 },
  { num: 48,   suffix: ' hrs', label: 'Avg. Delivery Time' },
];

function CountUp({ target, suffix, decimal = 0 }: { target: number; suffix: string; decimal?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {decimal > 0 ? value.toFixed(decimal) : Math.round(value).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function BrandStory() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Watermark signature */}
      <p
        aria-hidden="true"
        className="pointer-events-none select-none absolute right-0 sm:-right-4 lg:right-0 top-1/2 -translate-y-1/2 -rotate-3 whitespace-nowrap leading-none z-0"
        style={{
          fontFamily: 'var(--font-signature)',
          color: 'rgba(207, 169, 106, 0.16)',
          fontSize: 'clamp(4.5rem, 13vw, 13rem)',
        }}
      >
        Minara
      </p>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Stats side */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' }}
                className="bg-[var(--color-cream)] rounded-2xl p-6 border border-[rgba(207,169,106,0.2)] hover:border-[rgba(207,169,106,0.5)] hover:shadow-[0_4px_20px_rgba(207,169,106,0.1)] transition-all duration-200"
              >
                <div className="font-heading text-3xl md:text-4xl text-[var(--color-navy)] mb-1">
                  <CountUp target={s.num} suffix={s.suffix} decimal={s.decimal} />
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Copy side */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <p className="text-[var(--color-gold-dark)] text-xs font-semibold tracking-[3px] uppercase mb-4">
              Our Story
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-navy)] mb-5 leading-tight">
              Every Gift Is a<br />
              <span className="italic">Personal Touch</span>
            </h2>
            <div className="w-10 h-0.5 bg-[var(--color-gold)] mb-6" />
            <p className="text-gray-500 leading-relaxed mb-4 text-[15px]">
              At MINARA, we believe a great gift is more than a product — it&rsquo;s a memory. We handpick every item in our collection for quality, beauty, and meaning.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8 text-[15px]">
              From Nikkah celebrations to Hajj return favours, Quran sets to Tasbih cards for little ones — each gift is packed with care, shipped fast, and arrives ready to delight.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[var(--color-navy)] text-white text-sm font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors group"
            >
              Shop Now
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
