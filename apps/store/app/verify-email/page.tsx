'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const userId = searchParams.get('id') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !userId) { setStatus('invalid'); return; }
    fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStatus('success');
        else { setStatus('error'); setMessage(json.message || 'Verification failed'); }
      })
      .catch(() => { setStatus('error'); setMessage('Network error. Please try again.'); });
  }, [token, userId]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[var(--color-navy)] mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Verifying your email…</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle2 size={64} className="mx-auto mb-5 text-emerald-500" />
          <h1 className="font-heading text-3xl text-[var(--color-navy)] mb-3">Email verified!</h1>
          <p className="text-gray-400 text-sm mb-8">
            Your email address has been successfully verified. Your MINARA account is fully active.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[var(--color-navy)] text-white font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors"
          >
            Go to My Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <XCircle size={64} className="mx-auto mb-5 text-red-400" />
        <h1 className="font-heading text-3xl text-[var(--color-navy)] mb-3">Verification failed</h1>
        <p className="text-gray-400 text-sm mb-8">
          {status === 'invalid'
            ? 'This verification link is missing required parameters.'
            : message || 'This link may have expired or already been used.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account" className="px-6 py-3 border border-gray-200 text-[var(--color-navy)] font-semibold rounded-full text-sm hover:bg-gray-50 transition-colors">
            My Account
          </Link>
          <Link href="/account" className="px-6 py-3 bg-[var(--color-navy)] text-white font-semibold rounded-full text-sm hover:bg-[var(--color-navy-light)] transition-colors">
            Resend from Account
          </Link>
        </div>
      </div>
    </div>
  );
}
