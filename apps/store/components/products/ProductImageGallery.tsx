'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImage {
  url: string;
  alt?: string;
}

interface Props {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-cream-dark)] flex items-center justify-center">
        <span className="text-8xl opacity-20">🎁</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-cream)] group">
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-[var(--color-gold)]'
                  : 'border-transparent hover:border-[var(--color-gold-light)]'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
