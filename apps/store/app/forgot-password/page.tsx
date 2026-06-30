'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error('Enter a valid email address'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) setSent(true);
      else toast.error(json.message || 'Something went wrong');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle2 size={56} className="mx-auto mb-5 text-emerald-500" />
          <h1 className="font-heading text-3xl text-[var(--color-navy)] mb-3">Check your inbox</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            If an account exists for <strong>{email}</strong>, a password reset link has been sent. It expires in 1 hour.
          </p>
          <p className="text-xs text-gray-400 mb-8">Didn&apos;t receive it? Check your spam folder or try again.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setSent(false)}
              className="px-6 py-3 border border-gray-200 text-[var(--color-navy)] font-semibold rounded-full text-sm hover:bg-gray-50 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/login"
              className="px-6 py-3 bg-[var(--color-navy)] text-white font-semibold rounded-full text-sm hover:bg-[var(--color-navy-light)] transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--color-navy)] mb-8 transition-colors">
          <ArrowLeft size={15} /> Back to login
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[var(--color-cream)] flex items-center justify-center mb-6">
            <Mail size={24} className="text-[var(--color-navy)]" />
          </div>
          <h1 className="font-heading text-3xl text-[var(--color-navy)] mb-2">Forgot password?</h1>
          <p className="text-gray-400 text-sm mb-7">
            Enter the email address you registered with and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--color-navy)] text-white font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
