'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const userId = searchParams.get('id') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token || !userId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center p-8">
        <XCircle size={56} className="text-red-400" />
        <h1 className="font-heading text-2xl text-[var(--color-navy)]">Invalid Reset Link</h1>
        <p className="text-gray-400 text-sm">This link is missing required parameters.</p>
        <Link href="/forgot-password" className="text-sm text-[var(--color-gold-dark)] hover:underline font-medium">
          Request a new reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId, password }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        toast.error(json.message || 'Reset failed. Link may have expired.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle2 size={56} className="mx-auto mb-5 text-emerald-500" />
          <h1 className="font-heading text-3xl text-[var(--color-navy)] mb-3">Password updated!</h1>
          <p className="text-gray-400 text-sm mb-8">
            Your password has been reset successfully. Please log in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[var(--color-navy)] text-white font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[var(--color-cream)] flex items-center justify-center mb-6">
            <Lock size={24} className="text-[var(--color-navy)]" />
          </div>
          <h1 className="font-heading text-3xl text-[var(--color-navy)] mb-2">Set new password</h1>
          <p className="text-gray-400 text-sm mb-7">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your new password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--color-navy)] text-white font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Updating…</> : 'Update Password'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Remember your password?{' '}
            <Link href="/login" className="text-[var(--color-gold-dark)] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
