import Link from 'next/link';
import { Instagram, Mail, Phone, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919876543210';
const WHATSAPP_MSG = encodeURIComponent('Assalamu Alaikum! I have a query about MINARA gifts.');
const WHATSAPP_BULK_MSG = encodeURIComponent('Assalamu Alaikum! I would like to place a bulk order for Hajj return gifts / wedding hampers. Please assist.');

const shopLinks = [
  { label: 'All Products',      href: '/products' },
  { label: 'Quran Sets',        href: '/products?tags=quran' },
  { label: 'Wedding Gifts',     href: '/products?tags=wedding' },
  { label: 'Gift Hampers',      href: '/products?tags=hamper' },
  { label: 'Hajj Return Gifts', href: '/products?tags=hajj' },
  { label: 'Home Decor',        href: '/products?tags=homedecor' },
];

const helpLinks = [
  { label: 'Track My Order',   href: '/orders' },
  { label: 'Returns & Refunds', href: '/returns' },
  { label: 'Shipping Info',    href: '/shipping' },
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-navy)] text-white">
      {/* Top divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(207,169,106,0.4)] to-transparent" />

      {/* Main grid */}
      <div className="section-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpg"
                alt="MINARA"
                className="h-10 w-auto rounded object-contain border border-[rgba(207,169,106,0.3)]"
              />
              <span className="font-heading text-2xl tracking-[5px] text-[var(--color-gold)]">
                MINARA
              </span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-6 max-w-[220px]">
              Gifts rooted in faith, made with love — Quran sets, Nikkah hampers, Hajj favours & more, delivered across India.
            </p>
            <div className="flex items-center gap-2.5">
              {[
                { href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`, icon: MessageCircle, label: 'WhatsApp' },
                { href: 'https://instagram.com/minaraofficial', icon: Instagram, label: 'Instagram' },
                { href: 'mailto:hello@minara.in', icon: Mail, label: 'Email' },
                { href: 'tel:+919876543210', icon: Phone, label: 'Phone' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-[rgba(207,169,106,0.3)] text-[var(--color-gold)] flex items-center justify-center hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] hover:border-[var(--color-gold)] transition-all duration-200"
                >
                  <Icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 hover:text-[var(--color-gold)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-5">
              Help
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 hover:text-[var(--color-gold)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / WhatsApp column */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-5">
              Get In Touch
            </h3>
            <div className="space-y-4 mb-6">
              <a
                href={`mailto:hello@minara.in`}
                className="flex items-center gap-2.5 text-sm text-white/55 hover:text-white transition-colors group"
              >
                <Mail size={14} strokeWidth={1.5} className="text-[var(--color-gold)] shrink-0" />
                hello@minara.in
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 text-sm text-white/55 hover:text-white transition-colors"
              >
                <Phone size={14} strokeWidth={1.5} className="text-[var(--color-gold)] shrink-0" />
                +91 98765 43210
              </a>
            </div>

            {/* Bulk order CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_BULK_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(207,169,106,0.4)] text-[var(--color-gold)] text-xs font-semibold hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] hover:border-[var(--color-gold)] transition-all duration-200"
            >
              <MessageCircle size={14} strokeWidth={1.5} />
              Bulk Orders on WhatsApp
            </a>

            <p className="text-xs text-white/30 mt-3 leading-relaxed">
              For Hajj return sets, Nikkah hampers & corporate gifting — we handle custom quantities.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(207,169,106,0.12)]">
        <div className="section-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
            <p>© {year} MINARA. All rights reserved.</p>
            <p className="text-white/25">Made with love in India 🇮🇳</p>
            <div className="flex items-center gap-1.5">
              <span className="text-white/25">Secured by</span>
              <span className="text-[var(--color-gold)] font-semibold opacity-60">Razorpay</span>
              <span className="text-white/20 mx-1">·</span>
              <span className="text-white/25">UPI · Cards · COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
