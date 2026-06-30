'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const categories = [
  { name: 'Quran Sets', slug: 'quran', emoji: '📖', desc: 'Beautifully crafted Qurans' },
  { name: 'Wedding Gifts', slug: 'wedding', emoji: '💍', desc: 'Celebrate love & Nikkah' },
  { name: 'Gift Hampers', slug: 'hamper', emoji: '🎁', desc: 'Curated luxury sets' },
  { name: 'Hajj Return Gifts', slug: 'hajj', emoji: '🕋', desc: 'Blessed return favours' },
  { name: 'Tasbih Cards', slug: 'tasbih', emoji: '📿', desc: 'For kids & little ones' },
  { name: 'Home Decor', slug: 'homedecor', emoji: '🏡', desc: 'Islamic home accents' },
  { name: 'Personalised', slug: 'personalised', emoji: '🖋️', desc: 'Made just for them' },
  { name: 'All Gifts', slug: '', emoji: '✨', desc: 'Browse everything' },
];

export default function FeaturedCategories() {
  return (
    <section className="py-16 bg-[var(--color-cream)]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
            <span className="text-[var(--color-gold-dark)] text-xs tracking-[3px] uppercase font-medium">
              Explore Our Range
            </span>
            <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)]">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={cat.slug ? `/products?tags=${cat.slug}` : '/products'}
                className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white border-2 border-transparent hover:border-[var(--color-gold-light)] hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-cream)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-navy)] group-hover:text-[var(--color-gold-dark)] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
