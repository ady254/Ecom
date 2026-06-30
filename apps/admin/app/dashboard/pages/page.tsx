'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, FileText, Globe, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { pagesApi, type CmsPage } from '@/lib/adminApi';

const EMPTY: Partial<CmsPage> = {
  title: '', slug: '', content: '', isPublished: false, seoTitle: '', seoDescription: '',
};

const PRESET_PAGES = [
  { title: 'About Us', slug: 'about' },
  { title: 'Privacy Policy', slug: 'privacy-policy' },
  { title: 'Terms & Conditions', slug: 'terms' },
  { title: 'Return Policy', slug: 'return-policy' },
  { title: 'Shipping Policy', slug: 'shipping-policy' },
  { title: 'FAQs', slug: 'faqs' },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function PagesAdminPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await pagesApi.getAll();
      setPages(res.data.pages);
    } catch { toast.error('Failed to load pages'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const openNew = (preset?: { title: string; slug: string }) => {
    setEditing(null);
    setForm(preset ? { ...EMPTY, title: preset.title, slug: preset.slug } : EMPTY);
    setView('edit');
  };

  const openEdit = (p: CmsPage) => { setEditing(p); setForm({ ...p }); setView('edit'); };

  const set = (k: keyof typeof EMPTY, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleChange = (v: string) => {
    setForm((f) => ({ ...f, title: v, slug: f.slug || slugify(v) }));
  };

  const handleSave = async (publish?: boolean) => {
    if (!form.title?.trim()) { toast.error('Title is required'); return; }
    if (!form.slug?.trim()) { toast.error('Slug is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, isPublished: publish ?? form.isPublished };
      if (editing) {
        const res = await pagesApi.update(editing._id, payload);
        setPages((prev) => prev.map((p) => p._id === editing._id ? res.data.page : p));
        toast.success('Page saved');
      } else {
        const res = await pagesApi.create(payload);
        setPages((prev) => [...prev, res.data.page]);
        toast.success('Page created');
      }
      setView('list');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete page "${title}"?`)) return;
    setDeleting(id);
    try {
      await pagesApi.delete(id);
      setPages((prev) => prev.filter((p) => p._id !== id));
      toast.success('Page deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const existingSlugs = new Set(pages.map((p) => p.slug));
  const missingPresets = PRESET_PAGES.filter((pp) => !existingSlugs.has(pp.slug));

  // ─── Edit view ───────────────────────────────────────────────────────────────
  if (view === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-navy)] transition-colors">
            ← Back to pages
          </button>
          <div className="flex items-center gap-3">
            <span className={`status-badge ${form.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {form.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main editor */}
          <div className="space-y-4">
            <div className="admin-card space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Page Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="admin-input text-lg font-semibold"
                  placeholder="About Us"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">URL Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 shrink-0">/pages/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => set('slug', slugify(e.target.value))}
                    className="admin-input font-mono text-sm flex-1"
                    placeholder="about-us"
                  />
                </div>
              </div>
            </div>

            <div className="admin-card">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Page Content</label>
              <textarea
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                className="admin-input w-full resize-none font-mono text-sm leading-relaxed"
                rows={20}
                placeholder="Write page content here. You can use HTML tags like <p>, <h2>, <ul>, <strong> etc."
              />
              <p className="text-xs text-gray-400 mt-2">Supports basic HTML: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-[var(--color-navy)] mb-4">Publish</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="w-full py-2.5 bg-[var(--color-navy)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                  Publish
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
              </div>
            </div>

            <div className="admin-card space-y-4">
              <h3 className="text-sm font-semibold text-[var(--color-navy)]">SEO</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Meta Title</label>
                <input value={form.seoTitle || ''} onChange={(e) => set('seoTitle', e.target.value)} className="admin-input text-sm" placeholder="Override page title for search" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Meta Description</label>
                <textarea value={form.seoDescription || ''} onChange={(e) => set('seoDescription', e.target.value)} className="admin-input text-sm resize-none" rows={3} placeholder="150-160 character description for Google" />
                <p className="text-xs text-gray-400 mt-1">{(form.seoDescription || '').length} / 160 chars</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── List view ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pages.length} pages created</p>
        </div>
        <button onClick={() => openNew()} className="btn-admin-gold">
          <Plus size={15} /> New Page
        </button>
      </div>

      {/* Quick-create missing standard pages */}
      {missingPresets.length > 0 && (
        <div className="admin-card border border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">Quick Create Standard Pages</p>
          <div className="flex flex-wrap gap-2">
            {missingPresets.map((pp) => (
              <button
                key={pp.slug}
                onClick={() => openNew(pp)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Plus size={11} /> {pp.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : pages.length === 0 ? (
        <div className="admin-card text-center py-16">
          <FileText size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 mb-4">No pages created yet. Start with a standard page above.</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th className="pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p._id}>
                    <td className="pl-6">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-gray-300" />
                        <span className="font-medium text-sm text-[var(--color-navy)]">{p.title}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-gray-500">/pages/{p.slug}</td>
                    <td>
                      <span className={`status-badge ${p.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isPublished ? <><Globe size={10} className="inline mr-1" />Published</> : <><EyeOff size={10} className="inline mr-1" />Draft</>}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400">
                      {new Date(p.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="pr-6">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-[var(--color-navy)] transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.title)} disabled={deleting === p._id} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40">
                          {deleting === p._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
