import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Truck, Gift, RotateCcw, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '@minara/utils';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import PDPClient from '@/components/products/PDPClient';
import ProductReviews from '@/components/products/ProductReviews';

interface ProductImage { url: string; alt?: string; }
interface CustomField { label: string; placeholder?: string; required?: boolean; }
interface Product {
  _id: string; name: string; slug: string;
  description: string; shortDescription?: string;
  price: number; comparePrice?: number;
  images: ProductImage[];
  averageRating: number; reviewCount: number;
  tags: string[]; category?: { _id: string; name: string; slug: string };
  stock: number; sku?: string; weight?: number;
  isCustomizable?: boolean;
  customFields?: CustomField[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchProduct(slug: string): Promise<{ product: Product; soldLast24h: number } | null> {
  try {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.data?.product) return null;
    return { product: json.data.product, soldLast24h: json.data.soldLast24h ?? 0 };
  } catch { return null; }
}

async function fetchRelated(categoryId: string, excludeId: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?category=${categoryId}&limit=5`, { cache: 'no-store' });
    if (!res.ok) return [];
    const j = await res.json();
    return (j.data?.products ?? []).filter((p: Product) => p._id !== excludeId).slice(0, 4);
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchProduct(slug);
  if (!result) return { title: 'Product Not Found' };
  const { product } = result;
  return {
    title: product.name,
    description: product.shortDescription || product.description?.slice(0, 160),
    openGraph: { images: product.images[0] ? [{ url: product.images[0].url }] : [] },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await fetchProduct(slug);
  if (!result) notFound();
  const { product, soldLast24h } = result;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://minara.in';
  const discount = calculateDiscount(product.price, product.comparePrice);
  const related = product.category ? await fetchRelated(product.category._id, product._id) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description?.slice(0, 200),
    image: product.images.map((img) => img.url),
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { '@type': 'Brand', name: 'MINARA' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.slug}`,
      seller: { '@type': 'Organization', name: 'MINARA' },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  // Delivery timeline dates
  const today = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const day2 = new Date(today); day2.setDate(today.getDate() + 1);
  const day4 = new Date(today); day4.setDate(today.getDate() + 4);

  // Real sales from the orders collection — the badge only shows when
  // customers actually bought this product in the last 24 hours.
  const soldCount = soldLast24h;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="pb-20 pt-6">
      <div className="section-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <ChevronRight size={11} />
          <Link href="/products" className="hover:text-[var(--color-gold)] transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight size={11} />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-[var(--color-gold)] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={11} />
          <span className="text-[var(--color-navy)] font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Two-column product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          <ProductImageGallery images={product.images} productName={product.name} />

          <PDPClient
            product={{
              _id: product._id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              comparePrice: product.comparePrice,
              images: product.images,
              averageRating: product.averageRating,
              reviewCount: product.reviewCount,
              tags: product.tags,
              category: product.category,
              stock: product.stock,
              sku: product.sku,
              shortDescription: product.shortDescription,
              isCustomizable: product.isCustomizable,
              customFields: product.customFields,
            }}
            discount={discount}
            soldCount={soldCount}
            deliverySteps={[
              { label: 'Order Today', date: fmt(today) },
              { label: 'Customization', date: fmt(day2) },
              { label: 'Dispatched', date: fmt(day4) },
            ]}
          />
        </div>

        {/* Below the fold */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Accordions */}
          <div className="lg:col-span-2 space-y-0">
            <AccordionSection title="Product Description" defaultOpen>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                {product.description}
              </div>
            </AccordionSection>

            <AccordionSection title="Additional Information">
              <div className="space-y-2 text-sm text-gray-600">
                {product.sku && <p><span className="font-medium text-gray-700">SKU:</span> {product.sku}</p>}
                {product.weight && <p><span className="font-medium text-gray-700">Weight:</span> {product.weight}g</p>}
                {product.category && <p><span className="font-medium text-gray-700">Category:</span> {product.category.name}</p>}
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-medium text-gray-700">Tags:</span>
                    {product.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </AccordionSection>

            <AccordionSection title="Shipping & Return Policy">
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-start gap-2"><Truck size={16} className="shrink-0 mt-0.5 text-[var(--color-gold-dark)]" /><span><span className="font-medium text-gray-700">Free Delivery</span> on orders above ₹999. Standard delivery in 4–7 business days.</span></p>
                <p className="flex items-start gap-2"><Gift size={16} className="shrink-0 mt-0.5 text-[var(--color-gold-dark)]" /><span><span className="font-medium text-gray-700">Premium Packaging</span> — Every order comes beautifully wrapped at no extra cost.</span></p>
                <p className="flex items-start gap-2"><RotateCcw size={16} className="shrink-0 mt-0.5 text-[var(--color-gold-dark)]" /><span><span className="font-medium text-gray-700">Easy Replacement</span> — 10-day replacement for damaged or defective items.</span></p>
                <p className="flex items-start gap-2"><Phone size={16} className="shrink-0 mt-0.5 text-[var(--color-gold-dark)]" /><span><span className="font-medium text-gray-700">Support</span> — Reach us via WhatsApp or email for any concerns.</span></p>
                <p className="text-xs text-gray-400 mt-2">Personalized/customized orders are non-refundable unless the product arrives damaged.</p>
              </div>
            </AccordionSection>
          </div>

          {/* Trust sidebar */}
          <div>
            <div className="bg-[var(--color-cream)] rounded-2xl p-6 border border-[rgba(207,169,106,0.2)]">
              <p className="text-xs font-semibold text-[var(--color-navy)] uppercase tracking-wider mb-4">Why Shop With Us</p>
              {[
                { Icon: Truck, t: 'Free Delivery', s: 'On orders above ₹999' },
                { Icon: RotateCcw, t: '10 Days Replacement', s: 'Damaged or defective items' },
                { Icon: Gift, t: 'Premium Packaging', s: 'Beautifully wrapped' },
                { Icon: Lock, t: 'Secured Payment', s: '100% safe checkout' },
                { Icon: CheckCircle2, t: 'Safe Delivery', s: 'Guaranteed safe arrival' },
              ].map((item) => (
                <div key={item.t} className="flex items-start gap-3 py-3 border-b border-[rgba(207,169,106,0.15)] last:border-0">
                  <item.Icon size={18} strokeWidth={1.75} className="shrink-0 text-[var(--color-gold-dark)]" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-navy)]">{item.t}</p>
                    <p className="text-[11px] text-gray-400">{item.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 max-w-3xl">
          <ProductReviews
            productId={product._id}
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2
              className="text-3xl text-[var(--color-navy)] mb-8"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {related.map((p) => {
                const img = p.images?.[0];
                return (
                  <Link key={p._id} href={`/products/${p.slug}`} className="product-card group">
                    <div className="product-image-wrap">
                      {img?.url ? (
                        <Image
                          src={img.url}
                          alt={img.alt || p.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--color-cream)]">
                          <Gift size={36} strokeWidth={1} className="text-[var(--color-gold)] opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-heading text-sm text-[var(--color-navy)] line-clamp-2 mb-1">{p.name}</p>
                      <p className="font-semibold text-sm text-[var(--color-navy)]">{formatCurrency(p.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// Accordion using native <details> — works without JS
function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="border-b border-gray-100 group"
      {...(defaultOpen ? { open: true } : {})}
    >
      <summary className="flex items-center justify-between py-4 cursor-pointer list-none select-none">
        <span
          className="font-semibold text-[var(--color-navy)]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem' }}
        >
          {title}
        </span>
        <span className="text-gray-400 transition-transform duration-200 group-open:rotate-180 text-lg leading-none">
          ▾
        </span>
      </summary>
      <div className="pb-5 pt-1">{children}</div>
    </details>
  );
}
