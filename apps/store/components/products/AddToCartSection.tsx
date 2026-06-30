'use client';

import { useState } from 'react';
import { Minus, Plus, Heart } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';

interface Props {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
}

export default function AddToCartSection({ product }: Props) {
  const [qty, setQty] = useState(1);
  const { toggle, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product._id);

  const handleWishlist = () => {
    toggle(product._id);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Quantity</span>
        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 text-center text-base font-semibold text-[var(--color-navy)]">{qty}</span>
          <button
            onClick={() => setQty(Math.min(product.stock, qty + 1))}
            disabled={qty >= product.stock}
            className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
        {product.stock <= 5 && (
          <span className="text-xs text-amber-600 font-medium">Only {product.stock} left!</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <div className="flex-1">
          <AddToCartButton product={product} quantity={qty} />
        </div>
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
  );
}
