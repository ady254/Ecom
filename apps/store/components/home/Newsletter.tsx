'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, Mail } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Welcome to MINARA! You're on the list.");
        setEmail('');
      } else {
        toast.error(json.message || 'Could not subscribe. Try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-[var(--color-navy)] relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(207,169,106,0.07) 0%, transparent 70%)' }}
      />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-[rgba(207,169,106,0.12)] border border-[rgba(207,169,106,0.3)] flex items-center justify-center mx-auto mb-6">
            <Mail size={20} strokeWidth={1.5} className="text-[var(--color-gold)]" />
          </div>

          <p className="text-[var(--color-gold)] text-[10px] font-semibold tracking-[3px] uppercase mb-3">
            Stay Connected
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">
            Stay in the Loop
          </h2>
          <div className="w-10 h-px bg-[rgba(207,169,106,0.4)] mx-auto mb-5" />
          <p className="text-white/50 mb-8 text-[15px] leading-relaxed">
            Get early access to new collections, exclusive offers, and gifting inspiration — delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/35 text-sm focus:outline-none focus:border-[var(--color-gold)] focus:bg-white/15 transition-all"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-gold)] text-[var(--color-navy)] text-sm font-bold rounded-full hover:bg-[var(--color-gold-dark)] transition-colors shrink-0 disabled:opacity-60 group"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[var(--color-navy)]/30 border-t-[var(--color-navy)] rounded-full animate-spin" />
              ) : (
                <>
                  Join
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-white/30 mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
