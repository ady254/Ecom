'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '@minara/utils';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';

interface ProductImage { url: string; alt?: string; }
interface Product {
  _id: string; name: string; slug: string;
  price: number; comparePrice?: number;
  images: ProductImage[];
  averageRating: number; reviewCount: number;
  tags: string[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  const { toggle, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetch(`${BASE}/products?isFeatured=true&limit=8`)
      .then((r) => r.json())
      .then((j) => setProducts(j.data?.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-[var(--color-cream)]">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8">
            <div className="skeleton h-8 w-48 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white">
                <div className="skeleton aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-8 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-[var(--color-cream)]">
      <div className="section-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-[var(--color-gold-dark)] text-xs font-semibold tracking-[3px] uppercase mb-1.5">
              Handpicked For You
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-navy)]">
              Bestselling Gifts
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] transition-colors shrink-0"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => {
            const discount = calculateDiscount(product.price, product.comparePrice);
            const image = product.images?.[0];
            const wishlisted = isInWishlist(product._id);

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-cream)]">
                  {image?.url ? (
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl opacity-20">🎁</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {product.tags.includes('bestseller') && (
                      <span className="badge badge-gold text-[9px] px-2 py-0.5">Bestseller</span>
                    )}
                    {product.tags.includes('new') && (
                      <span className="badge badge-navy text-[9px] px-2 py-0.5">New</span>
                    )}
                    {discount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Wishlist */}
                  <button
                    onClick={() => {
                      toggle(product._id);
                      toast(isInWishlist(product._id) ? 'Removed from wishlist' : 'Added to wishlist!', {
                        icon: isInWishlist(product._id) ? '💔' : '❤️',
                      });
                    }}
                    className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors ${
                      wishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                    }`}
                  >
                    <Heart size={13} className={wishlisted ? 'fill-red-500' : ''} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3.5 flex flex-col flex-1">
                  <Link href={`/products/${product.slug}`} className="flex-1 mb-3">
                    <h3 className="text-sm font-semibold text-[var(--color-navy)] line-clamp-2 leading-snug hover:text-[var(--color-gold-dark)] transition-colors">
                      {product.name}
                    </h3>
                    {product.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star
                            key={s}
                            size={9}
                            className={s <= Math.round(product.averageRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200 fill-gray-200'}
                          />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-0.5">({product.reviewCount})</span>
                      </div>
                    )}
                  </Link>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base font-bold text-[var(--color-navy)]">
                        {formatCurrency(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">
                          {formatCurrency(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        addItem({
                          productId: product._id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          image: image?.url ?? '',
                          quantity: 1,
                        });
                        openCart();
                        toast.success('Added to cart!');
                      }}
                      className="flex items-center gap-1.5 bg-[var(--color-navy)] text-white text-[11px] font-semibold px-3 py-2 rounded-full hover:bg-[var(--color-navy-light)] transition-colors shrink-0"
                    >
                      <ShoppingCart size={11} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-navy)] text-white text-sm font-semibold rounded-full"
          >
            View All Gifts <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
