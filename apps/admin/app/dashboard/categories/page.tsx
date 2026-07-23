'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Loader2, X, Edit, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesAdminApi, type Category } from '@/lib/adminApi';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('0');

  async function load() {
    setLoading(true);
    try {
      const res = await categoriesAdminApi.getAll();
      setCategories(res.data.categories);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (editingId) {
        // Update existing
        const res = await categoriesAdminApi.update(editingId, {
          name: name.trim(),
          description: description.trim() || undefined,
          order: Number(order) || 0,
        });
        setCategories((prev) =>
          prev.map((c) => (c._id === editingId ? res.data.category : c))
        );
        toast.success(`"${res.data.category.name}" updated`);
        setEditingId(null);
      } else {
        // Create new
        const res = await categoriesAdminApi.create({
          name: name.trim(),
          description: description.trim() || undefined,
          order: Number(order) || 0,
        });
        setCategories((prev) => [...prev, res.data.category]);
        toast.success(`"${res.data.category.name}" created`);
        setShowForm(false);
      }
      setName(''); setDescription(''); setOrder('0');
    } catch (err) {
      toast.error(editingId ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setOrder(String(cat.order));
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setOrder('0');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Categories</h1>
          {!loading && <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories</p>}
        </div>
        {!editingId && (
          <button onClick={() => setShowForm(!showForm)} className="btn-admin-gold">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Cancel' : 'Add Category'}
          </button>
        )}
      </div>

      {/* Create/Edit form */}
      <AnimatePresence>
        {(showForm || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="admin-card border border-[rgba(207,169,106,0.3)]"
          >
            <h2 className="font-semibold text-[var(--color-navy)] mb-5">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gift Hampers"
                    className="admin-input"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="admin-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description (optional)"
                  className="admin-input"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="btn-admin-gold">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? (editingId ? 'Updating…' : 'Creating…') : (editingId ? 'Update Category' : 'Create Category')}
                </button>
                <button
                  type="button"
                  onClick={editingId ? cancelEdit : () => setShowForm(false)}
                  className="btn-admin-primary"
                  style={{ background: '#6b7280' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Tag size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No categories yet</p>
            <button onClick={() => setShowForm(true)} className="btn-admin-gold mt-4 text-sm">
              <Plus size={14} /> Create first category
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="pl-6">Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Order</th>
                <th className="pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td className="pl-6">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-[var(--color-gold)]" />
                      <span className="font-medium text-[var(--color-navy)]">{cat.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-gray-400">{cat.slug}</td>
                  <td className="text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                  <td className="text-sm text-gray-500">{cat.order}</td>
                  <td className="pr-6">
                    <div className="flex items-center gap-2">
                      <span className={`status-badge ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-[var(--color-gold)] transition-colors"
                        title="Edit category"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
