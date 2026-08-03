'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Heart, Minus, Plus, Flame, Sparkles, Truck, RotateCcw, Gift, Lock, CheckCircle2, ShoppingBag, CreditCard, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@minara/utils';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import CustomizeModal from './CustomizeModal';

interface CustomField { label: string; placeholder?: string; required?: boolean; }
interface ProductImage { url: string; alt?: string; }

interface VariantOption {
  label: string;
  /** Optional per-option price for dynamic pricing (Amazon-style). */
  price?: number;
}

interface PDPProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: ProductImage[];
  averageRating: number;
  reviewCount: number;
  tags: string[];
  categories?: Array<{ _id: string; name: string; slug: string }>;
  stock: number;
  sku?: string;
  shortDescription?: string;
  isCustomizable?: boolean;
  codAvailable?: boolean;
  customFields?: CustomField[];
  variants?: Array<{
    name: string;
    options: VariantOption[];
  }>;
  /**
   * @deprecated Legacy fields — kept for products not yet re-saved after the
   * model migration. The PDP reads these as fallback if variants[] is empty.
   */
  quranOptions?: { enabled: boolean; languages: string[] };
  tasbeehOptions?: { enabled: boolean; types: string[] };
  janamazOptions?: { enabled: boolean; shapes: string[] };
}

interface DeliveryStep { label: string; date: string; }

interface Props {
  product: PDPProduct;
  discount: number;
  soldCount: number;
  deliverySteps: DeliveryStep[];
}

const TRUST_ICONS = [
  { Icon: Truck, label: 'Free Delivery' },
  { Icon: RotateCcw, label: '10 Days Replacement' },
  { Icon: Gift, label: 'Premium Packaging' },
  { Icon: Lock, label: 'Secured Transaction' },
  { Icon: CheckCircle2, label: 'Safe Delivery' },
];

