import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Shield, Truck, RefreshCw, ChevronRight } from 'lucide-react';
import { formatCurrency, calculateDiscount, calculateEstimatedDelivery, formatDeliveryDate } from '@minara/utils';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductImageGallery from '@/components/products/ProductImageGallery';

interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: ProductImage[];
  ratings?: { averageRating: number; reviewCount: number };
  tags: string[];
  category?: { name: string; slug: string };
  stock: number;
  sku?: string;
  weight?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.product ?? json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) notFound();

  const discount = calculateDiscount(product.price, product.comparePrice);
  const delivery = calculateEstimatedDelivery();
  const deliveryDate = `${formatDeliveryDate(delivery.from)} – ${formatDeliveryDate(delivery.to)}`;
  const mainImage = product.images[0];

  return (
    <div className="pt-24 pb-20">
      <div className="section-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[var(--color-gold)] transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-[var(--color-gold)] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-[var(--color-navy)]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Left — Image Gallery */}
          <ProductImageGallery images={product.images} productName={product.name} />

          {/* Right — Product Info */}
          <div className="flex flex-col">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.includes('bestseller') && (
                <span className="badge badge-gold text-xs px-3 py-1">Bestseller</span>
              )}
              {product.tags.includes('new') && (
                <span className="badge badge-navy text-xs px-3 py-1">New Arrival</span>
              )}
              {product.category && (
                <span className="text-xs text-[var(--color-gold-dark)] uppercase tracking-widest">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl md:text-4xl text-[var(--color-navy)] leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.ratings && product.ratings.reviewCount > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= Math.round(product.ratings!.averageRating)
                          ? 'text-[var(--color-gold)] fill-[var(--color-gold)]'
                          : 'text-gray-200 fill-gray-200'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.ratings.averageRating} · {product.ratings.reviewCount} reviews
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-gray-100">
              <span className="font-heading text-3xl text-[var(--color-navy)]">
                {formatCurrency(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {discount}% off
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 leading-relaxed mb-6">{product.shortDescription}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-emerald-700 font-medium">
                    {product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Add to Cart */}
            {product.stock > 0 && (
              <div className="mb-6">
                <AddToCartButton
                  product={{
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: mainImage?.url ?? '',
                  }}
                />
              </div>
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck size={18} className="text-[var(--color-gold)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-navy)]">Free Delivery</p>
                  <p className="text-[10px] text-gray-400">Est. {deliveryDate}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Shield size={18} className="text-[var(--color-gold)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-navy)]">Secure Payment</p>
                  <p className="text-[10px] text-gray-400">100% protected</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <RefreshCw size={18} className="text-[var(--color-gold)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-navy)]">Easy Returns</p>
                  <p className="text-[10px] text-gray-400">7-day policy</p>
                </div>
              </div>
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="mt-4 text-xs text-gray-400">SKU: {product.sku}</p>
            )}
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="mt-16 max-w-3xl">
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-4">Product Description</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}
