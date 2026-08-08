'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Slide {
  _id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  mobileImage?: string;
  hideTextOverlay?: boolean;
  bgColor?: string;
  position?: string;
}

const FALLBACK: Slide[] = [
  {
    _id: 'f1',
    title: 'Gifts That Carry Meaning',
    //subtitle: 'Handcrafted Islamic gifts — Quran sets, wedding hampers, Hajj favours & more, beautifully wrapped and delivered across India.',
    buttonText: 'Shop All Gifts',
    buttonLink: '/products',
    image: '/banner1.webp',
    bgColor: '#0B2342',
  },
  {
    _id: 'f2',
    title: 'Wedding Gifts That Touch Hearts',
    //subtitle: 'Exquisite Nikkah hampers, Quran sets, and keepsakes for the most blessed celebrations.',
    buttonText: 'Shop Wedding Gifts',
    buttonLink: '/products?search=wedding',
    image: '/banner2.webp',
    bgColor: '#1a0f2e',
  },
  {
    _id: 'f3',
    title: 'Hajj Return Gifts',
    //subtitle: 'Thoughtful return favours for your loved ones — Zamzam sets, prayer gifts, and blessed keepsakes.',
    buttonText: 'Explore Hajj Gifts',
    buttonLink: '/products?search=hajj',
    image: '/banner3.webp',
    bgColor: '#0d2010',
  },
  
];

const INTERVAL_MS = 5000;
const SWIPE_THRESHOLD = 50;

export default function HeroBanner({ initialBanners = [] }: { initialBanners?: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialBanners.length > 0 ? initialBanners : FALLBACK);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = slides.length;
  const safeIdx = total > 0 ? current % total : 0;
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
    setPaused(false);
  };

  const slide = slides[safeIdx] ?? slides[0];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#071830] aspect-[16/9] sm:aspect-auto sm:h-[60vh] md:h-[65vh] lg:h-[75vh] sm:min-h-[380px] max-h-[750px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background & Banner Image ───────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Link href={slide.buttonLink || '/products'} className="block relative w-full h-full cursor-pointer">
            {slide.image ? (
              <>
                {/* Mobile Image (use a mobile-specific crop if available; otherwise fallback to contain to avoid cutting text) */}
                {slide.mobileImage ? (
                  <Image
                    src={slide.mobileImage}
                    alt={slide.title || 'Banner'}
                    fill
                    sizes="100vw"
                    className="object-contain object-center sm:hidden"
                    priority
                  />
                ) : (
                  <Image
                    src={slide.image}
                    alt={slide.title || 'Banner'}
                    fill
                    sizes="100vw"
                    className="object-contain object-center sm:hidden"
                    priority
                  />
                )}
                {/* Desktop Image */}
                <Image
                  src={slide.image}
                  alt={slide.title || 'Banner'}
                  fill
                  sizes="100vw"
                  className="hidden sm:block object-cover object-center"
                  priority
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${slide.bgColor || '#0B2342'} 0%, ${slide.bgColor || '#0B2342'}bb 100%)`,
                }}
              />
            )}

          </Link>
        </motion.div>
      </AnimatePresence>
      

      {/* ── Desktop Navigation Arrows ───────────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-4 md:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 hover:border-white/50 items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-4 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 hover:border-white/50 items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
      >
        <ChevronRight size={18} />
      </button>

      {/* ── Slide Navigation Dots ──────────────────────────────────────────── */}
      <div className="absolute bottom-3 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === safeIdx
                ? 'w-5 sm:w-8 h-1.5 sm:h-2 bg-[#CFA96A]'
                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] sm:h-[3px] bg-white/10 z-20">
        {!paused && (
          <motion.div
            key={`prog-${current}`}
            className="h-full bg-[#CFA96A]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </section>
  );
}

