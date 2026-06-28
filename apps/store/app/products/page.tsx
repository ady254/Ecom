import type { Metadata } from 'next';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '@minara/utils';
import { Heart, ShoppingBag, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Explore our complete collection of luxury gifts and premium gift sets.',
};

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  averageRating: number;
  reviewCount: number;
  tags: string[];
  category: string;
}

// Demo data — will be replaced with API fetch
const products: ProductItem[] = [
  { _id: '1', name: 'Royal Saffron Gift Box', slug: 'royal-saffron-gift-box', price: 2499, comparePrice: 3200, averageRating: 4.9, reviewCount: 128, tags: ['bestseller'], category: 'Gift Hampers' },
  { _id: '2', name: 'Artisan Chocolate Hamper', slug: 'artisan-chocolate-hamper', price: 1899, comparePrice: 2500, averageRating: 4.8, reviewCount: 96, tags: ['new'], category: 'Gift Hampers' },
  { _id: '3', name: 'Wellness Ritual Set', slug: 'wellness-ritual-set', price: 3299, comparePrice: undefined, averageRating: 5.0, reviewCount: 64, tags: [], category: 'Self-Care' },
  { _id: '4', name: 'Luxury Tea Collection', slug: 'luxury-tea-collection', price: 1599, comparePrice: 2000, averageRating: 4.7, reviewCount: 203, tags: [], category: 'Food & Beverage' },
  { _id: '5', name: 'Signature Candle Set', slug: 'signature-candle-set', price: 1299, comparePrice: undefined, averageRating: 4.9, reviewCount: 87, tags: [], category: 'Home' },
  { _id: '6', name: 'Heritage Dry Fruits Box', slug: 'heritage-dry-fruits-box', price: 2199, comparePrice: 2800, averageRating: 4.8, reviewCount: 154, tags: ['bestseller'], category: 'Food & Beverage' },
  { _id: '7', name: 'Rose Gold Jewelry Box', slug: 'rose-gold-jewelry-box', price: 3999, comparePrice: 5000, averageRating: 4.9, reviewCount: 43, tags: ['new'], category: 'Accessories' },
  { _id: '8', name: 'Corporate Prestige Set', slug: 'corporate-prestige-set', price: 4999, comparePrice: 6000, averageRating: 5.0, reviewCount: 31, tags: [], category: 'Corporate' },
];

export default function ProductsPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="section-container">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest mb-3">
            <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-navy)]">Products</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)]">
                All Collections
              </h1>
              <p className="text-gray-500 mt-2">{products.length} curated gifts</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[var(--color-gold)] hover:text-[var(--color-navy)] transition-all self-start md:self-auto">
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const discount = calculateDiscount(product.price, product.comparePrice);
            return (
              <div key={product._id} className="product-card">
                <div className="product-image-wrap">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-cream-dark)]">
                    <span className="text-5xl opacity-30">🎁</span>
                  </div>
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.tags.includes('bestseller') && (
                      <span className="badge badge-gold text-[10px]">Bestseller</span>
                    )}
                    {product.tags.includes('new') && (
                      <span className="badge badge-navy text-[10px]">New</span>
                    )}
                    {discount > 0 && (
                      <span className="badge text-[10px] bg-[rgba(239,68,68,0.1)] text-red-600">-{discount}%</span>
                    )}
                  </div>
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
                    <Heart size={14} />
                  </button>
                  <div className="product-overlay">
                    <Link href={`/products/${product.slug}`} className="flex-1 py-2 px-3 bg-white text-[var(--color-navy)] text-xs font-semibold rounded text-center hover:bg-[var(--color-cream)] transition-colors">
                      Quick View
                    </Link>
                    <button className="p-2 bg-[var(--color-gold)] text-[var(--color-navy)] rounded hover:bg-[var(--color-gold-dark)] transition-colors">
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[10px] text-[var(--color-gold-dark)] uppercase tracking-wider mb-1">{product.category}</div>
                  <Link href={`/products/${product.slug}`}>
                    <h2 className="font-heading text-base text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </h2>
                  </Link>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={11} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
                    <span className="text-xs text-gray-600">{product.averageRating} ({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--color-navy)]">{formatCurrency(product.price)}</span>
                    {product.comparePrice && (
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
