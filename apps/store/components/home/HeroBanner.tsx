'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Slide {
  _id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  bgColor?: string;
}

const FALLBACK: Slide[] = [
  {
    _id: 'f1',
    title: "The Gift They'll Always Remember",
    subtitle: 'Handpicked luxury gifts for every occasion — beautifully wrapped and delivered across India.',
    buttonText: 'Shop All Gifts',
    buttonLink: '/products',
    bgColor: '#0B2342',
  },
  {
    _id: 'f2',
    title: 'Wedding Gifts That Touch Hearts',
    subtitle: 'Exquisite hampers and keepsakes for the most special celebrations.',
    buttonText: 'Shop Wedding Gifts',
    buttonLink: '/products?tags=wedding',
    bgColor: '#1a0f2e',
  },
  {
    _id: 'f3',
    title: 'Corporate Gifting Made Effortless',
    subtitle: 'Premium bulk gifting solutions for your team and clients.',
    buttonText: 'Explore Corporate',
    buttonLink: '/products?tags=corporate',
    bgColor: '#0d1820',
  },
  {
    _id: 'f4',
    title: 'Celebrate Every Occasion in Style',
    subtitle: 'From birthdays to anniversaries — we have the perfect gift.',
    buttonText: 'Browse Collections',
    buttonLink: '/products',
    bgColor: '#1a1007',
  },
];

const INTERVAL_MS = 5000;
const SWIPE_THRESHOLD = 50;

export default function HeroBanner() {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetch(`${API}/banners`)
      .then((r) => r.json())
      .then((j) => {
        const hero: Slide[] = (j.data?.banners ?? []).filter(
          (b: Slide & { position?: string }) => b.position === 'hero' || !b.position
        );
        if (hero.length > 0) {
          setSlides(hero);
          setCurrent(0);
        }
      })
      .catch(() => {});
  }, []);

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
      className="relative w-full overflow-hidden"
      style={{
        /* dvh accounts for mobile browser chrome (address bar) */
        height: 'calc(100dvh - 64px)',
        minHeight: '480px',
        maxHeight: '900px',
      }}
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
                <p className="hidden sm:block text-white/70 text-sm md:text-base lg:text-lg leading-relaxed mb-6 sm:mb-9 max-w-xs sm:max-w-sm lg:max-w-md">
                  {slide.subtitle}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-0">
                {slide.buttonText && slide.buttonLink && (
                  <Link
                    href={slide.buttonLink}
                    className="inline-flex items-center gap-1.5 sm:gap-2.5 px-5 py-2.5 sm:px-8 sm:py-4 bg-[var(--color-gold)] text-[var(--color-navy)] text-[11px] sm:text-sm font-bold tracking-widest uppercase rounded-full hover:bg-[var(--color-gold-dark)] transition-colors group"
                  >
                    {slide.buttonText}
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform sm:w-3.5 sm:h-3.5" />
                  </Link>
                )}
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-5 py-2.5 sm:px-8 sm:py-4 border-2 border-white/40 text-white text-[11px] sm:text-sm font-semibold rounded-full hover:border-white hover:bg-white/10 transition-colors"
                >
                  Explore All
                </Link>
              </div>
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
