'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
}

const PRICE_RANGES = [
  { label: 'Under ₹500', min: '', max: '500' },
  { label: '₹500 – ₹1,500', min: '500', max: '1500' },
  { label: '₹1,500 – ₹3,000', min: '1500', max: '3000' },
  { label: '₹3,000 – ₹5,000', min: '3000', max: '5000' },
  { label: 'Above ₹5,000', min: '5000', max: '' },
];

const POPULAR_TAGS = ['bestseller', 'new', 'sale', 'hamper', 'wedding', 'birthday', 'corporate', 'festive', 'organic', 'premium'];

const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-averageRating', label: 'Top Rated' },
];

export default function ProductSidebar({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentCategory = searchParams.get('category') ?? '';
  const currentSort = searchParams.get('sort') ?? '';
  const currentMin = searchParams.get('minPrice') ?? '';
  const currentMax = searchParams.get('maxPrice') ?? '';
  const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];

  const setParam = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') params.delete(k);
      else params.set(k, v);
    });
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleTag = (tag: string) => {
    const next = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setParam({ tags: next.length ? next.join(',') : null });
  };

  const clearAll = () => router.push(pathname);

  const hasFilters = currentCategory || currentSort || currentMin || currentMax || currentTags.length;

  const SidebarContent = () => (
    <div className="space-y-7">
      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors font-medium"
        >
          <X size={12} /> Clear all filters
        </button>
      )}

      {/* Sort */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sort By</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam({ sort: opt.value || null })}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                currentSort === opt.value
                  ? 'bg-[var(--color-navy)] text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category</h3>
          <div className="space-y-1">
            <button
              onClick={() => setParam({ category: null })}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                !currentCategory ? 'bg-[var(--color-navy)] text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setParam({ category: cat.slug === currentCategory ? null : cat.slug })}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  currentCategory === cat.slug
                    ? 'bg-[var(--color-navy)] text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</h3>
        <div className="space-y-1">
          <button
            onClick={() => setParam({ minPrice: null, maxPrice: null })}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !currentMin && !currentMax ? 'bg-[var(--color-navy)] text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Any Price
          </button>
          {PRICE_RANGES.map((r) => {
            const active = currentMin === r.min && currentMax === r.max;
            return (
              <button
                key={r.label}
                onClick={() => setParam({ minPrice: r.min || null, maxPrice: r.max || null })}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  active ? 'bg-[var(--color-navy)] text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 capitalize ${
                currentTags.includes(tag)
                  ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-navy)] font-semibold'
                  : 'border-gray-200 text-gray-500 hover:border-[var(--color-gold)] hover:text-[var(--color-gold-dark)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[var(--color-gold)] transition-colors"
        >
          <SlidersHorizontal size={15} />
          Filters {hasFilters ? `(${[currentCategory, currentSort, currentMin || currentMax, currentTags.length ? '1' : ''].filter(Boolean).length})` : ''}
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg text-[var(--color-navy)]">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-24">
          <h2 className="font-heading text-lg text-[var(--color-navy)] mb-5">Filters</h2>
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
