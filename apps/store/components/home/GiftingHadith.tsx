'use client';

import { motion } from 'framer-motion';

export default function GiftingHadith() {
  return (
    <section className="relative py-14 sm:py-20 bg-[var(--color-navy)] overflow-hidden">
      {/* Decorative gold glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse at center, rgba(207,169,106,0.12) 0%, transparent 65%)' }} />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="inline-block w-10 h-px bg-[var(--color-gold)] mb-6" />

          <p
            dir="rtl"
            className="text-[var(--color-gold)] text-3xl sm:text-4xl md:text-5xl leading-[1.9] mb-5"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            تَهَادَوْا تَحَابُّوا
          </p>

          <p className="font-heading italic text-white text-lg sm:text-xl md:text-2xl leading-relaxed mb-4">
            &ldquo;Exchange gifts, and you will love one another.&rdquo;
          </p>

          <p className="text-white/45 text-xs sm:text-sm tracking-wide">
            Prophet Muhammad ﷺ &nbsp;·&nbsp; Hadith, narrated by Abu Hurairah (RA), Al-Adab Al-Mufrad (Bukhari)
          </p>

          <span className="inline-block w-10 h-px bg-[var(--color-gold)] mt-6" />
        </motion.div>
      </div>
    </section>
  );
}
