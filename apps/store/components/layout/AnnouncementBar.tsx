'use client';

const items = [
  '✦ Free Shipping on all orders above ₹999',
  '⚡ Same-day dispatch on orders placed before 3 PM',
  '🎁 Every order arrives beautifully gift-wrapped',
  '✦ Use code WELCOME10 for 10% off your first order',
  '🏆 Trusted by 4,200+ customers across India',
  '⭐ Rated 4.9 / 5 — Handcrafted with love',
];

const ticker = [...items, ...items];

export default function AnnouncementBar() {
  return (
    <div className="bg-[var(--color-navy)] text-white overflow-hidden py-2.5 select-none">
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="flex whitespace-nowrap">
        <div className="marquee-track flex shrink-0">
          {ticker.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-xs tracking-wide px-8">
              {item}
              <span className="w-1 h-1 rounded-full bg-[var(--color-gold)] inline-block ml-4" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
