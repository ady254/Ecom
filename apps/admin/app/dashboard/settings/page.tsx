'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Store, Truck, Share2, Search, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi, type StoreSettings } from '@/lib/adminApi';

const TABS = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

type Tab = typeof TABS[number]['id'];

const DEFAULTS: StoreSettings = {
  storeName: 'MINARA',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 999,
  standardShippingCharge: 99,
  taxRate: 0,
  instagramUrl: '',
  facebookUrl: '',
  whatsappNumber: '',
  metaTitle: 'MINARA — Luxury Gifting',
  metaDescription: 'Discover handpicked luxury gifts for every occasion. Beautifully packaged, delivered across India.',
  maintenanceMode: false,
  orderEmailNotifications: true,
};

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then((res) => setSettings({ ...DEFAULTS, ...res.data.settings }))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof StoreSettings, v: string | number | boolean) => {
    setSettings((s) => ({ ...s, [k]: v }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await settingsApi.update(settings);
      setSettings({ ...DEFAULTS, ...res.data.settings });
      setDirty(false);
      toast.success('Settings saved successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your store preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="btn-admin-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {dirty && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 font-medium">
          You have unsaved changes
        </div>
      )}

      <div className="flex gap-6">
        {/* Tab nav */}
        <div className="shrink-0 w-48">
          <nav className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  tab === t.id
                    ? 'bg-[var(--color-navy)] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 admin-card">
          {tab === 'general' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-[var(--color-navy)] pb-3 border-b border-gray-100">General Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="settings-label">Store Name</label>
                  <input value={settings.storeName} onChange={(e) => set('storeName', e.target.value)} className="admin-input" />
                </div>
                <div>
                  <label className="settings-label">Store Email</label>
                  <input type="email" value={settings.storeEmail} onChange={(e) => set('storeEmail', e.target.value)} className="admin-input" placeholder="minaragifting01@gmail.com" />
                </div>
                <div>
                  <label className="settings-label">Store Phone</label>
                  <input value={settings.storePhone} onChange={(e) => set('storePhone', e.target.value)} className="admin-input" placeholder="+91 98765 43210" />
                </div>
                <div className="sm:col-span-2">
                  <label className="settings-label">Business Address</label>
                  <textarea value={settings.storeAddress} onChange={(e) => set('storeAddress', e.target.value)} className="admin-input resize-none" rows={3} placeholder="123, Street Name, City — 400001" />
                </div>
                <div>
                  <label className="settings-label">Currency</label>
                  <input value={settings.currency} onChange={(e) => set('currency', e.target.value)} className="admin-input" placeholder="INR" />
                </div>
                <div>
                  <label className="settings-label">Currency Symbol</label>
                  <input value={settings.currencySymbol} onChange={(e) => set('currencySymbol', e.target.value)} className="admin-input" placeholder="₹" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => set('maintenanceMode', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[var(--color-navy)]">Maintenance Mode</span>
                    <p className="text-xs text-gray-400 mt-0.5">Show a maintenance page to customers while you work on the store</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {tab === 'shipping' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-[var(--color-navy)] pb-3 border-b border-gray-100">Shipping Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="settings-label">Free Shipping Threshold (₹)</label>
                  <input type="number" value={settings.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold', Number(e.target.value))} className="admin-input" min="0" />
                  <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping</p>
                </div>
                <div>
                  <label className="settings-label">Standard Shipping Charge (₹)</label>
                  <input type="number" value={settings.standardShippingCharge} onChange={(e) => set('standardShippingCharge', Number(e.target.value))} className="admin-input" min="0" />
                  <p className="text-xs text-gray-400 mt-1">Applied when order is below free shipping threshold</p>
                </div>
                <div>
                  <label className="settings-label">Tax Rate (%)</label>
                  <input type="number" value={settings.taxRate} onChange={(e) => set('taxRate', Number(e.target.value))} className="admin-input" min="0" max="100" step="0.1" />
                  <p className="text-xs text-gray-400 mt-1">Set to 0 if prices are tax-inclusive</p>
                </div>
              </div>

              <div className="bg-[var(--color-cream)] rounded-xl p-4 border border-[rgba(207,169,106,0.2)]">
                <p className="text-xs font-semibold text-[var(--color-navy)] mb-2">Current Summary</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Free shipping on orders above ₹{settings.freeShippingThreshold}</li>
                  <li>• Standard charge: ₹{settings.standardShippingCharge}</li>
                  <li>• Tax: {settings.taxRate}% ({settings.taxRate === 0 ? 'tax-inclusive pricing' : 'added at checkout'})</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'social' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-[var(--color-navy)] pb-3 border-b border-gray-100">Social Media Links</h2>
              <div className="space-y-4">
                <div>
                  <label className="settings-label">Instagram URL</label>
                  <input value={settings.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} className="admin-input" placeholder="https://instagram.com/minaraindia" />
                </div>
                <div>
                  <label className="settings-label">Facebook URL</label>
                  <input value={settings.facebookUrl} onChange={(e) => set('facebookUrl', e.target.value)} className="admin-input" placeholder="https://facebook.com/minaraindia" />
                </div>
                <div>
                  <label className="settings-label">WhatsApp Number</label>
                  <input value={settings.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} className="admin-input" placeholder="919876543210 (country code without +)" />
                  <p className="text-xs text-gray-400 mt-1">Used for WhatsApp chat button. Format: 91XXXXXXXXXX</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'seo' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-[var(--color-navy)] pb-3 border-b border-gray-100">SEO & Metadata</h2>
              <div className="space-y-4">
                <div>
                  <label className="settings-label">Homepage Meta Title</label>
                  <input value={settings.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} className="admin-input" placeholder="MINARA — Luxury Gifting" />
                  <p className="text-xs text-gray-400 mt-1">{settings.metaTitle.length} / 60 chars (recommended max)</p>
                </div>
                <div>
                  <label className="settings-label">Homepage Meta Description</label>
                  <textarea value={settings.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} className="admin-input resize-none" rows={4} placeholder="Discover handpicked luxury gifts…" />
                  <p className="text-xs text-gray-400 mt-1">{settings.metaDescription.length} / 160 chars (recommended max)</p>
                </div>

                {/* Google SERP Preview */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Google Preview</p>
                  <div className="space-y-0.5">
                    <p className="text-[#1a0dab] text-base hover:underline cursor-pointer">{settings.metaTitle || 'Page Title'}</p>
                    <p className="text-[#006621] text-xs">https://www.minaragifting.com</p>
                    <p className="text-[#545454] text-sm leading-snug">{settings.metaDescription || 'Page description will appear here…'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-[var(--color-navy)] pb-3 border-b border-gray-100">Notification Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.orderEmailNotifications}
                    onChange={(e) => set('orderEmailNotifications', e.target.checked)}
                    className="w-4 h-4 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[var(--color-navy)]">Order Confirmation Emails</span>
                    <p className="text-xs text-gray-400 mt-0.5">Send automatic confirmation emails to customers when they place an order</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
