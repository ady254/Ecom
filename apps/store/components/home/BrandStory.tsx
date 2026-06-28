'use client';

import { motion } from 'framer-motion';

export default function BrandStory() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl bg-gradient-navy flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 60% 30%, rgba(207,169,106,0.5) 0%, transparent 60%)',
                }}
              />
              <div className="text-center relative z-10">
                <div className="font-heading text-7xl text-[var(--color-gold)] opacity-30 tracking-[12px]">M</div>
                <p className="text-white/40 text-xs tracking-[6px] uppercase mt-4">Since 2024</p>
              </div>
            </div>
            {/* Decorative square */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-xl border-2 border-[var(--color-gold-light)] opacity-40" />
          </motion.div>

          {/* Copy side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
              <span className="text-[var(--color-gold-dark)] text-xs tracking-[3px] uppercase font-medium">
                Our Story
              </span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-6 leading-tight">
              Luxury Gifting,<br />
              <em>Reimagined</em>
            </h2>
            <div className="w-12 h-0.5 bg-gradient-gold mb-8" />
            <p className="text-gray-600 leading-relaxed mb-5">
              At MINARA, we believe every gift tells a story. We curate experiences that go beyond the ordinary — selecting only the finest products, wrapped in elegance, delivered with care.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              From intimate birthdays to grand corporate gestures, our collections are thoughtfully crafted to leave a lasting impression. Because the people you gift deserve nothing less than extraordinary.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--color-cream-dark)]">
              {[
                { num: '500+', label: 'Curated Products' },
                { num: '2000+', label: 'Happy Customers' },
                { num: '4.9★', label: 'Avg. Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading text-2xl text-[var(--color-navy)]">{stat.num}</div>
                  <div className="text-xs text-gray-400 tracking-wide uppercase mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
