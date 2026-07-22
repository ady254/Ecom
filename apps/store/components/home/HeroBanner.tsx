'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Slide {
  _id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  bgColor?: string;
  position?: string;
}

const FALLBACK: Slide[] = [
  {
    _id: 'f1',
    title: 'Gifts That Carry Meaning',
    subtitle: 'Handcrafted Islamic gifts — Quran sets, wedding hampers, Hajj favours & more, beautifully wrapped and delivered across India.',
    buttonText: 'Shop All Gifts',
    buttonLink: '/products',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop',
    bgColor: '#0B2342',
  },
  {
    _id: 'f2',
    title: 'Wedding Gifts That Touch Hearts',
    subtitle: 'Exquisite Nikkah hampers, Quran sets, and keepsakes for the most blessed celebrations.',
    buttonText: 'Shop Wedding Gifts',
    buttonLink: '/products?tags=wedding',
    image: 'https://images.unsplash.com/photo-1623517409249-18f4a1cc3779?q=80&w=2000&auto=format&fit=crop',
    bgColor: '#1a0f2e',
  },
  {
    _id: 'f3',
    title: 'Hajj Return Gifts',
    subtitle: 'Thoughtful return favours for your loved ones — Zamzam sets, prayer gifts, and blessed keepsakes.',
    buttonText: 'Explore Hajj Gifts',
    buttonLink: '/products?tags=hajj',
    image: 'https://images.unsplash.com/photo-1598285520973-2b22ec7e0c40?q=80&w=2000&auto=format&fit=crop',
    bgColor: '#0d2010',
  },
  {
    _id: 'f4',
    title: 'Quran Sets & Islamic Gifts',
    subtitle: 'Premium Quran collections, Tasbih cards, and home decor — crafted with love for every occasion.',
    buttonText: 'Browse Collections',
    buttonLink: '/products?tags=quran',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?q=80&w=2000&auto=format&fit=crop',
    bgColor: '#1a1007',
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
      className="relative w-full overflow-hidden h-[65vh] sm:h-[60vh] md:h-[65vh] lg:h-[75vh] min-h-[420px] max-h-[700px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background ─────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {slide.image ? (
            <Image
              src={slide.image}
              alt={slide.title || 'Banner'}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${slide.bgColor || '#0B2342'} 0%, ${slide.bgColor || '#0B2342'}bb 100%)`,
              }}
            />
          )}

          {/* Left-to-right gradient — stronger on mobile so text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10 sm:from-black/75 sm:via-black/40 sm:to-black/10" />
          {/* Bottom-up gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="section-container w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide._id}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              /* keep content away from arrows (sm+) and dots at bottom */
              className="max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl pb-16 sm:pb-0"
            >
              {/* Slide counter */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <span className="w-6 sm:w-10 h-[1.5px] bg-[var(--color-gold)]" />
                <span className="text-[var(--color-gold)] text-[9px] sm:text-[11px] font-semibold tracking-[3px] sm:tracking-[4px] uppercase">
                  {String(safeIdx + 1).padStart(2, '0')} &nbsp;/&nbsp; {String(total).padStart(2, '0')}
                </span>
              </div>

              {/* Heading — scales from 28px on phone to 72px on xl */}
              <h1
                className="text-[1.75rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white mb-3 sm:mb-5"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
              >
                {slide.title}
              </h1>

              {/* Subtitle — hidden on small phones to avoid overflow */}
              {slide.subtitle && (
                <p className="text-white/75 text-[11px] leading-relaxed sm:text-sm md:text-base lg:text-lg mb-5 sm:mb-9 max-w-[15rem] sm:max-w-sm lg:max-w-md">
                  {slide.subtitle}
                </p>
              )}

              {/* CTAs — the primary action for every slide */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                <Link
                  href={slide.buttonLink || '/products'}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[var(--color-gold)] text-[var(--color-navy)] text-xs sm:text-sm font-bold tracking-widest uppercase rounded-full hover:bg-[var(--color-gold-dark)] hover:shadow-[0_8px_30px_rgba(207,169,106,0.45)] transition-all duration-300"
                >
                  {slide.buttonText || 'Shop All Gifts'}
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/products"
                  className="hidden sm:inline-flex items-center gap-2 px-8 py-4 border border-white/40 text-white text-sm font-semibold tracking-widest uppercase rounded-full hover:bg-white/10 hover:border-white/70 transition-all duration-300 backdrop-blur-sm"
                >
                  Explore Collections
                </Link>
              </div>

              {/* Social proof line under CTAs */}
              <p className="flex items-center gap-2 text-white/60 text-[11px] sm:text-xs mt-4 sm:mt-6">
                <span className="text-[var(--color-gold)]">★★★★★</span>
                Trusted by 4,200+ customers across India
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Arrows — hidden on phone (swipe handles it), visible sm+ ──────── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-4 md:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/50 items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-4 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/50 items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
      >
        <ChevronRight size={18} />
      </button>

      {/* ── Dots ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === safeIdx
                ? 'w-5 sm:w-8 h-1.5 sm:h-2 bg-[var(--color-gold)]'
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
            className="h-full bg-[var(--color-gold)]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </section>
  );
}
