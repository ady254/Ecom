'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface CategoryItem {
  name: string;
  slug: string;
  image: string;
}

interface CategoryGroup {
  title: string;
  items: CategoryItem[];
}

const categoryGroups: CategoryGroup[] = [
  {
    title: 'Faith Inspired Gifts',
    items: [
      {
        name: 'Janamaz',
        slug: 'janamaz',
        image: '/categories/janamaz.png',
      },
      {
        name: 'Rehel',
        slug: 'rehel',
        image: '/categories/rehel.png',
      },
      {
        name: 'Velvet Quran',
        slug: 'velvet-quran',
        image: '/categories/velvet-quran.svg',
      },
      {
        name: 'Tasbee cards',
        slug: 'tasbee-cards',
        image: '/categories/tasbee-cards.png',
      },
    ],
  },
  {
    title: 'Unique Gifts',
    items: [
      {
        name: 'Keychains',
        slug: 'keychains',
        image: '/categories/keychains.png',
      },
      {
        name: 'Fridge magnets',
        slug: 'fridge-magnets',
        image: '/categories/fridge-magnets.png',
      },
      {
        name: 'Car Hangings',
        slug: 'car-hangings',
        image: '/categories/car-hangings.png',
      },
      {
        name: 'Kids prayer mat',
        slug: 'kids-prayer-mat',
        image: '/categories/kids-prayer-mat.webp',
      },
    ],
  },
];

export default function OccasionSection() {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section className="bg-[#FAF8F5] py-12 md:py-16 border-b border-gray-100/60 overflow-hidden">
      <div className="section-container max-w-6xl mx-auto px-4 sm:px-6">
        {categoryGroups.map((group, groupIdx) => (
          <div key={group.title} className={groupIdx > 0 ? 'mt-12 md:mt-16' : ''}>
            {/* Header with elegant side lines */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 md:mb-12">
              <div className="w-12 sm:w-24 md:w-36 h-[1.5px] bg-[#3B5242]/30 rounded-full" />
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#2C382E] tracking-wide text-center">
                {group.title}
              </h2>
              <div className="w-12 sm:w-24 md:w-36 h-[1.5px] bg-[#3B5242]/30 rounded-full" />
            </div>

            {/* Circle Category Items */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 md:gap-10 justify-items-center">
              {group.items.map((item, idx) => {
                const isFailed = failedImages[item.slug];
                const isSvg = item.image.endsWith('.svg');

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="w-full"
                  >
                    <Link
                      href={`/products?category=${item.slug}`}
                      className="group flex flex-col items-center cursor-pointer text-center"
                    >
                      {/* Circle Background & Image Container */}
                      <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-[#EFE5D3] p-2 sm:p-2.5 md:p-3 transition-all duration-300 ease-out border border-[#E2D2B8] shadow-sm group-hover:shadow-[0_12px_28px_rgba(207,169,106,0.35)] group-hover:-translate-y-2 group-hover:border-[var(--color-gold)] overflow-hidden flex items-center justify-center">
                        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#FAF6EE]">
                          {!isFailed ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              unoptimized={isSvg}
                              sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 176px"
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                              onError={() => {
                                setFailedImages((prev) => ({ ...prev, [item.slug]: true }));
                              }}
                            />
                          ) : (
                            <Image
                              src={`/categories/${item.slug}.svg`}
                              alt={item.name}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            />
                          )}
                        </div>
                      </div>

                      {/* Category Title */}
                      <span className="mt-3 sm:mt-4 font-serif text-base sm:text-lg md:text-xl text-[#2D3830] group-hover:text-[var(--color-gold-dark)] transition-colors duration-300 font-normal leading-snug">
                        {item.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
