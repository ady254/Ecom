'use client';

import { useState, useEffect } from 'react';
import { Search, Users, MapPin, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { customersApi, type Customer } from '@/lib/adminApi';

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await customersApi.getAll({ limit: '100' });
      setCustomers(res.data.users);
      setTotal(res.pagination?.total ?? res.data.users.length);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? '').includes(search)
    );
  });

  const handleToggle = async (customer: Customer) => {
    setToggling(customer._id);
    try {
      await customersApi.toggleStatus(customer._id, !customer.isActive);
      setCustomers((prev) =>
        prev.map((c) => c._id === customer._id ? { ...c, isActive: !c.isActive } : c)
      );
      toast.success(`Customer ${!customer.isActive ? 'activated' : 'blocked'}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Customers</h1>
          {!loading && <p className="text-sm text-gray-500 mt-0.5">{total} registered customers</p>}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
          <Users size={14} className="text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">{total} total</span>
        </div>
      </div>

      {/* Search */}
      <div className="admin-card">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            className="admin-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">Customer</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div>
                          <div className="font-medium text-sm text-[var(--color-navy)]">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{c.phone || <span className="text-gray-300">—</span>}</td>
                    <td>
                      {c.addresses?.[0] ? (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin size={11} className="text-gray-300" />
                          {c.addresses[0].city}, {c.addresses[0].state}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`status-badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {c.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="pr-6">
                      <button
                        onClick={() => handleToggle(c)}
                        disabled={toggling === c._id}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[var(--color-navy)] transition-colors disabled:opacity-40"
                        title={c.isActive ? 'Block customer' : 'Activate customer'}
                      >
                        {toggling === c._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : c.isActive ? (
                          <ToggleRight size={18} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={18} className="text-gray-300" />
                        )}
                        {c.isActive ? 'Active' : 'Blocked'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      {search ? 'No customers match your search' : 'No customers registered yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
