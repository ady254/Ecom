'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Gift Hampers', slug: 'gift-hampers', emoji: '🎁', desc: 'Curated luxury sets' },
  { name: 'Corporate Gifts', slug: 'corporate', emoji: '🏢', desc: 'Impress your team' },
  { name: 'Birthday Specials', slug: 'birthday', emoji: '🎂', desc: 'Make it memorable' },
  { name: 'Wedding Gifts', slug: 'wedding', emoji: '💍', desc: 'Celebrate love' },
  { name: 'Festive Specials', slug: 'festive', emoji: '✨', desc: 'Season\'s joy' },
  { name: 'Self-Care Sets', slug: 'self-care', emoji: '🌿', desc: 'Pure indulgence' },
];

export default function FeaturedCategories() {
  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
            <span className="text-[var(--color-gold-dark)] text-xs tracking-[3px] uppercase font-medium">
              Curated For Every Occasion
            </span>
            <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)]">
            Shop by Category
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/categories/${cat.slug}`}
                className="group block relative overflow-hidden rounded-xl bg-[var(--color-cream)] border border-transparent hover:border-[var(--color-gold-light)] transition-all duration-300 hover-lift p-6 md:p-8"
              >
                {/* Emoji */}
                <div className="text-4xl mb-4">{cat.emoji}</div>
                {/* Content */}
                <h3 className="font-heading text-xl md:text-2xl text-[var(--color-navy)] mb-1">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{cat.desc}</p>
                {/* Arrow */}
                <div className="flex items-center gap-1 text-[var(--color-gold-dark)] text-sm font-medium group-hover:gap-2 transition-all">
                  Shop Now
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                {/* Hover gold accent */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
