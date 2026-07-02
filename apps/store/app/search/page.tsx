'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '@minara/utils';
import WishlistButton from '@/components/products/WishlistButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  ratings?: { averageRating: number; reviewCount: number };
  tags?: string[];
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(!!initialQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProducts([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(q)}&limit=24`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products);
        setTotal(json.pagination?.total || json.data.products.length);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      router.replace(`/search?${params.toString()}`, { scroll: false });
      fetchProducts(query.trim());
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchProducts, router]);

  // Run on initial load if query already in URL
  useEffect(() => {
    if (initialQ) fetchProducts(initialQ);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pb-20 pt-8">
      <div className="section-container max-w-5xl">
        {/* Search header */}
        <div className="mb-10 text-center">
          <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-3">
            Search Gifts
          </h1>
          <p className="text-gray-400 text-sm">Find the perfect gift for every occasion</p>
        </div>

        {/* Search input */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, occasion, category…"
            autoFocus
            className="w-full pl-14 pr-12 py-4 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:border-[var(--color-gold)] transition-colors bg-white shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[var(--color-navy)]" />
          </div>
        )}

        {!loading && hasSearched && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {total > 0
                  ? <><span className="font-semibold text-[var(--color-navy)]">{total}</span> result{total !== 1 ? 's' : ''} for &quot;{searchParams.get('q')}&quot;</>
                  : <>No results for &quot;{searchParams.get('q')}&quot;</>}
              </p>
              {products.length > 0 && (
                <Link href={`/products?search=${encodeURIComponent(query)}`} className="flex items-center gap-1.5 text-xs text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] font-medium">
                  <SlidersHorizontal size={13} /> Filter & Sort
                </Link>
              )}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-5">🔍</p>
                <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">No gifts found</h2>
                <p className="text-gray-400 text-sm mb-8">Try a different keyword or browse our collections</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-navy)] text-white rounded-full text-sm font-semibold hover:bg-[var(--color-navy-light)] transition-colors"
                >
                  Browse All Gifts
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {products.map((product) => (
                  <div key={product._id} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="relative aspect-square bg-[var(--color-cream)] overflow-hidden">
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
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="text-sm font-medium text-[var(--color-navy)] line-clamp-2 mb-1">{product.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-[var(--color-navy)]">{formatCurrency(product.price)}</span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-xs text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <WishlistButton productId={product._id} className="absolute top-2.5 right-2.5" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !hasSearched && (
          <div className="text-center py-16 text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">Start typing to search gifts…</p>
          </div>
        )}
      </div>
    </div>
  );
}
