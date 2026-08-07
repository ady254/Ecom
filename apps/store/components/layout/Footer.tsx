import Link from 'next/link';
import { Instagram, Mail, Phone, MessageCircle, MapPin } from 'lucide-react';
import { getStoreSettings } from '@/lib/settings';

const WHATSAPP_MSG = encodeURIComponent('Assalamu Alaikum! I have a query about MINARA gifts.');

const shopLinks = [
  { label: 'All Products', href: '/products' },
  { label: 'Quran Sets', href: '/products?category=quran-set' },
  { label: 'Wedding Gifts', href: '/products?category=wedding-gifts' },
  { label: 'Gift Hamper', href: '/products?category=gift-hamper' },
  { label: 'Hajj Return Favours', href: '/products?category=hajj-return-favours' },
  { label: 'Aqeeqah Favours', href: '/products?category=aqeeqah-favours' },
  { label: 'Personalised Gifts', href: '/products?category=personalised-gifts' },
];

const helpLinks = [
  { label: 'Track My Order', href: '/track-order' },
  { label: 'Returns & Refunds', href: '/return-policy' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'About Us', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

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
    <footer className="relative overflow-hidden bg-[#0a192f] text-white">
      {/* Subtle top divider line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(207,169,106,0.35)] to-transparent" />

      {/* Ambient soft gold background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[#CFA96A] opacity-[0.03] blur-3xl"
      />

      <div className="section-container relative z-10">
        {/* ── Main Footer Area (4-Column Grid) ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 py-16">
          {/* Column 1: Brand */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-heading text-3xl font-light tracking-[0.25em] text-[#CFA96A] group-hover:text-[#E8D5AA] transition-colors duration-300">
                MINARA
              </span>
            </Link>
            <p className="font-heading italic text-white/70 text-base leading-relaxed max-w-xs">
              Gifts rooted in faith, made with love — delivered across India.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-[rgba(207,169,106,0.3)] text-[#CFA96A] flex items-center justify-center hover:bg-[#CFA96A] hover:text-[#0a192f] hover:border-[#CFA96A] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#CFA96A] mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#CFA96A] mb-5">
              Help
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Get in Touch & Bulk */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#CFA96A] mb-5">
              Get in Touch &amp; Bulk
            </h3>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="space-y-2.5">
                <a
                  href={`mailto:${settings.storeEmail}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors duration-200 break-all"
                >
                  <Mail size={14} strokeWidth={1.5} className="text-[#CFA96A] shrink-0" />
                  {settings.storeEmail}
                </a>
                <a
                  href={`tel:${settings.storePhoneTel}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors duration-200"
                >
                  <Phone size={14} strokeWidth={1.5} className="text-[#CFA96A] shrink-0" />
                  {settings.storePhone}
                </a>
                <p className="flex items-start gap-2.5 text-gray-300">
                  <MapPin size={14} strokeWidth={1.5} className="text-[#CFA96A] shrink-0 mt-1" />
                  {settings.storeAddress}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Hajj return sets, Nikkah hampers &amp; corporate gifting — we handle custom quantities with care. Connect with us on WhatsApp for bulk pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Footer (Bottom Bar) ────────────────────────────────────────── */}
      <div className="border-t border-white/10 relative z-10">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            {/* Left */}
            <p className="text-center md:text-left">
              © {year} MINARA. All rights reserved.
            </p>

            {/* Center */}
            <p className="text-center">
              Secured by <span className="text-[#CFA96A] font-medium">Razorpay</span> &middot; UPI &middot; Cards &middot; COD
            </p>

            {/* Right */}
            <p className="text-center md:text-right">
              Created and maintained by{' '}
              <a
                href="https://innvox.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#CFA96A] underline underline-offset-2 transition-colors duration-200"
              >
                innvox.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

