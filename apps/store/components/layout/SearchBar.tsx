'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, ArrowRight, Gift } from 'lucide-react';
import { formatCurrency } from '@minara/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ResultProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
}

/**
 * Hadiyah-style search bar: gold-bordered pill with a left magnifier icon and
 * live predictive results. Rendered full-width on mobile (16px font stops
 * Safari's focus zoom) and as a flexible center column on desktop.
 */
export default function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Debounced predictive search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`${API_URL}/products?search=${encodeURIComponent(q)}&limit=6`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((j) => {
          setResults(j.data?.products ?? []);
          setOpen(true);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const close = () => setOpen(false);

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <div className="relative">
          <Search
            size={mobile ? 17 : 16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gold-dark)] pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search For Gifts..."
            autoComplete="off"
            aria-label="Search for gifts"
            className={`w-full rounded-full border-[1.5px] border-[var(--color-gold)] bg-white outline-none placeholder:text-gray-400 text-[var(--color-navy)] focus:border-[var(--color-gold-dark)] focus:shadow-[0_0_0_3px_rgba(207,169,106,0.15)] transition-all [&::-webkit-search-cancel-button]:appearance-none ${
              mobile ? 'py-2.5 pl-11 pr-4 text-base' : 'py-2.5 pl-11 pr-4 text-sm'
            }`}
          />
          {loading && (
            <Loader2
              size={15}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-gold-dark)]"
            />
          )}
        </div>
      </form>

      {/* Predictive results dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50">
          {results.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400 text-center">
              No gifts found for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <>
              <ul className="max-h-[60vh] overflow-y-auto py-2">
                {results.map((p) => (
                  <li key={p._id}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-cream)] transition-colors"
                    >
                      <span className="relative w-11 h-11 rounded-lg overflow-hidden bg-[var(--color-cream)] shrink-0">
                        {p.images?.[0]?.url ? (
                          <Image
                            src={p.images[0].url}
                            alt={p.images[0].alt || p.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-lg"><Gift size={16} className="text-gray-300" strokeWidth={1.5} /></span>
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-[var(--color-navy)] truncate">
                          {p.name}
                        </span>
                        <span className="text-sm font-semibold text-[var(--color-gold-dark)]">
                          {formatCurrency(p.price)}
                        </span>
                        {p.comparePrice && p.comparePrice > p.price && (
                          <span className="text-xs text-gray-400 line-through ml-1.5">
                            {formatCurrency(p.comparePrice)}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={close}
                className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] bg-[var(--color-cream)] hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] transition-colors border-t border-gray-100"
              >
                View all results <ArrowRight size={12} />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
