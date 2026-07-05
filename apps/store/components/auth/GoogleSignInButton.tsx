'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/**
 * "Continue with Google" via Google Identity Services. The button renders
 * only when NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured; the ID token Google
 * returns is verified server-side (/auth/google) before any session exists.
 */
export default function GoogleSignInButton() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const btnRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !GOOGLE_CLIENT_ID || !btnRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const res = await authApi.googleLogin(credential);
          const { user, accessToken } = res.data.data;
          setAuth(user, accessToken);
          toast.success(`Welcome, ${user.name}!`);
          router.push('/');
        } catch {
          toast.error('Google sign-in failed. Please try again.');
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'center',
    });
  }, [scriptReady, router, setAuth]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
          <span className="flex-1 h-px bg-gray-100" />
        </div>
        <div ref={btnRef} className="flex justify-center" />
      </div>
    </>
  );
}
