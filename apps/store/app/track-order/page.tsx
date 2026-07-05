'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Mail, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim().toUpperCase();
    if (!id) {
      toast.error('Please enter your order ID');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Please enter the email you used when ordering');
      return;
    }
    router.push(`/orders/${encodeURIComponent(id)}?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="min-h-[65vh] pb-20 pt-12">
      <div className="section-container max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-cream)] border border-[rgba(207,169,106,0.35)] flex items-center justify-center">
            <Package size={26} className="text-[var(--color-gold-dark)]" />
          </div>
          <h1 className="font-heading text-4xl text-[var(--color-navy)] mb-2">Track Your Order</h1>
          <p className="text-sm text-gray-400">
            Enter your order ID and the email you used at checkout.
            <br />
            You&apos;ll find both in your order confirmation email.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Order ID
            </label>
            <div className="relative">
              <Package size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="MIN-2026-XXXXXXXXXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm font-mono tracking-wide focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--color-navy)] text-white font-semibold tracking-wider rounded-full hover:bg-[var(--color-navy-light)] transition-colors"
          >
            <Search size={15} />
            Track Order
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Have an account?{' '}
          <Link href="/orders" className="text-[var(--color-gold-dark)] hover:underline">
            Sign in to see all your orders
          </Link>
        </p>
      </div>
    </div>
  );
}
