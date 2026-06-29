import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { Star, Heart } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '@minara/utils';
import ProductFilters from '@/components/products/ProductFilters';
import AddToCartButton from '@/components/products/AddToCartButton';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Explore our complete collection of luxury gifts and premium gift sets.',
};

interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: ProductImage[];
  ratings?: { averageRating: number; reviewCount: number };
  tags: string[];
  category?: { name: string; slug: string };
  stock: number;
}

interface ApiResponse {
  data: {
    products: Product[];
    total: number;
    page: number;
    pages: number;
  };
}

async function fetchProducts(params: Record<string, string>): Promise<ApiResponse['data'] | null> {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products?${query}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json: ApiResponse = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const params: Record<string, string> = {};
  if (sp.category && typeof sp.category === 'string') params.category = sp.category;
  if (sp.search && typeof sp.search === 'string') params.search = sp.search;
  if (sp.minPrice && typeof sp.minPrice === 'string') params.minPrice = sp.minPrice;
  if (sp.maxPrice && typeof sp.maxPrice === 'string') params.maxPrice = sp.maxPrice;
  if (sp.sort && typeof sp.sort === 'string') params.sort = sp.sort;
  if (sp.page && typeof sp.page === 'string') params.page = sp.page;
  params.limit = '12';

  const data = await fetchProducts(params);
  const products = data?.products ?? [];
  const total = data?.total ?? 0;

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
              <p className="text-gray-500 mt-2">
                {total > 0 ? `${total} curated gifts` : data === null ? 'Unable to load products' : 'No products found'}
              </p>
            </div>
            <Suspense fallback={null}>
              <ProductFilters />
            </Suspense>
          </div>
        </div>

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="text-center py-24">
            {data === null ? (
              <>
                <p className="text-gray-400 text-lg mb-2">Could not connect to the store</p>
                <p className="text-gray-300 text-sm">Make sure the API server is running on port 5000</p>
              </>
            ) : (
              <p className="text-gray-400 text-lg">No products match your filters</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const discount = calculateDiscount(product.price, product.comparePrice);
              const image = product.images?.[0];
              return (
                <div key={product._id} className="product-card">
                  <div className="product-image-wrap">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.alt || product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-cream-dark)]">
                        <span className="text-5xl opacity-30">🎁</span>
                      </div>
                    )}
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
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex-1 py-2 px-3 bg-white text-[var(--color-navy)] text-xs font-semibold rounded text-center hover:bg-[var(--color-cream)] transition-colors"
                      >
                        Quick View
                      </Link>
                      <AddToCartButton
                        product={{
                          _id: product._id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          image: image?.url ?? '',
                        }}
                        iconOnly
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] text-[var(--color-gold-dark)] uppercase tracking-wider mb-1">
                      {product.category?.name ?? ''}
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      <h2 className="font-heading text-base text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] transition-colors line-clamp-2 mb-2">
                        {product.name}
                      </h2>
                    </Link>
                    {product.ratings && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Star size={11} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
                        <span className="text-xs text-gray-600">
                          {product.ratings.averageRating} ({product.ratings.reviewCount})
                        </span>
                      </div>
                    )}
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
        )}
      </div>
    </div>
  );
}
