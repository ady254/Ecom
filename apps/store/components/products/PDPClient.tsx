'use client';

import { useState } from 'react';
import { Star, Heart, Minus, Plus, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@minara/utils';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import CustomizeModal from './CustomizeModal';

interface CustomField { label: string; placeholder?: string; required?: boolean; }
interface ProductImage { url: string; alt?: string; }

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
  category?: { _id: string; name: string; slug: string };
  stock: number;
  sku?: string;
  shortDescription?: string;
  isCustomizable?: boolean;
  customFields?: CustomField[];
}

interface DeliveryStep { label: string; date: string; }

interface Props {
  product: PDPProduct;
  discount: number;
  soldCount: number;
  deliverySteps: DeliveryStep[];
}

const TRUST_ICONS = [
  { icon: '🚚', label: 'Free Delivery' },
  { icon: '🔄', label: '10 Days Replacement' },
  { icon: '🎁', label: 'Premium Packaging' },
  { icon: '🔒', label: 'Secured Transaction' },
  { icon: '✅', label: 'Safe Delivery' },
];

export default function PDPClient({ product, discount, soldCount, deliverySteps }: Props) {
  const [qty, setQty] = useState(1);
  const [showCustomize, setShowCustomize] = useState(false);

  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product._id);

  const mainImage = product.images?.[0]?.url ?? '';

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      image: mainImage,
      price: product.price,
      quantity: qty,
      slug: product.slug,
    });
    toast.success('Added to cart!');
    openCart();
  };

  const handleCustomizeAdd = (customization: Record<string, string>) => {
    addItem({
      productId: product._id,
      name: product.name,
      image: mainImage,
      price: product.price,
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
        <div className="flex items-center gap-1.5 mb-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
            <Flame size={12} className="text-orange-500" />
            {soldCount} sold in last 24 hours
          </span>
        </div>

        {/* Category */}
        {product.category && (
          <p className="text-xs text-[var(--color-gold-dark)] uppercase tracking-widest mb-2">
            {product.category.name}
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
        {product.reviewCount > 0 && (
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
        )}

        {/* Price */}
        <div className="flex items-baseline gap-4 mb-4">
          <span
            className="text-3xl text-[var(--color-navy)] font-bold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {formatCurrency(product.price)}
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

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>
        )}

        {/* Short description */}
        {product.shortDescription && (
          <p className="text-gray-600 leading-relaxed mb-5 text-sm">{product.shortDescription}</p>
        )}

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

            {/* CTA buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setShowCustomize(true)}
                className="w-full py-4 rounded-full font-bold text-sm tracking-widest uppercase bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-dark)] transition-colors flex items-center justify-center gap-2"
              >
                ✨ Customize &amp; Personalize
              </button>

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

        {/* Trust icons strip */}
        <div className="grid grid-cols-5 gap-2 py-4 border-t border-b border-gray-100">
          {TRUST_ICONS.map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-xl">{t.icon}</span>
              <p className="text-[9px] text-gray-500 font-medium leading-tight">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customize modal */}
      {showCustomize && (
        <CustomizeModal
          product={{
            _id: product._id,
            name: product.name,
            price: product.price,
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
