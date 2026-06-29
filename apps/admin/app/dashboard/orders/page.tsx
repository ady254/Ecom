'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Package2 } from 'lucide-react';
import { formatCurrency } from '@minara/utils';
import Link from 'next/link';
import { ordersApi, type Order } from '@/lib/adminApi';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string> = { limit: '50' };
        if (statusFilter !== 'all') params.status = statusFilter;
        const res = await ordersApi.getAll(params);
        setOrders(res.data.orders);
        setTotal(res.data.total);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter]);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const customerName = o.user?.name || o.guestInfo?.name || '';
    return (
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Orders</h1>
        <div className="text-sm text-gray-500">{total} total orders</div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search order ID or customer…"
              className="admin-input pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              className="admin-input w-auto py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="admin-card overflow-hidden p-0"
      >
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>AWB</th>
                  <th>Date</th>
                  <th className="pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const customerName = order.user?.name || order.guestInfo?.name || 'Guest';
                  const customerEmail = order.user?.email || order.guestInfo?.email || '';
                  return (
                    <tr key={order.orderId}>
                      <td className="pl-6">
                        <span className="font-mono text-xs font-semibold text-[var(--color-navy)]">{order.orderId}</span>
                      </td>
                      <td>
                        <div className="font-medium text-sm">{customerName}</div>
                        <div className="text-xs text-gray-400">{customerEmail}</div>
                      </td>
                      <td className="font-semibold text-[var(--color-navy)]">{formatCurrency(order.total)}</td>
                      <td>
                        <span className={`status-badge text-[10px] ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'} · {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.awbNumber ? (
                          <span className="font-mono text-xs text-[var(--color-navy)]">{order.awbNumber}</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="pr-6">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/orders/${order.orderId}`}
                            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[var(--color-navy)] transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </Link>
                          {!order.awbNumber && order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-50 text-[var(--color-gold-dark)] transition-colors"
                              title="Enter AWB"
                            >
                              <Package2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      {loading ? 'Loading…' : 'No orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