export default function PDPClient({ product, discount, soldCount, deliverySteps }: Props) {
  const [qty, setQty] = useState(1);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  /** key = variant group name, value = selected option label */
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  /** Animate price change */
  const [priceAnimating, setPriceAnimating] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCartStore();
  const { openCart, setStickyBarVisible } = useUIStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product._id);
  const mainImage = product.images?.[0]?.url ?? '';

  /**
   * Resolve the effective variant groups.
   * If the product has the new variants[], use that.
   * Otherwise fall back to the legacy hardcoded option fields.
   */
  const variantGroups = useMemo(() => {
    const groups: Array<{ name: string; options: VariantOption[] }> = [];

    if (product.variants && product.variants.length > 0) {
      return product.variants.filter(v => v.options.length > 0);
    }

    // Legacy fallback
    if (product.quranOptions?.enabled && (product.quranOptions.languages ?? []).length > 0) {
      groups.push({ name: 'Quran Type', options: product.quranOptions.languages.map(l => ({ label: l })) });
    }
    if (product.tasbeehOptions?.enabled && (product.tasbeehOptions.types ?? []).length > 0) {
      groups.push({ name: 'Tasbeeh Type', options: product.tasbeehOptions.types.map(t => ({ label: t })) });
    }
    if (product.janamazOptions?.enabled && (product.janamazOptions.shapes ?? []).length > 0) {
      groups.push({ name: 'Janamaz Shape', options: product.janamazOptions.shapes.map(s => ({ label: s })) });
    }
    return groups;
  }, [product]);

  /**
   * Dynamic price: base price + sum of all selected addon prices.
   * Each variant option's `price` field is treated as an ADD-ON amount
   * on top of the product's base price, not a replacement.
   */
  const displayPrice = useMemo(() => {
    let total = product.price;
    for (const group of variantGroups) {
      const selectedLabel = selectedVariants[group.name];
      if (!selectedLabel) continue;
      const opt = group.options.find(o => o.label === selectedLabel);
      if (opt?.price !== undefined) total += opt.price;
    }
    return total;
  }, [selectedVariants, variantGroups, product.price]);

  /**
   * Total addon amount currently applied (sum of all selected option prices).
   * Used to show a badge like "+₹499 addon included".
   */
  const totalAddon = useMemo(() => {
    let addon = 0;
    for (const group of variantGroups) {
      const selectedLabel = selectedVariants[group.name];
      if (!selectedLabel) continue;
      const opt = group.options.find(o => o.label === selectedLabel);
      if (opt?.price !== undefined) addon += opt.price;
    }
    return addon;
  }, [selectedVariants, variantGroups]);

  /**
   * Whether any selected option carries an addon price.
   */
  const hasAddon = totalAddon > 0;

  const prevDisplayPrice = useRef(displayPrice);
  useEffect(() => {
    if (prevDisplayPrice.current !== displayPrice) {
      setPriceAnimating(true);
      const t = setTimeout(() => setPriceAnimating(false), 400);
      prevDisplayPrice.current = displayPrice;
      return () => clearTimeout(t);
    }
  }, [displayPrice]);

  // Show sticky buy bar once the main CTA scrolls out of view above
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || product.stock <= 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product.stock]);

  useEffect(() => {
    setStickyBarVisible(showSticky);
    return () => setStickyBarVisible(false);
  }, [showSticky, setStickyBarVisible]);

  const handleSelectVariant = (groupName: string, optionLabel: string) => {
    setSelectedVariants(prev => ({ ...prev, [groupName]: optionLabel }));
  };

  const handleAddToCart = () => {
    // Validate that all option groups have a selection
    for (const group of variantGroups) {
      if (!selectedVariants[group.name]) {
        toast.error(`Please select a ${group.name}`);
        return;
      }
    }

    addItem({
      productId: product._id,
      name: product.name,
      image: mainImage,
      price: displayPrice,
      quantity: qty,
      slug: product.slug,
      ...(Object.keys(selectedVariants).length > 0 ? { variant: { ...selectedVariants } } : {}),
    });
    toast.success('Added to cart!');
    openCart();
  };

  const handleCustomizeAdd = (customization: Record<string, string>) => {
    addItem({
      productId: product._id,
      name: product.name,
      image: mainImage,
      price: displayPrice,
      quantity: qty,
      slug: product.slug,
      variant: customization,
    });
    toast.success('Personalized gift added to cart!');
    openCart();
  };

  const handleWishlist = () => {
    toggle(product._id);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
    });
  };

  return (
    <>
      <div className="flex flex-col">
        {/* Urgency badge */}
        {soldCount > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
              <Flame size={12} className="text-orange-500" />
              {soldCount} sold in last 24 hours
            </span>
          </div>
        )}

        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <p className="text-xs text-[var(--color-gold-dark)] uppercase tracking-widest mb-2">
            {product.categories[0].name}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {product.tags.includes('bestseller') && (
            <span className="text-xs font-semibold bg-[var(--color-gold)] text-[var(--color-navy)] px-3 py-1 rounded-full">
              Bestseller
            </span>
          )}
          {product.tags.includes('new') && (
            <span className="text-xs font-semibold bg-[var(--color-navy)] text-white px-3 py-1 rounded-full">
              New Arrival
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl text-[var(--color-navy)] leading-tight mb-4"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
        >
          {product.name}
        </h1>

        {/* Rating */}
        {product.reviewCount > 0 ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={
                    s <= Math.round(product.averageRating)
                      ? 'text-[var(--color-gold)] fill-[var(--color-gold)]'
                      : 'text-gray-200 fill-gray-200'
                  }
                />
              ))}
            </div>
            <a href="#reviews" className="text-sm text-[var(--color-gold-dark)] hover:underline">
              {product.averageRating.toFixed(1)} · {product.reviewCount} reviews
            </a>
          </div>
        ) : (
          <a href="#reviews" className="text-sm text-gray-400 hover:text-[var(--color-gold-dark)] mb-4 inline-block">
            ✨ New arrival — be the first to review
          </a>
        )}

        {/* ── Dynamic Price Block ── */}
        <div className="mb-4">
          <div className="flex items-baseline gap-4">
            <span
              className={`text-3xl text-[var(--color-navy)] font-bold transition-all duration-300 ${
                priceAnimating ? 'scale-110 text-[var(--color-gold-dark)]' : 'scale-100'
              }`}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                display: 'inline-block',
                transformOrigin: 'left center',
              }}
            >
              {formatCurrency(displayPrice)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
            )}
            {discount > 0 && (
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {discount}% off
              </span>
            )}
          </div>

          {/* Addon badge — shown when selected options add to the base price */}
          {hasAddon ? (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Tag size={11} className="text-[var(--color-gold-dark)]" />
              <span className="text-xs text-[var(--color-gold-dark)] font-medium">
                Includes +{formatCurrency(totalAddon)} addon
              </span>
            </div>
          ) : variantGroups.some(g => g.options.some(o => o.price !== undefined)) ? (
            <p className="text-xs text-gray-400 mt-1">Base price · select an option to add extras</p>
          ) : null}
        </div>

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>
        )}

        {/* Short description */}
        {product.shortDescription && (
          <p className="text-gray-600 leading-relaxed mb-5 text-sm">{product.shortDescription}</p>
        )}

        {/* ── Unified Variant Selectors (all option groups in one loop) ── */}
        {variantGroups.map((group) => (
          <div key={group.name} className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              {group.name}:{' '}
              <span className="text-[var(--color-navy)] font-bold">
                {selectedVariants[group.name] ?? (
                  <span className="text-gray-400 font-normal italic">Select one</span>
                )}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const isSelected = selectedVariants[group.name] === opt.label;
                const hasPriceOverride = opt.price !== undefined;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectVariant(group.name, opt.label)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                      isSelected
                        ? 'border-[var(--color-navy)] bg-[var(--color-navy)] text-white shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-[var(--color-navy)] hover:text-[var(--color-navy)]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {hasPriceOverride && (
                      <span
                        className={`ml-2 text-xs font-semibold ${
                          isSelected ? 'text-[var(--color-gold)]' : 'text-[var(--color-gold-dark)]'
                        }`}
                      >
                        +{formatCurrency(opt.price!)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Stock */}
        <div className="flex items-center gap-2 mb-6">
          {product.stock > 0 ? (
            <>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-700 font-medium">
                {product.stock <= 5 ? `Only ${product.stock} left — order soon!` : 'In Stock'}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            </>
          )}
        </div>

        {product.stock > 0 && (
          <>
            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm font-medium text-gray-600">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-30"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-[var(--color-navy)]">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  disabled={qty >= product.stock}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-30"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Free Shipping Indicator */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Truck size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800">
                  {displayPrice >= 999
                    ? 'This item qualifies for FREE Shipping!'
                    : 'Free shipping on orders over ₹999!'}
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div ref={ctaRef} className="space-y-3 mb-6">
              {product.isCustomizable && (
                <button
                  onClick={() => setShowCustomize(true)}
                  className="w-full py-4 rounded-full font-bold text-sm tracking-widest uppercase bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-dark)] transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={15} />
                  Customize &amp; Personalize
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-full font-bold text-sm tracking-widest uppercase bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)] transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    wishlisted
                      ? 'border-red-400 bg-red-50 text-red-500'
                      : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
                  }`}
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={18} className={wishlisted ? 'fill-red-500' : ''} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Delivery timeline */}
        <div className="mb-6 p-4 bg-[var(--color-cream)] rounded-2xl border border-[rgba(207,169,106,0.2)]">
          <p className="text-xs font-semibold text-[var(--color-navy)] uppercase tracking-wider mb-3">Delivery Timeline</p>
          <div className="flex items-center gap-0">
            {deliverySteps.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1 text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? 'bg-[var(--color-gold)] text-[var(--color-navy)]'
                        : 'bg-white border-2 border-[var(--color-gold)] text-[var(--color-gold)]'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p className="text-[10px] font-semibold text-[var(--color-navy)] mt-1.5 leading-tight">{step.label}</p>
                  <p className="text-[10px] text-gray-400">{step.date}</p>
                </div>
                {i < deliverySteps.length - 1 && (
                  <div className="flex-1 h-px bg-[rgba(207,169,106,0.4)] mx-1 mb-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {product.codAvailable === false && (
          <div className="mb-6 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <CreditCard size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Prepaid orders only</p>
              <p className="text-[11px] text-amber-700 leading-snug">
                Cash on Delivery isn&apos;t available for this item — you can pay securely by UPI, card, or net banking at checkout.
              </p>
            </div>
          </div>
        )}

        {/* Trust icons */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-4 py-4 border-t border-b border-gray-100">
          {TRUST_ICONS.map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1 text-center">
              <t.Icon size={18} strokeWidth={1.75} className="text-[var(--color-gold-dark)]" />
              <p className="text-[9px] text-gray-500 font-medium leading-tight">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky mobile buy bar */}
      {product.stock > 0 && (
        <div
          className={`fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
            showSticky ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate max-w-[120px]">{product.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-[var(--color-navy)]">
                  {formatCurrency(displayPrice)}
                </span>
                {product.comparePrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatCurrency(product.comparePrice)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-xs tracking-widest uppercase bg-[var(--color-navy)] text-white active:scale-[0.98] transition-transform"
            >
              <ShoppingBag size={15} />
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Customize modal */}
      {showCustomize && (
        <CustomizeModal
          product={{
            _id: product._id,
            name: product.name,
            price: displayPrice,
            images: product.images,
            customFields: product.customFields,
          }}
          quantity={qty}
          onClose={() => setShowCustomize(false)}
          onAdd={handleCustomizeAdd}
        />
      )}
    </>
  );
}
