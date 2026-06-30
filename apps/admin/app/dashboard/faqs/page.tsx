'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Loader2, GripVertical, Eye, EyeOff, Edit2, X, Check, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { faqApi, type FAQ } from '@/lib/adminApi';

interface EditState {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM: EditState = { question: '', answer: '', order: 0, isActive: true };

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // New FAQ form
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<EditState>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await faqApi.getAll();
      setFaqs(res.data.faqs);
    } catch {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!newForm.question.trim()) { toast.error('Question is required'); return; }
    if (!newForm.answer.trim()) { toast.error('Answer is required'); return; }
    setCreating(true);
    try {
      const res = await faqApi.create({
        question: newForm.question.trim(),
        answer: newForm.answer.trim(),
        order: newForm.order,
        isActive: newForm.isActive,
      });
      setFaqs((prev) => [...prev, res.data.faq]);
      setNewForm(EMPTY_FORM);
      setShowNew(false);
      toast.success('FAQ created');
    } catch {
      toast.error('Failed to create FAQ');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingId(faq._id);
    setEditForm({ question: faq.question, answer: faq.answer, order: faq.order, isActive: faq.isActive });
  };

  const handleSave = async (id: string) => {
    if (!editForm.question.trim()) { toast.error('Question is required'); return; }
    if (!editForm.answer.trim()) { toast.error('Answer is required'); return; }
    setSaving(true);
    try {
      const res = await faqApi.update(id, {
        question: editForm.question.trim(),
        answer: editForm.answer.trim(),
        order: editForm.order,
        isActive: editForm.isActive,
      });
      setFaqs((prev) => prev.map((f) => (f._id === id ? res.data.faq : f)));
      setEditingId(null);
      toast.success('FAQ updated');
    } catch {
      toast.error('Failed to update FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const res = await faqApi.update(faq._id, { isActive: !faq.isActive });
      setFaqs((prev) => prev.map((f) => (f._id === faq._id ? res.data.faq : f)));
      toast.success(faq.isActive ? 'FAQ hidden' : 'FAQ visible');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await faqApi.delete(id);
      setFaqs((prev) => prev.filter((f) => f._id !== id));
      setDeletingId(null);
      toast.success('FAQ deleted');
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle size={22} className="text-[var(--color-gold-dark)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-navy)]">FAQs</h1>
            <p className="text-sm text-gray-400">{faqs.length} questions · shown on homepage</p>
          </div>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditingId(null); }}
          className="btn-admin-gold"
        >
          <Plus size={15} /> Add FAQ
        </button>
      </div>

      {/* New FAQ form */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="admin-card border-2 border-[var(--color-gold-light)] bg-amber-50/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[var(--color-navy)]">New FAQ</h2>
              <button onClick={() => setShowNew(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Question</label>
                <input
                  type="text"
                  value={newForm.question}
                  onChange={(e) => setNewForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. Do you offer personalised gifts?"
                  className="admin-input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Answer</label>
                <textarea
                  value={newForm.answer}
                  onChange={(e) => setNewForm((f) => ({ ...f, answer: e.target.value }))}
                  placeholder="Write the answer here…"
                  rows={3}
                  className="admin-input resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={newForm.order}
                    onChange={(e) => setNewForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className="admin-input w-24 py-2"
                    min="0"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <div
                    onClick={() => setNewForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${newForm.isActive ? 'bg-[var(--color-gold)]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${newForm.isActive ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-gray-600">{newForm.isActive ? 'Visible' : 'Hidden'}</span>
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-navy)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-50"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {creating ? 'Creating…' : 'Create FAQ'}
                </button>
                <button onClick={() => setShowNew(false)} className="px-5 py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ list */}
      <div className="admin-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : faqs.length === 0 ? (
          <div className="py-16 text-center">
            <HelpCircle size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No FAQs yet. Click "Add FAQ" to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {faqs.map((faq) => (
              <motion.div
                key={faq._id}
                layout
                className={`p-5 ${!faq.isActive ? 'opacity-50' : ''}`}
              >
                {editingId === faq._id ? (
                  /* Inline edit form */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.question}
                      onChange={(e) => setEditForm((f) => ({ ...f, question: e.target.value }))}
                      className="admin-input font-semibold"
                      autoFocus
                    />
                    <textarea
                      value={editForm.answer}
                      onChange={(e) => setEditForm((f) => ({ ...f, answer: e.target.value }))}
                      rows={3}
                      className="admin-input resize-none text-sm"
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 font-medium">Order:</label>
                        <input
                          type="number"
                          value={editForm.order}
                          onChange={(e) => setEditForm((f) => ({ ...f, order: Number(e.target.value) }))}
                          className="admin-input w-20 py-1.5 text-sm"
                          min="0"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}
                          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${editForm.isActive ? 'bg-[var(--color-gold)]' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isActive ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-xs text-gray-500">{editForm.isActive ? 'Visible' : 'Hidden'}</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(faq._id)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display row */
                  <div className="flex items-start gap-4">
                    <GripVertical size={16} className="text-gray-200 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--color-navy)] text-sm">{faq.question}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-gray-300 mr-1">#{faq.order}</span>
                          <button
                            onClick={() => handleToggleActive(faq)}
                            className={`p-1.5 rounded-lg transition-colors ${faq.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-50'}`}
                            title={faq.isActive ? 'Hide FAQ' : 'Show FAQ'}
                          >
                            {faq.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => startEdit(faq)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-navy)] hover:bg-gray-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          {deletingId === faq._id ? (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleDelete(faq._id)}
                                className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2.5 py-1 border border-gray-200 text-gray-500 text-[10px] font-medium rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(faq._id)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        FAQs are sorted by <strong>Display Order</strong> (lowest first). Use the order number to control position.
      </p>
    </div>
  );
}
