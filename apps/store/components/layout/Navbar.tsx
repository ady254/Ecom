'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Search, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Collections', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Gifts', href: '/products?isFeatured=true' },
    { label: 'About', href: '/about' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-[0_2px_24px_rgba(11,35,66,0.1)]'
            : 'bg-transparent'
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <img src="/logo.jpg" alt="MINARA Luxury Gifting" className="h-10 md:h-12 w-auto rounded object-contain transition-transform duration-300 group-hover:scale-105" />
              <span className="font-heading text-2xl md:text-3xl font-light tracking-[5px] text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors duration-300">
                MINARA
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-widest uppercase text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[var(--color-gold)] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/search"
                className="p-2 text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors rounded-full hover:bg-[var(--color-cream)] hidden md:flex"
                aria-label="Search"
              >
                <Search size={20} />
              </Link>
              <Link
                href="/account"
                className="p-2 text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors rounded-full hover:bg-[var(--color-cream)] hidden md:flex"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              <Link
                href="/wishlist"
                className="p-2 text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors rounded-full hover:bg-[var(--color-cream)]"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
              <Link
                href="/cart"
                className="relative p-2 text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors rounded-full hover:bg-[var(--color-cream)]"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-gold)] text-[var(--color-navy)] text-[9px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>
              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-[var(--color-navy)]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-gradient-navy pt-20"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="font-heading text-3xl text-white hover:text-[var(--color-gold)] transition-colors tracking-widest"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex items-center gap-6 mt-8">
                <Link href="/account" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[var(--color-gold)] transition-colors">
                  <User size={24} />
                </Link>
                <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[var(--color-gold)] transition-colors">
                  <Heart size={24} />
                </Link>
                <Link href="/search" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[var(--color-gold)] transition-colors">
                  <Search size={24} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
