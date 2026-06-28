'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Users, Package, IndianRupee, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@minara/utils';

// Demo data for Phase 1
const revenueData = [
  { date: 'Jun 22', revenue: 12400 },
  { date: 'Jun 23', revenue: 18600 },
  { date: 'Jun 24', revenue: 15200 },
  { date: 'Jun 25', revenue: 22800 },
  { date: 'Jun 26', revenue: 19500 },
  { date: 'Jun 27', revenue: 28400 },
  { date: 'Jun 28', revenue: 24100 },
];

const recentOrders = [
  { orderId: 'MIN-2025-00042', customer: 'Priya Sharma', total: 2499, status: 'shipped', date: '2h ago' },
  { orderId: 'MIN-2025-00041', customer: 'Rahul Mehta', total: 1899, status: 'confirmed', date: '5h ago' },
  { orderId: 'MIN-2025-00040', customer: 'Ananya Iyer', total: 3299, status: 'pending', date: '8h ago' },
  { orderId: 'MIN-2025-00039', customer: 'Vikram Singh', total: 1599, status: 'delivered', date: '1d ago' },
];

const stats = [
  {
    label: 'Total Revenue',
    value: '₹1,41,400',
    change: '+18.2%',
    icon: IndianRupee,
    color: 'text-[var(--color-gold-dark)]',
    bg: 'bg-[rgba(207,169,106,0.1)]',
    positive: true,
  },
  {
    label: 'Total Orders',
    value: '248',
    change: '+12.5%',
    icon: ShoppingBag,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    positive: true,
  },
  {
    label: 'New Customers',
    value: '64',
    change: '+8.1%',
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    positive: true,
  },
  {
    label: 'Pending Orders',
    value: '12',
    change: '-3 today',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    positive: false,
  },
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

export default function DashboardPage() {
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
        <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(207,169,106,0.1)] rounded-lg border border-[rgba(207,169,106,0.2)]">
          <CheckCircle size={14} className="text-[var(--color-gold-dark)]" />
          <span className="text-xs font-medium text-[var(--color-navy)]">All systems operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.positive ? 'text-emerald-600' : 'text-orange-600'}`}>
                <TrendingUp size={12} />
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--color-navy)]">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-card lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[var(--color-navy)]">Revenue (Last 7 Days)</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              {formatCurrency(revenueData.reduce((a, b) => a + b.revenue, 0))} total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
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
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-card"
        >
          <h2 className="font-semibold text-[var(--color-navy)] mb-5">Order Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Pending', count: 12, pct: 48 },
              { label: 'Processing', count: 6, pct: 24 },
              { label: 'Shipped', count: 5, pct: 20 },
              { label: 'Delivered', count: 2, pct: 8 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-[var(--color-navy)]">{item.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-gold)] rounded-full transition-all"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-50 flex items-center gap-2 text-sm text-orange-600">
            <AlertTriangle size={14} />
            <span>3 orders need attention</span>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="admin-card"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[var(--color-navy)]">Recent Orders</h2>
          <a href="/dashboard/orders" className="text-xs text-[var(--color-gold-dark)] font-medium hover:underline">
            View All →
          </a>
        </div>
        <div className="overflow-x-auto">
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
              {recentOrders.map((order) => (
                <tr key={order.orderId}>
                  <td className="font-mono text-xs font-medium">{order.orderId}</td>
                  <td className="font-medium">{order.customer}</td>
                  <td className="font-semibold text-[var(--color-navy)]">{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`status-badge ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-gray-400 text-xs">{order.date}</td>
                  <td>
                    <a
                      href={`/dashboard/orders/${order.orderId}`}
                      className="text-xs font-medium text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] transition-colors"
                    >
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
