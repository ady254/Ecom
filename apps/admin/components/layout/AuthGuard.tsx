'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Client-side gate for the dashboard: verifies the stored token against the
 * API and that the account really has the admin role before rendering
 * anything. (The API independently enforces admin on every request — this
 * guard just keeps the dashboard shell from ever showing to non-admins.)
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (res.ok && json?.data?.user?.role === 'admin') {
          setVerified(true);
        } else {
          localStorage.removeItem('adminToken');
          router.replace('/login');
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
        router.replace('/login');
      });
  }, [router]);

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
        <Loader2 size={28} className="animate-spin text-[var(--color-navy)]" />
      </div>
    );
  }

  return <>{children}</>;
}
