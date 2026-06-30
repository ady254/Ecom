'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, LogOut, ShieldCheck, MailCheck, MailWarning, Loader2, ChevronRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatCurrency } from '@minara/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Order {
  _id: string;
  orderId: string;
  status: string;
  total: number;
  items: { name: string; quantity: number }[];
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const { clearCart } = useCartStore();
  const { clear: clearWishlist } = useWishlistStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    // Fetch user details (includes emailVerified)
    const token = localStorage.getItem('accessToken');
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => { if (j.success) setEmailVerified(j.data.user.emailVerified); })
      .catch(() => {});

    // Fetch recent orders
    setOrdersLoading(true);
    fetch(`${API_URL}/orders/my?page=1`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => { if (j.success) setOrders((j.data.orders || []).slice(0, 5)); })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [mounted, isAuthenticated, router]);

  const handleLogout = async () => {
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    }).catch(() => {});
    clearAuth();
    clearWishlist();
    router.push('/');
    toast.success('Logged out successfully');
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) toast.success('Verification email sent! Check your inbox.');
      else toast.error(json.message || 'Failed to send email');
    } catch {
      toast.error('Network error. Try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!mounted) return null;

  if (!isAuthenticated()) return null;

  const statusColors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-amber-100 text-amber-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="pb-20 pt-8">
      <div className="section-container max-w-3xl">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--color-navy)] flex items-center justify-center shrink-0">
                <span className="text-white font-heading text-xl">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="font-heading text-2xl text-[var(--color-navy)]">{user?.name}</h1>
                <p className="text-sm text-gray-400">{user?.email}</p>
                {emailVerified !== null && (
                  <div className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium ${emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {emailVerified ? <><MailCheck size={13} /> Email verified</> : <><MailWarning size={13} /> Email not verified</>}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors py-2 px-3 rounded-lg hover:bg-red-50"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>

          {emailVerified === false && (
            <div className="mt-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700">Verify your email to secure your account</p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors disabled:opacity-60"
              >
                {resendLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                Resend
              </button>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/orders"
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-3 hover:border-[var(--color-gold)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center group-hover:bg-[var(--color-gold-light)] transition-colors">
              <Package size={18} className="text-[var(--color-navy)]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-navy)]">My Orders</p>
              <p className="text-xs text-gray-400">Track deliveries</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-[var(--color-gold-dark)] transition-colors" />
          </Link>
          <Link
            href="/wishlist"
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-3 hover:border-[var(--color-gold)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center group-hover:bg-[var(--color-gold-light)] transition-colors">
              <User size={18} className="text-[var(--color-navy)]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-navy)]">Wishlist</p>
              <p className="text-xs text-gray-400">Saved gifts</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-[var(--color-gold-dark)] transition-colors" />
          </Link>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--color-navy)]">Recent Orders</h2>
            <Link href="/orders" className="text-xs text-[var(--color-gold-dark)] hover:underline font-medium">View all</Link>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-[var(--color-navy)]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <Package size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">No orders yet</p>
              <Link href="/products" className="mt-4 inline-block text-xs text-[var(--color-gold-dark)] hover:underline font-medium">
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order.orderId}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[var(--color-gold)] hover:bg-[var(--color-cream)] transition-all"
                >
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-navy)]">#{order.orderId}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-sm text-[var(--color-navy)]">{formatCurrency(order.total)}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Security */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-[var(--color-navy)] mb-4">Security</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-[var(--color-gold-dark)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-navy)]">Password</p>
                <p className="text-xs text-gray-400">Last changed: never shown for security</p>
              </div>
            </div>
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--color-gold-dark)] hover:underline font-medium"
            >
              Change password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
