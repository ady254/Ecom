'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader2, X, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAdminApi, categoriesAdminApi, type Category } from '@/lib/adminApi';
import ImageUploader from '@/components/products/ImageUploader';

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [customFields, setCustomFields] = useState<Array<{ label: string; placeholder: string; required: boolean }>>([]);
  const [newField, setNewField] = useState({ label: '', placeholder: '', required: false });

  useEffect(() => {
    categoriesAdminApi.getAll()
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Product name is required'); return; }
    if (!price || Number(price) <= 0) { toast.error('Valid price is required'); return; }
    if (!stock || Number(stock) < 0) { toast.error('Stock quantity is required'); return; }
    if (images.length === 0) { toast.error('Upload at least one image'); return; }

    setSaving(true);
    try {
      await productsAdminApi.create({
        name: name.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim() || undefined,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : undefined,
        stock: Number(stock),
        sku: sku.trim() || undefined,
        weight: weight ? Number(weight) : undefined,
        category: categoryId || undefined,
        tags,
        isFeatured,
        isActive,
        isCustomizable,
        customFields: isCustomizable ? customFields : [],
        images: images.map((url, i) => ({ url, alt: `${name} ${i + 1}` })),
      });
      toast.success('Product created successfully!');
      router.push('/dashboard/products');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to create product';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products" className="p-2 rounded-lg hover:bg-white text-gray-500 hover:text-[var(--color-navy)] transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-navy)]">Add Product</h1>
            <p className="text-sm text-gray-500">Fill in the details below</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-admin-gold"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="admin-card">
            <h2 className="font-semibold text-[var(--color-navy)] mb-4">Product Images</h2>
            <ImageUploader images={images} onChange={setImages} />
            <p className="text-xs text-gray-400 mt-2">First image is the main/cover image shown in listings</p>
          </div>

          {/* Basic Info */}
          <div className="admin-card space-y-5">
            <h2 className="font-semibold text-[var(--color-navy)]">Basic Information</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Saffron Gift Box"
                className="admin-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Short Description
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="One-line summary shown in search results"
                className="admin-input"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1">{shortDescription.length}/200</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Full Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed product description…"
                rows={5}
                className="admin-input resize-none"
                required
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="admin-card space-y-5">
            <h2 className="font-semibold text-[var(--color-navy)]">Pricing & Inventory</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="admin-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Compare Price (₹)
                </label>
                <input
                  type="number"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="Original price (for strikethrough)"
                  min="0"
                  step="1"
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Stock <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="admin-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. RSG-001"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Weight (g)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="500"
                  min="0"
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — meta */}
        <div className="space-y-6">
          {/* Status */}
          <div className="admin-card space-y-4">
            <h2 className="font-semibold text-[var(--color-navy)]">Visibility</h2>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Visible in store</p>
              </div>
              <div
                onClick={() => setIsActive(!isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isActive ? 'bg-[var(--color-gold)]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : ''}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Featured</p>
                <p className="text-xs text-gray-400">Show on homepage</p>
              </div>
              <div
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isFeatured ? 'bg-[var(--color-navy)]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isFeatured ? 'translate-x-5' : ''}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Customizable</p>
                <p className="text-xs text-gray-400">Allow name/message personalization</p>
              </div>
              <div
                onClick={() => setIsCustomizable(!isCustomizable)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isCustomizable ? 'bg-[var(--color-gold)]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isCustomizable ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>

          {/* Custom fields editor */}
          {isCustomizable && (
            <div className="admin-card space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[var(--color-gold-dark)]" />
                <h2 className="font-semibold text-[var(--color-navy)]">Personalization Fields</h2>
              </div>
              <p className="text-xs text-gray-400">Define what customers need to fill in before adding to cart.</p>

              {customFields.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <Sparkles size={10} className="text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-amber-800">{f.label}</p>
                    {f.placeholder && <p className="text-[10px] text-amber-600">Placeholder: {f.placeholder}</p>}
                    {f.required && <p className="text-[10px] text-red-500">Required</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomFields(customFields.filter((_, j) => j !== i))}
                    className="p-1 text-amber-400 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  value={newField.label}
                  onChange={(e) => setNewField((f) => ({ ...f, label: e.target.value }))}
                  placeholder="Field label (e.g. Name on plate)"
                  className="admin-input py-2 text-sm w-full"
                />
                <input
                  type="text"
                  value={newField.placeholder}
                  onChange={(e) => setNewField((f) => ({ ...f, placeholder: e.target.value }))}
                  placeholder="Placeholder text (optional)"
                  className="admin-input py-2 text-sm w-full"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField((f) => ({ ...f, required: e.target.checked }))}
                      className="rounded"
                    />
                    Required field
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newField.label.trim()) return;
                      setCustomFields([...customFields, { ...newField, label: newField.label.trim() }]);
                      setNewField({ label: '', placeholder: '', required: false });
                    }}
                    disabled={!newField.label.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-40"
                  >
                    <Plus size={11} /> Add Field
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category */}
          <div className="admin-card space-y-3">
            <h2 className="font-semibold text-[var(--color-navy)]">Category</h2>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="admin-input"
            >
              <option value="">— No category —</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-gray-400">
                No categories yet.{' '}
                <a href="/dashboard/categories" className="text-[var(--color-gold-dark)] hover:underline">
                  Create one first
                </a>
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="admin-card space-y-3">
            <h2 className="font-semibold text-[var(--color-navy)]">Tags</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag & press Enter"
                className="admin-input flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-[var(--color-navy)] text-white text-sm rounded-lg hover:bg-[var(--color-navy-dark)] transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--color-cream)] text-[var(--color-navy)] text-xs rounded-full font-medium">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400">Common: bestseller, new, sale, organic, premium</p>
          </div>
        </div>
      </div>

      {/* Bottom save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/dashboard/products" className="btn-admin-primary" style={{ background: '#6b7280' }}>
          Cancel
        </Link>
        <button type="submit" disabled={saving} className="btn-admin-gold">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
