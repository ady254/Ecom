'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, Heart, Menu, X, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import SearchBar from './SearchBar';

const navLinks = [
  { label: 'New Arrivals', href: '/products?sort=-createdAt' },
  {
    label: 'Collections',
    href: '/products',
    children: [
      { label: 'Quran Sets', href: '/products?search=quran' },
      { label: 'Wedding Gifts', href: '/products?search=wedding' },
      { label: 'Gift Hampers', href: '/products?search=hamper' },
      { label: 'Hajj Return Favours', href: '/products?search=hajj' },
      { label: 'Aqeeqah Favours', href: '/products?search=aqeeqah' },
      { label: 'Personalised Gifts', href: '/products?search=personalised' },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.items.reduce((a, i) => a + i.quantity, 0));
  const { openCart } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="section-container">
        {/* ── Row 1: logo · search (desktop) · icons ─────────────────────── */}
        <div className="flex items-center justify-between gap-4 h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image
              src="/logo.jpg"
              alt="MINARA"
              width={40}
              height={40}
              className="rounded object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="font-heading text-xl md:text-2xl font-light tracking-[4px] text-[var(--color-navy)] group-hover:text-[var(--color-gold-dark)] transition-colors duration-300">
              MINARA
            </span>
          </Link>

          {/* Search — flexible center column on desktop (Hadiyah style) */}
          <div className="hidden md:block flex-1 max-w-xl mx-auto">
            <SearchBar />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/account"
              className="p-2 text-gray-500 hover:text-[var(--color-navy)] transition-colors rounded-full hover:bg-gray-100 hidden md:flex"
              aria-label="Account"
            >
              <User size={19} />
            </Link>
            <Link
              href="/wishlist"
              className="p-2 text-gray-500 hover:text-[var(--color-navy)] transition-colors rounded-full hover:bg-gray-100"
              aria-label="Wishlist"
            >
              <Heart size={19} />
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 text-gray-500 hover:text-[var(--color-navy)] transition-colors rounded-full hover:bg-gray-100"
              aria-label="Cart"
            >
              <ShoppingBag size={19} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[var(--color-gold)] text-[var(--color-navy)] text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2 text-gray-500 hover:text-[var(--color-navy)] transition-colors rounded-full hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* ── Row 2 (mobile): full-width search bar ──────────────────────── */}
        <div className="md:hidden pb-3">
          <SearchBar mobile />
        </div>

        {/* ── Row 2 (desktop): centered nav links ────────────────────────── */}
        <div className="hidden md:flex items-center justify-center gap-1 pb-2">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
                onFocus={() => setOpenDropdown(link.label)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpenDropdown(null);
                  }
                }}
              >
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium tracking-wider text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] transition-colors rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                  aria-expanded={openDropdown === link.label}
                  aria-haspopup="true"
                  aria-controls={`dropdown-${link.label}`}
                >
                  {link.label}
                  <ChevronDown size={13} className={`transition-transform ${openDropdown === link.label ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {openDropdown === link.label && (
                    <motion.div
                      id={`dropdown-${link.label}`}
                      role="menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          role="menuitem"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[var(--color-cream)] hover:text-[var(--color-navy)] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium tracking-wider transition-colors rounded-lg hover:bg-gray-50 ${pathname === link.href
                    ? 'text-[var(--color-gold-dark)]'
                    : 'text-[var(--color-navy)] hover:text-[var(--color-gold-dark)]'
                  }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>

      {/* ── Mobile Menu (flows below the sticky header) ──────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-t border-gray-100 shadow-lg overflow-hidden md:hidden"
          >
            <div className="section-container py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 text-sm font-medium text-[var(--color-navy)] hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-4 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 text-xs text-gray-500 hover:text-[var(--color-navy)] hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-3 px-3 pt-3 border-t border-gray-100 mt-2">
                <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--color-navy)]">
                  <User size={16} /> Account
                </Link>
                <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--color-navy)]">
                  <Heart size={16} /> Wishlist
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
