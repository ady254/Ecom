'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, X, Loader2, ImageIcon, ExternalLink, Upload } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { bannersApi, type Banner } from '@/lib/adminApi';

const POSITIONS = ['hero', 'mid', 'bottom'] as const;

const EMPTY: Partial<Banner> = {
  title: '', subtitle: '', buttonText: '', buttonLink: '',
  image: '', bgColor: '#0B2342', position: 'hero', isActive: true, order: 0,
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<Partial<Banner>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await bannersApi.getAll();
      setBanners(res.data.banners);
    } catch { toast.error('Failed to load banners'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (b: Banner) => { setEditing(b); setForm({ ...b }); setShowModal(true); };
  const setField = (k: keyof Banner, v: string | boolean | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleImageFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await bannersApi.uploadImage(file);
      setForm((f) => ({ ...f, image: url }));
      toast.success('Image uploaded');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const res = await bannersApi.update(editing._id, form);
        setBanners((prev) => prev.map((b) => b._id === editing._id ? res.data.banner : b));
        toast.success('Banner updated');
      } else {
        const res = await bannersApi.create(form);
        setBanners((prev) => [...prev, res.data.banner]);
        toast.success('Banner created');
      }
      setShowModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return;
    setDeleting(id);
    try {
      await bannersApi.delete(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      toast.success('Banner deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const toggleActive = async (b: Banner) => {
    try {
      const res = await bannersApi.update(b._id, { isActive: !b.isActive });
      setBanners((prev) => prev.map((x) => x._id === b._id ? res.data.banner : x));
    } catch { toast.error('Failed to update'); }
  };

  const positionColor: Record<string, string> = {
    hero: 'bg-blue-100 text-blue-700',
    mid: 'bg-purple-100 text-purple-700',
    bottom: 'bg-orange-100 text-orange-700',
  };

  const heroBanners = banners.filter((b) => b.position === 'hero');
  const otherBanners = banners.filter((b) => b.position !== 'hero');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Hero Banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {heroBanners.length} hero slides &nbsp;·&nbsp; images auto-rotate on the storefront
          </p>
        </div>
        <button onClick={openNew} className="btn-admin-gold">
          <Plus size={15} /> Add Banner
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-700 space-y-1">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc list-inside space-y-0.5 text-xs text-blue-600">
          <li>Banners with position <strong>Hero</strong> appear in the full-screen homepage slider.</li>
          <li>Set <strong>Order</strong> to control the sequence (0 = first).</li>
          <li>Recommended image size: <strong>1920 × 1080 px</strong>, landscape, ≤ 5 MB.</li>
          <li>If no image is uploaded, the banner shows a solid background colour instead.</li>
        </ul>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-xl" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="admin-card text-center py-16">
          <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 mb-4">No banners yet. Add your first banner to display on the store.</p>
          <button onClick={openNew} className="btn-admin-gold">
            <Plus size={14} /> Add Banner
          </button>
        </div>
      ) : (
        <>
          {/* Hero banners */}
          {heroBanners.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Hero Slider ({heroBanners.length} slide{heroBanners.length !== 1 ? 's' : ''})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroBanners.map((b, idx) => (
                  <BannerCard
                    key={b._id}
                    banner={b}
                    index={idx}
                    positionColor={positionColor}
                    deleting={deleting}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggle={toggleActive}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mid / Bottom banners */}
          {otherBanners.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 mt-6">
                Other Banners
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherBanners.map((b, idx) => (
                  <BannerCard
                    key={b._id}
                    banner={b}
                    index={idx}
                    positionColor={positionColor}
                    deleting={deleting}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggle={toggleActive}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl z-10 max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-[var(--color-navy)]">
                {editing ? 'Edit Banner' : 'New Banner'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* ── Image upload ────────────────────────────────────────── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Banner Image
                </label>

                {form.image ? (
                  /* Preview */
                  <div className="relative rounded-xl overflow-hidden h-44 bg-gray-100">
                    <Image src={form.image} alt="Banner preview" fill sizes="560px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-medium truncate max-w-[70%]">
                        {form.title || 'Banner preview'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--color-gold)] hover:bg-[var(--color-cream)] transition-colors"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    {uploading ? (
                      <Loader2 size={24} className="text-[var(--color-gold)] animate-spin" />
                    ) : (
                      <>
                        <Upload size={22} className="text-gray-300" />
                        <p className="text-xs text-gray-400 text-center">
                          <span className="font-semibold text-[var(--color-navy)]">Click to upload</span>
                          {' '}or drag & drop<br />
                          JPG, PNG or WebP · max 5 MB · 1920×1080 recommended
                        </p>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ''; }}
                />
              </div>

              {/* ── Text fields ─────────────────────────────────────────── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  value={form.title || ''}
                  onChange={(e) => setField('title', e.target.value)}
                  className="admin-input"
                  placeholder="The Gift They'll Always Remember"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Subtitle
                </label>
                <input
                  value={form.subtitle || ''}
                  onChange={(e) => setField('subtitle', e.target.value)}
                  className="admin-input"
                  placeholder="Handpicked luxury gifts for every occasion"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Button Text
                  </label>
                  <input
                    value={form.buttonText || ''}
                    onChange={(e) => setField('buttonText', e.target.value)}
                    className="admin-input"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Button Link
                  </label>
                  <input
                    value={form.buttonLink || ''}
                    onChange={(e) => setField('buttonLink', e.target.value)}
                    className="admin-input"
                    placeholder="/products?tags=wedding"
                  />
                </div>
              </div>

              {/* ── Meta ────────────────────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Fallback BG
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.bgColor || '#0B2342'}
                      onChange={(e) => setField('bgColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-200 p-0.5"
                    />
                    <input
                      value={form.bgColor || ''}
                      onChange={(e) => setField('bgColor', e.target.value)}
                      className="admin-input flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Position
                  </label>
                  <select
                    value={form.position || 'hero'}
                    onChange={(e) => setField('position', e.target.value)}
                    className="admin-input"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Order
                  </label>
                  <input
                    type="number"
                    value={form.order ?? 0}
                    onChange={(e) => setField('order', Number(e.target.value))}
                    className="admin-input"
                    min="0"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) => setField('isActive', e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--color-navy)]"
                />
                <span className="text-sm font-medium text-gray-700">Active (visible on store)</span>
              </label>
            </form>

            {/* Modal footer */}
            <div className="px-6 pb-6 pt-4 border-t border-gray-100 shrink-0 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 py-2.5 bg-[var(--color-navy)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? 'Update Banner' : 'Create Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Banner card ──────────────────────────────────────────────────────────── */
function BannerCard({
  banner: b, index,
  positionColor, deleting,
  onEdit, onDelete, onToggle,
}: {
  banner: Banner;
  index: number;
  positionColor: Record<string, string>;
  deleting: string | null;
  onEdit: (b: Banner) => void;
  onDelete: (id: string, title: string) => void;
  onToggle: (b: Banner) => void;
}) {
  return (
    <div className={`admin-card overflow-hidden ${!b.isActive ? 'opacity-60' : ''}`}>
      {/* Slide preview */}
      <div
        className="relative rounded-xl overflow-hidden mb-4 h-36"
        style={{ backgroundColor: b.bgColor || '#0B2342' }}
      >
        {b.image ? (
          <Image src={b.image} alt={b.title} fill sizes="500px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon size={28} className="text-white/20" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex flex-col justify-end px-4 pb-3">
          <p className="font-heading text-white text-base font-semibold leading-snug line-clamp-2">
            {b.title}
          </p>
          {b.subtitle && (
            <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{b.subtitle}</p>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="w-5 h-5 rounded-full bg-black/40 text-white text-[9px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span className={`status-badge text-[10px] ${positionColor[b.position]}`}>{b.position}</span>
          <span className={`status-badge text-[10px] ${b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {b.isActive ? 'Live' : 'Hidden'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-[var(--color-navy)] truncate">{b.title}</p>
          {b.buttonLink && (
            <a
              href={b.buttonLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-[var(--color-gold-dark)] hover:underline truncate"
            >
              <ExternalLink size={10} /> {b.buttonLink}
            </a>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggle(b)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              b.isActive
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {b.isActive ? 'Live' : 'Hidden'}
          </button>
          <button
            onClick={() => onEdit(b)}
            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-[var(--color-navy)] transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(b._id, b.title)}
            disabled={deleting === b._id}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            {deleting === b._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
