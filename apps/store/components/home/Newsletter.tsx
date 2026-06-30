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
        toast.success("Welcome to MINARA! 🎁 You're on the list.");
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
    <section className="py-20 bg-[var(--color-cream)]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[rgba(207,169,106,0.15)] flex items-center justify-center mx-auto mb-6">
            <Mail size={20} className="text-[var(--color-gold-dark)]" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-4">
            Stay in the Loop
          </h2>
          <p className="text-gray-500 mb-8">
            Get early access to new collections, exclusive offers, and gifting inspiration — delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary shrink-0 group"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Join
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
