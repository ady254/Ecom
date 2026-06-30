'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, TicketPercent, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { couponsApi, type Coupon } from '@/lib/adminApi';
import { formatCurrency } from '@minara/utils';

const EMPTY_FORM = {
  code: '', type: 'percentage' as 'percentage' | 'fixed',
  value: '', minOrderAmount: '0', maxDiscount: '', usageLimit: '',
  isActive: true, expiresAt: '',
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await couponsApi.getAll();
      setCoupons(res.data.coupons);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderAmount: String(c.minOrderAmount),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
      usageLimit: c.usageLimit ? String(c.usageLimit) : '',
      isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const set = (k: keyof typeof EMPTY_FORM, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) { toast.error('Code and value are required'); return; }
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        isActive: form.isActive,
        expiresAt: form.expiresAt || undefined,
      };
      if (editing) {
        const res = await couponsApi.update(editing._id, payload);
        setCoupons((prev) => prev.map((c) => c._id === editing._id ? res.data.coupon : c));
        toast.success('Coupon updated');
      } else {
        const res = await couponsApi.create(payload);
        setCoupons((prev) => [res.data.coupon, ...prev]);
        toast.success('Coupon created');
      }
      setShowModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save coupon');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setDeleting(id);
    try {
      await couponsApi.delete(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      const res = await couponsApi.update(c._id, { isActive: !c.isActive });
      setCoupons((prev) => prev.map((x) => x._id === c._id ? res.data.coupon : x));
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} discount codes</p>
        </div>
        <button onClick={openNew} className="btn-admin-gold">
          <Plus size={15} /> Add Coupon
        </button>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">Code</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th className="pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id}>
                    <td className="pl-6">
                      <div className="flex items-center gap-2">
                        <TicketPercent size={14} className="text-[var(--color-gold-dark)]" />
                        <span className="font-mono font-bold text-sm text-[var(--color-navy)]">{c.code}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${c.type === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {c.type === 'percentage' ? '%' : '₹'} {c.type}
                      </span>
                    </td>
                    <td className="font-semibold text-[var(--color-navy)]">
                      {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
                      {c.maxDiscount ? <span className="text-xs text-gray-400 ml-1">(max {formatCurrency(c.maxDiscount)})</span> : ''}
                    </td>
                    <td className="text-sm text-gray-600">{c.minOrderAmount > 0 ? formatCurrency(c.minOrderAmount) : '—'}</td>
                    <td className="text-sm">
                      <span className="text-gray-600">{c.usageCount}</span>
                      {c.usageLimit ? <span className="text-gray-400"> / {c.usageLimit}</span> : <span className="text-gray-400"> / ∞</span>}
                    </td>
                    <td className="text-xs text-gray-400">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <button onClick={() => handleToggleActive(c)}>
                        <span className={`status-badge cursor-pointer ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="pr-6">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-[var(--color-navy)] transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(c._id, c.code)} disabled={deleting === c._id} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40">
                          {deleting === c._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400">No coupons yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[var(--color-navy)]">
                {editing ? 'Edit Coupon' : 'New Coupon'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Coupon Code *</label>
                  <input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} className="admin-input font-mono uppercase" placeholder="SAVE20" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type *</label>
                  <select value={form.type} onChange={(e) => set('type', e.target.value)} className="admin-input">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Value *</label>
                  <input type="number" value={form.value} onChange={(e) => set('value', e.target.value)} className="admin-input" placeholder={form.type === 'percentage' ? '20' : '100'} min="0" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Min Order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={(e) => set('minOrderAmount', e.target.value)} className="admin-input" placeholder="499" min="0" />
                </div>
                {form.type === 'percentage' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Max Discount (₹)</label>
                    <input type="number" value={form.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} className="admin-input" placeholder="200" min="0" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} className="admin-input" placeholder="Unlimited" min="1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} className="admin-input" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">Active (customers can use this coupon)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[var(--color-navy)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
