'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Gem,
  Gift,
  Moon,
  Scroll,
  Pencil,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CollectionItem {
  name: string;
  slug: string;
  href: string;
  icon: LucideIcon;
}

const collections: CollectionItem[] = [
  {
    name: 'Quran Sets',
    slug: 'quran-sets',
    href: '/products?category=quran-sets',
    icon: BookOpen,
  },
  {
    name: 'Wedding Gifts',
    slug: 'wedding-gifts',
    href: '/products?category=wedding-gifts',
    icon: Gem,
  },
  {
    name: 'Gift Hampers',
    slug: 'gift-hampers',
    href: '/products?category=gift-hampers',
    icon: Gift,
  },
  {
    name: 'Return Gifts',
    slug: 'hajj-favours',
    href: '/products?category=hajj-favours',
    icon: Moon,
  },
  {
    name: 'Tasbih Cards',
    slug: 'tasbih-cards',
    href: '/products?category=tasbih-cards',
    icon: Scroll,
  },
  {
    name: 'Personalised',
    slug: 'personalised',
    href: '/products?category=personalised',
    icon: Pencil,
  },
  {
    name: 'New Arrivals',
    slug: 'new-arrivals',
    href: '/products?sort=newest',
    icon: Sparkles,
  },
];

export default function ShopByCollection() {
  return (
    <section className="py-8 sm:py-12 bg-[#FAF8F5] border-b border-gray-100">
      <div className="section-container max-w-6xl mx-auto px-4">
        {/* Header Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xs sm:text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-[#B8904A]">
            Shop By Collection
          </h2>
        </div>

        {/* Collection items wrap */}
        <div className="flex flex-wrap justify-center items-start gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {collections.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
              >
                <Link
                  href={item.href}
                  className="group flex flex-col items-center cursor-pointer text-center w-[72px] sm:w-24 md:w-28"
                >
                  {/* Circle Icon Badge */}
                  <div className="
                    w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 lg:w-24 lg:h-24
                    rounded-full bg-[#FAF5EE]
                    border border-[#E5D7BF]
                    flex items-center justify-center
                    shadow-[0_2px_8px_rgba(0,0,0,0.03)]
                    transition-all duration-300 ease-out
                    group-hover:scale-105
                    group-hover:border-[var(--color-gold)]
                    group-hover:bg-[#FAF0E1]
                    group-hover:shadow-[0_8px_20px_rgba(207,169,106,0.25)]
                  ">
                    <IconComponent
                      strokeWidth={1.3}
                      className="
                        w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9
                        text-[#B8904A]
                        group-hover:text-[var(--color-gold-dark)]
                        transition-colors duration-300
                      "
                    />
                  </div>

                  {/* Label */}
                  <span className="
                    mt-2 sm:mt-3
                    text-[11px] sm:text-xs md:text-sm
                    font-normal text-gray-700
                    text-center leading-tight
                    group-hover:text-[var(--color-navy)]
                    transition-colors duration-300
                  ">
                    {item.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
