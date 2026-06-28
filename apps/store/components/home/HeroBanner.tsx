'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-navy">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gold circular orb top right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--color-gold)] opacity-10 blur-3xl" />
        {/* Navy gradient bottom left */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[var(--color-navy-light)] opacity-40 blur-3xl" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(207,169,106,1) 1px, transparent 1px), linear-gradient(90deg, rgba(207,169,106,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="section-container relative z-10 py-32 pt-40 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-[var(--color-gold)]" />
            <span className="text-[var(--color-gold)] text-xs tracking-[4px] uppercase font-medium">
              Premium Gifting
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-5xl md:text-6xl lg:text-7xl text-white font-light leading-[1.1] mb-6"
          >
            Gifts That{' '}
            <span className="text-gradient-gold italic">Speak</span>
            <br />
            Elegance
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-lg leading-relaxed mb-10 max-w-md"
          >
            Discover curated luxury gifts for every occasion. Handpicked, beautifully packaged, and delivered with love.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/products" className="btn-gold group">
              Explore Gifts
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/categories" className="btn-outline border-white/30 text-white hover:bg-white hover:text-[var(--color-navy)]">
              Shop by Category
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-8 mt-12"
          >
            {[
              { value: '2000+', label: 'Happy Customers' },
              { value: '500+', label: 'Curated Gifts' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-2xl text-[var(--color-gold)]">{stat.value}</div>
                <div className="text-xs text-white/40 tracking-widest uppercase mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Hero visual */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="relative hidden lg:block"
        >
          {/* Main image card */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-[rgba(255,255,255,0.05)] border border-[rgba(207,169,106,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(207,169,106,0.1)] to-transparent" />
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="font-heading text-6xl text-[var(--color-gold)] opacity-20 tracking-[10px]">
                  MINARA
                </div>
                <p className="text-white/30 text-sm tracking-widest uppercase mt-4">
                  Luxury Gifting
                </p>
              </div>
            </div>
          </div>

          {/* Floating card: delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-6 -left-10 glass rounded-xl px-5 py-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-[var(--color-navy)] text-sm">
                ✦
              </div>
              <div>
                <div className="text-[var(--color-navy)] text-xs font-semibold">Free Delivery</div>
                <div className="text-gray-500 text-xs">On orders above ₹999</div>
              </div>
            </div>
          </motion.div>

          {/* Floating card: secure */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -top-4 -right-6 glass rounded-xl px-5 py-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white text-sm">
                🔒
              </div>
              <div>
                <div className="text-[var(--color-navy)] text-xs font-semibold">Secure Payment</div>
                <div className="text-gray-500 text-xs">Powered by Razorpay</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-[1px] h-8 bg-gradient-to-b from-[var(--color-gold)] to-transparent"
        />
      </motion.div>
    </section>
  );
}
