'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Loader2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@minara/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  stock: number;
}

export default function WishlistPage() {
  const { productIds, toggle } = useWishlistStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || productIds.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    Promise.all(
      productIds.map((id) =>
        fetch(`${API_URL}/products/${id}`)
          .then((r) => r.json())
          .then((j) => j.success ? j.data.product as Product : null)
          .catch(() => null)
      )
    )
      .then((results) => setProducts(results.filter(Boolean) as Product[]))
      .finally(() => setLoading(false));
  }, [mounted, productIds]);

  const handleRemove = (productId: string, name: string) => {
    toggle(productId);
    toast('Removed from wishlist', { icon: '💔' });
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url ?? '',
      slug: product.slug,
      quantity: 1,
    });
    toast.success('Added to cart!');
  };

  if (!mounted) return null;

  return (
    <div className="pb-20 pt-8">
      <div className="section-container max-w-5xl">
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-2">
            My Wishlist
          </h1>
          {productIds.length > 0 && (
            <p className="text-gray-400 text-sm">{productIds.length} saved gift{productIds.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[var(--color-navy)]" />
          </div>
        )}

        {!loading && productIds.length === 0 && (
          <div className="text-center py-24">
            <Heart size={56} className="mx-auto mb-5 text-gray-200" />
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Your wishlist is empty</h2>
            <p className="text-gray-400 text-sm mb-8">Save gifts you love and come back to them anytime</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-navy)] text-white rounded-full text-sm font-semibold hover:bg-[var(--color-navy-light)] transition-colors"
            >
              Explore Gifts
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((product) => (
              <div key={product._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-[var(--color-cream)] overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                  )}
                </Link>
                <div className="p-3 md:p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-sm font-medium text-[var(--color-navy)] line-clamp-2 mb-1 hover:text-[var(--color-gold-dark)]">{product.name}</h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-semibold text-[var(--color-navy)]">{formatCurrency(product.price)}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag size={12} />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleRemove(product._id, product.name)}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={14} className="text-red-400 fill-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
