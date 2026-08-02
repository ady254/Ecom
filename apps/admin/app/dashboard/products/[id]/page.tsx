'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader2, X, Trash2, Plus, Sparkles, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAdminApi, categoriesAdminApi, type Category } from '@/lib/adminApi';
import ImageUploader from '@/components/products/ImageUploader';

type VariantOption = { label: string; price?: number };
type VariantGroup = { name: string; options: VariantOption[] };

const OPTION_PRESETS: Record<string, { label: string }[]> = {
  'Quran Type': [
    { label: 'Arabic' },
    { label: 'Arabic Color Coded' },
    { label: 'Premium Arabic Kaaba' },
    { label: 'Urdu Roman English Translation' },
    { label: 'Urdu Translation' },
    { label: 'English Translation' },
    { label: 'Hindi Translation' },
    { label: 'Gujarati Translation' },
  ],
  'Tasbeeh Type': [
    { label: 'with Bismillah' },
    { label: 'with Name' },
  ],
  'Janamaz Shape': [
    { label: 'Rectangle' },
    { label: 'Dome' },
  ],
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [codAvailable, setCodAvailable] = useState(true);
  const [customFields, setCustomFields] = useState<Array<{ label: string; placeholder: string; required: boolean }>>([]);
  const [newField, setNewField] = useState({ label: '', placeholder: '', required: false });

  // Unified variants
  const [variants, setVariants] = useState<VariantGroup[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newOptInput, setNewOptInput] = useState<{ [key: number]: { label: string; price: string } }>({});

  const addVariantGroup = (groupName?: string) => {
    const v = (groupName ?? newVariantName).trim();
    if (v && !variants.find(x => x.name.toLowerCase() === v.toLowerCase())) {
      setVariants(prev => [...prev, { name: v, options: [] }]);
    }
    setNewVariantName('');
  };

  const addVariantOption = (index: number, preset?: { label: string }) => {
    const label = preset ? preset.label : (newOptInput[index]?.label ?? '').trim();
    const priceRaw = preset ? '' : (newOptInput[index]?.price ?? '');
    const priceVal = priceRaw ? Number(priceRaw) : undefined;

    if (!label) return;
    if (variants[index].options.find(x => x.label === label)) return;

    setVariants(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        options: [...next[index].options, { label, ...(priceVal !== undefined ? { price: priceVal } : {}) }],
      };
      return next;
    });
    if (!preset) {
      setNewOptInput(prev => ({ ...prev, [index]: { label: '', price: '' } }));
    }
  };

  const removeVariantOption = (groupIndex: number, optionLabel: string) => {
    setVariants(prev => {
      const next = [...prev];
      next[groupIndex] = {
        ...next[groupIndex],
        options: next[groupIndex].options.filter(x => x.label !== optionLabel),
      };
      return next;
    });
  };

  const removeVariantGroup = (groupIndex: number) => {
    setVariants(prev => prev.filter((_, i) => i !== groupIndex));
  };

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [productRes, catsRes] = await Promise.all([
          productsAdminApi.getById(id),
          categoriesAdminApi.getAll(),
        ]);
        const p = productRes.data.product;
        setCategories(catsRes.data.categories);
        setName(p.name);
        setDescription(p.description ?? '');
        setShortDescription(p.shortDescription ?? '');
        setPrice(String(p.price));
        setComparePrice(p.comparePrice ? String(p.comparePrice) : '');
        setStock(String(p.stock));
        setSku(p.sku ?? '');
        setWeight(p.weight ? String(p.weight) : '');
        setCategoryIds(
          (p.categories && p.categories.length > 0
            ? p.categories
            : p.category
              ? [p.category]
              : [])
            .map((c) => c._id)
        );
        setTags(p.tags ?? []);
        setIsFeatured(p.isFeatured);
        setIsActive(p.isActive);
        setIsCustomizable(p.isCustomizable ?? false);
        setCodAvailable(p.codAvailable ?? true);
        setCustomFields((p.customFields ?? []).map((f) => ({
          label: f.label,
          placeholder: f.placeholder ?? '',
          required: f.required ?? false,
        })));

        // Build unified variants from the new variants[] array first,
        // then migrate any legacy quranOptions / tasbeehOptions / janamazOptions
        // so editing old products automatically converts them.
        const mergedVariants: VariantGroup[] = (p.variants ?? []).map((v: VariantGroup) => ({
          name: v.name,
          options: v.options.map((o: VariantOption) => ({ label: o.label, ...(o.price !== undefined ? { price: o.price } : {}) })),
        }));

        const alreadyHasQuran = mergedVariants.some(v => v.name === 'Quran Type');
        if (!alreadyHasQuran && p.quranOptions?.enabled && (p.quranOptions.languages ?? []).length > 0) {
          mergedVariants.push({ name: 'Quran Type', options: p.quranOptions.languages.map((l: string) => ({ label: l })) });
        }

        const alreadyHasTasbeeh = mergedVariants.some(v => v.name === 'Tasbeeh Type');
        if (!alreadyHasTasbeeh && p.tasbeehOptions?.enabled && (p.tasbeehOptions.types ?? []).length > 0) {
          mergedVariants.push({ name: 'Tasbeeh Type', options: p.tasbeehOptions.types.map((t: string) => ({ label: t })) });
        }

        const alreadyHasJanamaz = mergedVariants.some(v => v.name === 'Janamaz Shape');
        if (!alreadyHasJanamaz && p.janamazOptions?.enabled && (p.janamazOptions.shapes ?? []).length > 0) {
          mergedVariants.push({ name: 'Janamaz Shape', options: p.janamazOptions.shapes.map((s: string) => ({ label: s })) });
        }

        setVariants(mergedVariants);
        setImages(p.images.map((img: { url: string }) => img.url));
      } catch {
        toast.error('Failed to load product');
        router.push('/dashboard/products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Product name is required'); return; }
    if (!price || Number(price) <= 0) { toast.error('Valid price is required'); return; }
    if (!stock || Number(stock) < 0) { toast.error('Stock quantity is required'); return; }

    setSaving(true);
    try {
      await productsAdminApi.update(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : undefined,
        stock: Number(stock),
        sku: sku.trim() || undefined,
        weight: weight ? Number(weight) : undefined,
        categories: categoryIds.length > 0 ? categoryIds : undefined,
        tags,
        isFeatured,
        isActive,
        isCustomizable,
        codAvailable,
        customFields: isCustomizable ? customFields : [],
        variants: variants.filter(v => v.options.length > 0),
        images: images.map((url, i) => ({ url, alt: `${name} ${i + 1}` })),
      });
      toast.success('Product updated');
      router.push('/dashboard/products');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to update product';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this product permanently? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await productsAdminApi.delete(id);
      toast.success('Product deleted');
      router.push('/dashboard/products');
    } catch {
      toast.error('Failed to delete product');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="skeleton h-10 w-64 rounded" />
        <div className="admin-card space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products" className="p-2 rounded-lg hover:bg-white text-gray-500 hover:text-[var(--color-navy)] transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-navy)]">Edit Product</h1>
            <p className="text-sm text-gray-500 truncate max-w-xs">{name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-40"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
          <button type="submit" disabled={saving} className="btn-admin-gold">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card">
            <h2 className="font-semibold text-[var(--color-navy)] mb-4">Product Images</h2>
            <ImageUploader images={images} onChange={setImages} />
            <p className="text-xs text-gray-400 mt-2">First image is the main/cover image</p>
          </div>

          <div className="admin-card space-y-5">
            <h2 className="font-semibold text-[var(--color-navy)]">Basic Information</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="admin-input" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Short Description</label>
              <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="One-line summary" className="admin-input" maxLength={200} />
              <p className="text-xs text-gray-400 mt-1">{shortDescription.length}/200</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="admin-input resize-none" placeholder="Detailed product description…" />
            </div>
          </div>

          <div className="admin-card space-y-5">
            <h2 className="font-semibold text-[var(--color-navy)]">Pricing &amp; Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Base Price (₹) <span className="text-red-400">*</span>
                </label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="1" className="admin-input" required />
                <p className="text-xs text-gray-400 mt-1">Shown before a customer selects an option</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Compare Price (₹)</label>
                <input type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} min="0" step="1" className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Stock <span className="text-red-400">*</span></label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min="0" className="admin-input" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">SKU</label>
                <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Weight (g)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min="0" className="admin-input" />
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <h2 className="font-semibold text-[var(--color-navy)]">Visibility</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Visible in store</p>
              </div>
              <div onClick={() => setIsActive(!isActive)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isActive ? 'bg-[var(--color-gold)]' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : ''}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Featured</p>
                <p className="text-xs text-gray-400">Show on homepage</p>
              </div>
              <div onClick={() => setIsFeatured(!isFeatured)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isFeatured ? 'bg-[var(--color-navy)]' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isFeatured ? 'translate-x-5' : ''}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Customizable</p>
                <p className="text-xs text-gray-400">Allow name/message personalization</p>
              </div>
              <div onClick={() => setIsCustomizable(!isCustomizable)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isCustomizable ? 'bg-[var(--color-gold)]' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isCustomizable ? 'translate-x-5' : ''}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Cash on Delivery</p>
                <p className="text-xs text-gray-400">
                  {codAvailable ? 'Customers can pay on delivery' : 'Prepaid (online payment) only'}
                </p>
              </div>
              <div onClick={() => setCodAvailable(!codAvailable)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${codAvailable ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${codAvailable ? 'translate-x-5' : ''}`} />
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
              <p className="text-xs text-gray-400">Define what customers fill in before adding to cart.</p>

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
                  placeholder="Field label (e.g. Groom's Name)"
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

          {/* ── Unified Product Options ── */}
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2">
              <Tag size={15} className="text-[var(--color-navy)]" />
              <h2 className="font-semibold text-[var(--color-navy)]">Product Options &amp; Pricing</h2>
            </div>
            <p className="text-xs text-gray-400">
              Add option groups (e.g. &quot;Quran Type&quot;, &quot;Color&quot;). Each option can have its
              own price — the store will update the displayed price when the customer selects it.
            </p>

            {/* Quick-start presets */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Start</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(OPTION_PRESETS).map((groupName) => {
                  const alreadyAdded = variants.some(v => v.name === groupName);
                  return (
                    <button
                      key={groupName}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addVariantGroup(groupName)}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-[var(--color-gold-dark)] hover:text-[var(--color-navy)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      + {groupName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Existing groups */}
            {variants.map((v, i) => {
              const presets = OPTION_PRESETS[v.name] ?? [];
              const inp = newOptInput[i] ?? { label: '', price: '' };
              return (
                <div key={i} className="border border-gray-100 bg-gray-50/60 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--color-navy)]">{v.name}</h3>
                    <button type="button" onClick={() => removeVariantGroup(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>

                  {presets.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Presets</p>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map((p) => {
                          const used = v.options.some(o => o.label === p.label);
                          return (
                            <button
                              key={p.label}
                              type="button"
                              disabled={used}
                              onClick={() => addVariantOption(i, p)}
                              className="text-xs px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-[var(--color-gold-dark)] hover:text-[var(--color-navy)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              + {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inp.label}
                      onChange={(e) => setNewOptInput(prev => ({ ...prev, [i]: { ...inp, label: e.target.value } }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariantOption(i); } }}
                      placeholder="Option label…"
                      className="admin-input flex-1 py-1.5 text-xs"
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">₹</span>
                      <input
                        type="number"
                        value={inp.price}
                        onChange={(e) => setNewOptInput(prev => ({ ...prev, [i]: { ...inp, price: e.target.value } }))}
                        placeholder="Price"
                        min="0"
                        className="admin-input py-1.5 text-xs pl-6 w-24"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addVariantOption(i)}
                      disabled={!inp.label.trim()}
                      className="flex items-center gap-1 px-3 py-1 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-40"
                    >
                      <Plus size={11} /> Add
                    </button>
                  </div>

                  {v.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {v.options.map((opt) => (
                        <span
                          key={opt.label}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[rgba(207,169,106,0.4)] shadow-sm text-[var(--color-navy)] text-xs rounded-full font-medium"
                        >
                          {opt.label}
                          {opt.price !== undefined && (
                            <span className="text-[var(--color-gold-dark)] font-bold">· ₹{opt.price}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeVariantOption(i, opt.label)}
                            className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add new group */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariantGroup(); } }}
                placeholder="New option group (e.g. Cover Type, Color)…"
                className="admin-input flex-1 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => addVariantGroup()}
                disabled={!newVariantName.trim()}
                className="flex items-center gap-1 px-3 py-1.5 border-2 border-[var(--color-navy)] text-[var(--color-navy)] text-xs font-bold rounded-lg hover:bg-[var(--color-navy)] hover:text-white transition-colors disabled:opacity-40"
              >
                <Plus size={12} /> Add Group
              </button>
            </div>
          </div>

          <div className="admin-card space-y-3">
            <h2 className="font-semibold text-[var(--color-navy)]">Categories</h2>
            <p className="text-xs text-gray-500 mb-2">Select one or more categories</p>
            {categories.length === 0 ? (
              <p className="text-xs text-gray-400">
                No categories yet.{' '}
                <a href="/dashboard/categories" className="text-[var(--color-gold-dark)] hover:underline">
                  Create one first
                </a>
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(cat._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCategoryIds([...categoryIds, cat._id]);
                        } else {
                          setCategoryIds(categoryIds.filter((id) => id !== cat._id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="admin-card space-y-3">
            <h2 className="font-semibold text-[var(--color-navy)]">Tags</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag &amp; press Enter"
                className="admin-input flex-1"
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-[var(--color-navy)] text-white text-sm rounded-lg hover:bg-[var(--color-navy-dark)] transition-colors">
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
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-40">
          <Trash2 size={14} />
          {deleting ? 'Deleting…' : 'Delete Product'}
        </button>
        <div className="flex gap-3">
          <Link href="/dashboard/products" className="btn-admin-primary" style={{ background: '#6b7280' }}>Cancel</Link>
          <button type="submit" disabled={saving} className="btn-admin-gold">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
