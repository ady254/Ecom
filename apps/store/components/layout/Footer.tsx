import Link from 'next/link';
import { Instagram, Mail, Phone, MessageCircle, MapPin } from 'lucide-react';
import { getStoreSettings } from '@/lib/settings';

const WHATSAPP_MSG = encodeURIComponent('Assalamu Alaikum! I have a query about MINARA gifts.');
const WHATSAPP_BULK_MSG = encodeURIComponent('Assalamu Alaikum! I would like to place a bulk order for Hajj return gifts / wedding hampers. Please assist.');

const shopLinks = [
  { label: 'All Products',      href: '/products' },
  { label: 'Quran Sets',        href: '/products?search=quran' },
  { label: 'Wedding Gifts',     href: '/products?search=wedding' },
  { label: 'Gift Hampers',      href: '/products?search=hamper' },
  { label: 'Hajj Return Gifts', href: '/products?search=hajj' },
  { label: 'Home Decor',        href: '/products?search=homedecor' },
];

const helpLinks = [
  { label: 'Track My Order',    href: '/track-order' },
  { label: 'Returns & Refunds', href: '/return-policy' },
  { label: 'Shipping Policy',   href: '/shipping-policy' },
  { label: 'Contact Us',        href: '/contact' },
  { label: 'About Us',          href: '/about' },
  { label: 'Privacy Policy',    href: '/privacy' },
  { label: 'Terms of Service',  href: '/terms' },
];


/** Thin gold line · diamond · thin gold line — the house ornament. */
function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4" aria-hidden="true">
      <span className="h-px w-14 sm:w-20 bg-gradient-to-r from-transparent to-[rgba(207,169,106,0.55)]" />
      <span className="text-[var(--color-gold)] text-[11px] leading-none">✦</span>
      <span className="h-px w-14 sm:w-20 bg-gradient-to-l from-transparent to-[rgba(207,169,106,0.55)]" />
    </div>
  );
}

export default async function Footer() {
  const year = new Date().getFullYear();
  const settings = await getStoreSettings();

  const socials = [
    { href: `https://wa.me/${settings.whatsappNumber}?text=${WHATSAPP_MSG}`, icon: MessageCircle, label: 'WhatsApp' },
    { href: settings.instagramUrl, icon: Instagram, label: 'Instagram' },
    { href: `mailto:${settings.storeEmail}`, icon: Mail, label: 'Email' },
    { href: `tel:${settings.storePhoneTel}`, icon: Phone, label: 'Phone' },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[var(--color-navy)] to-[#050f1f] text-white">
      {/* Ambient gold glow — very faint, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[320px] rounded-full bg-[var(--color-gold)] opacity-[0.06] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full bg-[var(--color-gold)] opacity-[0.04] blur-3xl"
      />

      {/* Top divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(207,169,106,0.45)] to-transparent" />

      <div className="relative">
        {/* ── Brand statement ─────────────────────────────────────────────── */}
        <div className="section-container pt-14 pb-10 text-center">
          <Ornament />
          <Link href="/" className="inline-block mt-6 mb-3 group">
            <span className="font-heading text-3xl sm:text-4xl font-light tracking-[8px] sm:tracking-[10px] text-[var(--color-gold)] group-hover:text-[var(--color-gold-light,#E8D5AA)] transition-colors duration-300 pl-2">
              MINARA
            </span>
          </Link>
          <p className="font-heading italic text-white/65 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Gifts rooted in faith, made with love — delivered across India.
          </p>

          {/* Socials */}
          <div className="flex items-center justify-center gap-3 mt-7">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={label}
                className="w-10 h-10 rounded-full border border-[rgba(207,169,106,0.3)] text-[var(--color-gold)] flex items-center justify-center hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] hover:border-[var(--color-gold)] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(207,169,106,0.35)] transition-all duration-300"
              >
                <Icon size={16} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Hairline between brand block and link columns */}
        <div className="section-container">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ── Link columns ────────────────────────────────────────────────── */}
        <div className="section-container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 md:gap-10">
            {/* Shop links */}
            <div className="col-span-1">
              <h3 className="text-[10px] font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-2">
                Shop
              </h3>
              <span className="block w-6 h-px bg-[rgba(207,169,106,0.4)] mb-5" aria-hidden="true" />
              <ul className="space-y-3">
                {shopLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block text-sm text-white/75 hover:text-[var(--color-gold)] hover:translate-x-1 transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help links */}
            <div className="col-span-1">
              <h3 className="text-[10px] font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-2">
                Help
              </h3>
              <span className="block w-6 h-px bg-[rgba(207,169,106,0.4)] mb-5" aria-hidden="true" />
              <ul className="space-y-3">
                {helpLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block text-sm text-white/75 hover:text-[var(--color-gold)] hover:translate-x-1 transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-[10px] font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-2">
                Get In Touch
              </h3>
              <span className="block w-6 h-px bg-[rgba(207,169,106,0.4)] mb-5" aria-hidden="true" />
              <div className="space-y-3.5">
                <a
                  href={`mailto:${settings.storeEmail}`}
                  className="flex items-center gap-2.5 text-sm text-white/75 hover:text-[var(--color-gold)] transition-colors break-all"
                >
                  <Mail size={14} strokeWidth={1.5} className="text-[var(--color-gold)] shrink-0" />
                  {settings.storeEmail}
                </a>
                <a
                  href={`tel:${settings.storePhoneTel}`}
                  className="flex items-center gap-2.5 text-sm text-white/75 hover:text-[var(--color-gold)] transition-colors"
                >
                  <Phone size={14} strokeWidth={1.5} className="text-[var(--color-gold)] shrink-0" />
                  {settings.storePhone}
                </a>
                 <p className="flex items-start gap-2.5 text-sm text-white/65">
                  <MapPin size={14} strokeWidth={1.5} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                  {settings.storeAddress}
                </p>
              </div>
            </div>

            {/* Bulk orders */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-[10px] font-semibold tracking-[3px] uppercase text-[var(--color-gold)] mb-2">
                Bulk & Corporate
              </h3>
              <span className="block w-6 h-px bg-[rgba(207,169,106,0.4)] mb-5" aria-hidden="true" />
               <p className="text-sm text-white/65 leading-relaxed mb-5">
                Hajj return sets, Nikkah hampers & corporate gifting — we handle custom quantities with care. Connect with us on WhatsApp for bulk pricing.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────────── */}
        <div className="border-t border-[rgba(207,169,106,0.12)]">
          <div className="section-container py-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
              <p>© {year} MINARA. All rights reserved.</p>
              <p className="text-white/60">Made with love in India 🇮🇳</p>
              <div className="flex items-center gap-1.5">
                <span className="text-white/60">Secured by</span>
                <span className="text-[var(--color-gold)] font-semibold opacity-80">Razorpay</span>
                <span className="text-white/50">UPI · Cards · COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
