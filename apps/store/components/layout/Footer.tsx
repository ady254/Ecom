'use client';

import Link from 'next/link';
import { Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    shop: [
      { label: 'All Products', href: '/products' },
      { label: 'Gift Hampers', href: '/categories/gift-hampers' },
      { label: 'Corporate Gifts', href: '/categories/corporate' },
      { label: 'Featured Gifts', href: '/products?isFeatured=true' },
    ],
    help: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Track Order', href: '/orders' },
      { label: 'Returns & Refunds', href: '/returns' },
      { label: 'Shipping Info', href: '/shipping' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  };

  return (
    <footer className="bg-gradient-navy text-white">
      {/* Top bar */}
      <div className="border-b border-[rgba(207,169,106,0.2)]">
        <div className="section-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.jpg" alt="MINARA Luxury Gifting" className="h-10 w-auto rounded object-contain border border-[rgba(207,169,106,0.3)]" />
                <h2 className="font-heading text-3xl tracking-[6px] text-[var(--color-gold)]">
                  MINARA
                </h2>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-6">
                Luxury gifting, reimagined. Curated gifts that speak the language of elegance.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/minaraofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-[rgba(207,169,106,0.3)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="mailto:hello@minara.in"
                  className="p-2 rounded-full border border-[rgba(207,169,106,0.3)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] transition-all"
                  aria-label="Email"
                >
                  <Mail size={16} />
                </a>
                <a
                  href="tel:+919876543210"
                  className="p-2 rounded-full border border-[rgba(207,169,106,0.3)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] transition-all"
                  aria-label="Phone"
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h3 className="text-xs font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-5">
                Shop
              </h3>
              <ul className="space-y-3">
                {links.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-[var(--color-gold)] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Links */}
            <div>
              <h3 className="text-xs font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-5">
                Help
              </h3>
              <ul className="space-y-3">
                {links.help.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-[var(--color-gold)] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-xs font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-5">
                Stay in Touch
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Get exclusive offers and new arrivals delivered to your inbox.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 rounded bg-white/10 border border-[rgba(207,169,106,0.2)] text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[var(--color-gold)] text-[var(--color-navy)] text-sm font-semibold rounded hover:bg-[var(--color-gold-dark)] transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="section-container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {year} MINARA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {links.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--color-gold)] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <img src="/icons/razorpay.svg" alt="Razorpay" className="h-5 opacity-50" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-white/30">Secure Payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
