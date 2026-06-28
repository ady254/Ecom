'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '@minara/utils';

interface DemoProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  tags: string[];
}

const demoProducts: DemoProduct[] = [
  { _id: '1', name: 'Royal Saffron Gift Box', slug: 'royal-saffron-gift-box', price: 2499, comparePrice: 3200, images: [], averageRating: 4.9, reviewCount: 128, tags: ['bestseller'] },
  { _id: '2', name: 'Artisan Chocolate Hamper', slug: 'artisan-chocolate-hamper', price: 1899, comparePrice: 2500, images: [], averageRating: 4.8, reviewCount: 96, tags: ['new'] },
  { _id: '3', name: 'Wellness Ritual Set', slug: 'wellness-ritual-set', price: 3299, comparePrice: undefined, images: [], averageRating: 5.0, reviewCount: 64, tags: [] },
  { _id: '4', name: 'Luxury Tea Collection', slug: 'luxury-tea-collection', price: 1599, comparePrice: 2000, images: [], averageRating: 4.7, reviewCount: 203, tags: [] },
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-[var(--color-cream)]">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
              <span className="text-[var(--color-gold-dark)] text-xs tracking-[3px] uppercase font-medium">
                Handpicked For You
              </span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)]">
              Featured Gifts
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium tracking-widest uppercase text-[var(--color-navy)] border-b border-[var(--color-navy)] pb-0.5 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors self-start md:self-auto"
          >
            View All
          </Link>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {demoProducts.map((product, i) => {
            const discount = calculateDiscount(product.price, product.comparePrice);
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="product-card"
              >
                <div className="product-image-wrap">
                  {/* Placeholder image */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-cream-dark)]">
                    <span className="text-5xl opacity-30">🎁</span>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.tags.includes('bestseller') && (
                      <span className="badge badge-gold text-[10px]">Bestseller</span>
                    )}
                    {product.tags.includes('new') && (
                      <span className="badge badge-navy text-[10px]">New</span>
                    )}
                    {discount > 0 && (
                      <span className="badge text-[10px] bg-[rgba(239,68,68,0.1)] text-red-600">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Wishlist button */}
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                    aria-label="Add to wishlist"
                  >
                    <Heart size={14} />
                  </button>

                  {/* Hover overlay */}
                  <div className="product-overlay">
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex-1 py-2 px-3 bg-white text-[var(--color-navy)] text-xs font-semibold rounded text-center hover:bg-[var(--color-cream)] transition-colors"
                    >
                      Quick View
                    </Link>
                    <button
                      className="p-2 bg-[var(--color-gold)] text-[var(--color-navy)] rounded hover:bg-[var(--color-gold-dark)] transition-colors"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-heading text-base text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={11} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
                    <span className="text-xs text-gray-600">
                      {product.averageRating} ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--color-navy)]">
                      {formatCurrency(product.price)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatCurrency(product.comparePrice)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
