'use client';

import { useState } from 'react';
import { Pause, Play, Sparkles, Zap, Gift, Tag, HeartHandshake, Star } from 'lucide-react';

const items = [
  { text: 'Free Shipping on all orders above ₹999', Icon: Sparkles },
  { text: 'Same-day dispatch on orders placed before 3 PM', Icon: Zap },
  { text: 'Every order arrives beautifully gift-wrapped', Icon: Gift },
  { text: 'Use code WELCOME10 for 10% off your first order', Icon: Tag },
  { text: 'Trusted by 4,200+ customers across India', Icon: HeartHandshake },
  { text: 'Rated 4.9 / 5 — Handcrafted with love', Icon: Star },
];

const ticker = [...items, ...items];

export default function AnnouncementBar() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="bg-[var(--color-navy)] text-white overflow-hidden py-2.5 select-none relative"
      role="region"
      aria-label="Promotions and announcements"
    >
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 32s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation-play-state: paused !important; }
        }
      `}</style>

      {/* Scrolling ticker — hidden from screen readers (list below is accessible) */}
      <div className="flex whitespace-nowrap pr-10">
        <div
          className="marquee-track flex shrink-0"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          aria-hidden="true"
        >
          {ticker.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-xs tracking-wide px-8">
              <item.Icon size={12} className="text-[var(--color-gold)]" strokeWidth={1.5} />
              {item.text}
              <span className="w-1 h-1 rounded-full bg-[var(--color-gold)] inline-block ml-4" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      {/* Pause / play — visible and keyboard-accessible on every viewport */}
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Resume announcements' : 'Pause announcements'}
        aria-pressed={paused}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-gold)]"
      >
        {paused
          ? <Play size={9} fill="currentColor" />
          : <Pause size={9} fill="currentColor" />}
      </button>

      {/* Screen-reader-accessible promotion list */}
      <ul className="sr-only">
        {items.map((item, i) => (
          <li key={i}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}
