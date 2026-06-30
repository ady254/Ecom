'use client';

import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '@/store/wishlistStore';

interface Props {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className }: Props) {
  const { toggle, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    toast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full bg-white/90 hover:bg-white transition-all shadow-sm ${
        wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      } ${className ?? ''}`}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart size={14} className={wishlisted ? 'fill-red-500' : ''} />
    </button>
  );
}
