'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Users, Package, IndianRupee, TrendingUp, Clock, CheckCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@minara/utils';
import Link from 'next/link';
import { dashboardApi, type DashboardStats, type RevenuePoint, type RecentOrder } from '@/lib/adminApi';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatSkeleton() {
  return <div className="admin-card skeleton h-32" />;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, revenueRes, ordersRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRevenue(7),
          dashboardApi.getRecentOrders(),
        ]);
        setStats(statsRes.data);
        setRevenue(revenueRes.data.revenue ?? []);
        setRecentOrders(ordersRes.data.orders ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Total Revenue',
          value: formatCurrency(stats.totalRevenue),
          sub: `${formatCurrency(stats.monthlyRevenue)} this month`,
          icon: IndianRupee,
          color: 'text-[var(--color-gold-dark)]',
          bg: 'bg-[rgba(207,169,106,0.1)]',
        },
        {
          label: 'Total Orders',
          value: String(stats.totalOrders),
          sub: `${stats.ordersToday} today`,
          icon: ShoppingBag,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          label: 'Customers',
          value: String(stats.totalCustomers),
          sub: `${stats.totalProducts} products`,
          icon: Users,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
        },
        {
          label: 'Pending Orders',
          value: String(stats.pendingOrders),
          sub: 'Need attention',
          icon: Clock,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${error ? 'bg-red-50 border-red-100' : 'bg-[rgba(207,169,106,0.1)] border-[rgba(207,169,106,0.2)]'}`}>
          {error ? (
            <>
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-xs font-medium text-red-600">API unreachable</span>
            </>
          ) : (
            <>
              <CheckCircle size={14} className="text-[var(--color-gold-dark)]" />
              <span className="text-xs font-medium text-[var(--color-navy)]">
                {loading ? 'Loading…' : 'Live data'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="admin-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <stat.icon size={18} className={stat.color} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[var(--color-navy)]">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</div>
              </motion.div>
            ))}
      </div>

      {/* Revenue Chart + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-card lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[var(--color-navy)]">Revenue (Last 7 Days)</h2>
            {revenue.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {formatCurrency(revenue.reduce((a, b) => a + b.revenue, 0))} total
              </span>
            )}
          </div>
          {revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-gold)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--color-gold)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'var(--color-navy)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">
              {loading ? 'Loading chart…' : 'No revenue data yet'}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-card"
        >
          <h2 className="font-semibold text-[var(--color-navy)] mb-5">Quick Stats</h2>
          {stats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Orders Today</span>
                <span className="font-semibold text-[var(--color-navy)]">{stats.ordersToday}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-orange-600">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Total Products</span>
                <span className="font-semibold text-[var(--color-navy)]">{stats.totalProducts}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="font-semibold text-[var(--color-navy)]">{stats.totalCustomers}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-8 rounded" />
              ))}
            </div>
          )}
          {stats && stats.pendingOrders > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-50 flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle size={14} />
              <span>{stats.pendingOrders} orders need attention</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="admin-card"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[var(--color-navy)]">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-xs text-[var(--color-gold-dark)] font-medium hover:underline">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-300">No orders yet</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const customerName = order.user?.name || order.guestInfo?.name || 'Guest';
                  const customerEmail = order.user?.email || order.guestInfo?.email || '';
                  return (
                    <tr key={order.orderId}>
                      <td className="font-mono text-xs font-medium">{order.orderId}</td>
                      <td>
                        <div className="font-medium text-sm">{customerName}</div>
                        <div className="text-xs text-gray-400">{customerEmail}</div>
                      </td>
                      <td className="font-semibold text-[var(--color-navy)]">{formatCurrency(order.total)}</td>
                      <td>
                        <span className={`status-badge ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td>
                        <Link
                          href={`/dashboard/orders/${order.orderId}`}
                          className="text-xs font-medium text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
