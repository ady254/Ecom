import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '@minara/utils';
import ProductSidebar from '@/components/products/ProductSidebar';
import AddToCartButton from '@/components/products/AddToCartButton';
import WishlistButton from '@/components/products/WishlistButton';

export const metadata: Metadata = {
  title: 'All Collections',
  description: 'Explore our complete collection of luxury gifts and premium gift sets.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const PAGE_SIZE = 12;

interface ProductImage { url: string; alt?: string; }
interface Product {
  _id: string; name: string; slug: string;
  price: number; comparePrice?: number;
  images: ProductImage[];
  averageRating: number; reviewCount: number;
  tags: string[]; category?: { name: string; slug: string }; stock: number;
}
interface Category { _id: string; name: string; slug: string; }

async function fetchProducts(params: Record<string, string>) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products?${qs}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const j = await res.json();
    return j as { data: { products: Product[] }; pagination: { total: number; page: number; pages: number } };
  } catch { return null; }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const j = await res.json();
    return j.data?.categories ?? [];
  } catch { return []; }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const getString = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : '');

  const page = Math.max(1, Number(getString('page')) || 1);
  const params: Record<string, string> = { limit: String(PAGE_SIZE), page: String(page) };
  if (getString('category')) params.category = getString('category');
  if (getString('search')) params.search = getString('search');
  if (getString('minPrice')) params.minPrice = getString('minPrice');
  if (getString('maxPrice')) params.maxPrice = getString('maxPrice');
  if (getString('sort')) params.sort = getString('sort');
  if (getString('tags')) params.tags = getString('tags');
  if (getString('isFeatured')) params.isFeatured = getString('isFeatured');

  const [result, categories] = await Promise.all([fetchProducts(params), fetchCategories()]);
  const products = result?.data?.products ?? [];
  const total = result?.pagination?.total ?? 0;
  const totalPages = result?.pagination?.pages ?? 1;

  return (
    <div className="pb-20 pt-8">
      <div className="section-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <ChevronRight size={11} />
          <span className="text-[var(--color-navy)] font-medium">All Collections</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)]">
            {getString('category')
              ? categories.find((c) => c.slug === getString('category'))?.name ?? 'Products'
              : getString('isFeatured') === 'true'
                ? 'Featured Gifts'
                : 'All Collections'}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {result === null
              ? 'Could not connect — make sure the API is running'
              : `${total} curated ${total === 1 ? 'gift' : 'gifts'}`}
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <Suspense fallback={<div className="hidden md:block w-56 shrink-0" />}>
            <ProductSidebar categories={categories} />
          </Suspense>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🎁</p>
                <p className="text-gray-400 text-lg mb-2">
                  {result === null ? 'Could not connect to the store' : 'No products match your filters'}
                </p>
                <Link href="/products" className="text-sm text-[var(--color-gold-dark)] hover:underline">
                  View all products
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {products.map((product) => {
                    const discount = calculateDiscount(product.price, product.comparePrice);
                    const image = product.images?.[0];
                    return (
                      <div key={product._id} className="product-card group">
                        <div className="product-image-wrap">
                          {image?.url ? (
                            <Image
                              src={image.url}
                              alt={image.alt || product.name}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
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

                          <WishlistButton productId={product._id} className="absolute top-3 right-3" />

                          <div className="product-overlay">
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex-1 py-2 px-3 bg-white text-[var(--color-navy)] text-xs font-semibold rounded text-center hover:bg-[var(--color-cream)] transition-colors"
                            >
                              View Details
                            </Link>
                            <AddToCartButton
                              product={{ _id: product._id, name: product.name, slug: product.slug, price: product.price, image: image?.url ?? '' }}
                              iconOnly
                            />
                          </div>
                        </div>

                        <div className="p-4">
                          {product.category && (
                            <div className="text-[10px] text-[var(--color-gold-dark)] uppercase tracking-wider mb-1">
                              {product.category.name}
                            </div>
                          )}
                          <Link href={`/products/${product.slug}`}>
                            <h2 className="font-heading text-base text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] transition-colors line-clamp-2 mb-2">
                              {product.name}
                            </h2>
                          </Link>
                          {product.reviewCount > 0 && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <Star size={10} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
                              <span className="text-xs text-gray-500">{product.averageRating} ({product.reviewCount})</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--color-navy)] text-sm">{formatCurrency(product.price)}</span>
                            {product.comparePrice && (
                              <span className="text-xs text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={`/products?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                        className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-full text-sm hover:border-[var(--color-gold)] transition-colors"
                      >
                        <ChevronLeft size={14} /> Prev
                      </Link>
                    )}
                    <span className="text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
                    {page < totalPages && (
                      <Link
                        href={`/products?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                        className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-full text-sm hover:border-[var(--color-gold)] transition-colors"
                      >
                        Next <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
