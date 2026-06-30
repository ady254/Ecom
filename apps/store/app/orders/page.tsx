'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@minara/utils';
import api from '@/lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/orders');
      return;
    }
    api.get('/orders/my')
      .then((res) => {
        setOrders(res.data?.data?.orders ?? []);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Failed to load orders';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-navy)]" />
      </div>
    );
  }

  return (
    <div className="pb-20 pt-8">
      <div className="section-container max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Package size={24} className="text-[var(--color-gold)]" />
          <h1 className="font-heading text-3xl text-[var(--color-navy)]">My Orders</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
        )}

        {orders.length === 0 && !error ? (
          <div className="text-center py-24">
            <ShoppingBag size={56} className="mx-auto text-gray-200 mb-4" />
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-2">No Orders Yet</h2>
            <p className="text-gray-400 text-sm mb-6">When you place an order, it will appear here.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-navy)] text-white rounded-full text-sm font-semibold hover:bg-[var(--color-navy-light)] transition-colors"
            >
              Explore Gifts
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const preview = order.items.slice(0, 3);
              const extra = order.items.length - 3;
              return (
                <Link
                  key={order._id}
                  href={`/orders/${order.orderId}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-[var(--color-gold)]/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-semibold text-[var(--color-navy)] text-sm">#{order.orderId}</p>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                        {order.paymentStatus === 'paid' && (
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Paid</span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mb-3">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>

                      {/* Item preview names */}
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {preview.map((i) => i.name).join(', ')}
                        {extra > 0 ? ` +${extra} more` : ''}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <p className="font-bold text-[var(--color-navy)]">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <ChevronRight size={16} className="text-gray-300 mt-2" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
