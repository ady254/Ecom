'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Package2 } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@minara/utils';
import Link from 'next/link';

const demoOrders = [
  { orderId: 'MIN-2025-00042', customer: 'Priya Sharma', email: 'priya@example.com', total: 2499, paymentMethod: 'razorpay', paymentStatus: 'paid', status: 'shipped', awbNumber: 'XB12345678', createdAt: new Date().toISOString() },
  { orderId: 'MIN-2025-00041', customer: 'Rahul Mehta', email: 'rahul@example.com', total: 1899, paymentMethod: 'cod', paymentStatus: 'pending', status: 'confirmed', awbNumber: null, createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
  { orderId: 'MIN-2025-00040', customer: 'Ananya Iyer', email: 'ananya@example.com', total: 3299, paymentMethod: 'razorpay', paymentStatus: 'paid', status: 'pending', awbNumber: null, createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
  { orderId: 'MIN-2025-00039', customer: 'Vikram Singh', email: 'vikram@example.com', total: 1599, paymentMethod: 'cod', paymentStatus: 'paid', status: 'delivered', awbNumber: 'XB98765432', createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = demoOrders.filter((o) => {
    const matchSearch = o.orderId.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Orders</h1>
        <div className="text-sm text-gray-500">{filtered.length} orders</div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search order ID or customer..."
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
              {['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => (
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
              {filtered.map((order) => (
                <tr key={order.orderId}>
                  <td className="pl-6">
                    <span className="font-mono text-xs font-semibold text-[var(--color-navy)]">{order.orderId}</span>
                  </td>
                  <td>
                    <div className="font-medium text-sm">{order.customer}</div>
                    <div className="text-xs text-gray-400">{order.email}</div>
                  </td>
                  <td className="font-semibold text-[var(--color-navy)]">{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`status-badge text-[10px] ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {order.paymentMethod === 'cod' ? 'COD' : 'Online'} · {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
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
                  <td className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</td>
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
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
