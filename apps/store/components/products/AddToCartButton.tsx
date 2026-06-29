'use client';

import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

interface Props {
  product: Product;
  iconOnly?: boolean;
  quantity?: number;
  className?: string;
}

export default function AddToCartButton({ product, iconOnly = false, quantity = 1, className }: Props) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      slug: product.slug,
    });
    setAdded(true);
    toast.success('Added to cart');
    setTimeout(() => setAdded(false), 2000);
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleAdd}
        className="p-2 bg-[var(--color-gold)] text-[var(--color-navy)] rounded hover:bg-[var(--color-gold-dark)] transition-colors"
        title="Add to cart"
      >
        {added ? <Check size={14} /> : <ShoppingBag size={14} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`btn-primary w-full justify-center gap-2 ${className ?? ''}`}
    >
      {added ? (
        <>
          <Check size={16} />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingBag size={16} />
          Add to Cart
        </>
      )}
    </button>
  );
}
