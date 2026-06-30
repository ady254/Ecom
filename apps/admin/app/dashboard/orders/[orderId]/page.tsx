'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, CheckCircle2, Package, Truck, Home,
  Gift, Edit2, Save, X, ExternalLink, AlertTriangle, Pencil, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@minara/utils';
import { ordersApi, type OrderDetail } from '@/lib/adminApi';

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // AWB entry
  const [awbInput, setAwbInput] = useState('');
  const [awbEdit, setAwbEdit] = useState(false);
  const [savingAwb, setSavingAwb] = useState(false);

  useEffect(() => {
    ordersApi.getOne(orderId)
      .then((res) => {
        setOrder(res.data.order);
        setNewStatus(res.data.order.status);
      })
      .catch(() => setError('Could not load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.status) return;
    setUpdatingStatus(true);
    try {
      const res = await ordersApi.updateStatus(orderId, newStatus);
      setOrder(res.data.order);
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveAwb = async () => {
    if (!awbInput.trim()) return;
    setSavingAwb(true);
    try {
      const res = await ordersApi.enterAWB(orderId, awbInput.trim());
      setOrder(res.data.order);
      setNewStatus(res.data.order.status);
      setAwbEdit(false);
      setAwbInput('');
      toast.success('AWB number saved and order marked shipped');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save AWB');
    } finally {
      setSavingAwb(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-navy)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-8">
        <AlertTriangle size={40} className="text-red-400" />
        <h2 className="text-xl font-semibold text-[var(--color-navy)]">Order Not Found</h2>
        <p className="text-gray-400 text-sm">{error}</p>
        <button onClick={() => router.back()} className="text-sm text-[var(--color-gold-dark)] hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const customerName = order.user?.name || order.guestInfo?.name || 'Guest';
  const customerEmail = order.user?.email || order.guestInfo?.email || '—';
  const completedIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Order #{order.orderId}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={`status-badge text-sm px-4 py-1.5 ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {order.status}
        </span>
      </div>

      {/* Status tracker */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="admin-card">
          <h2 className="font-semibold text-[var(--color-navy)] mb-5">Order Progress</h2>
          <div className="flex items-start gap-0 overflow-x-auto pb-1">
            {STATUS_STEPS.map((step, i) => {
              const isCompleted = i <= completedIndex;
              const isCurrent = i === completedIndex;
              const icons = [CheckCircle2, CheckCircle2, Package, Package, Truck, Home];
              const Icon = icons[i] ?? CheckCircle2;
              return (
                <div key={step.key} className="flex-1 relative min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 relative transition-all ${
                      isCompleted ? 'bg-[var(--color-navy)] text-white' : 'bg-gray-100 text-gray-300'
                    } ${isCurrent ? 'ring-4 ring-[var(--color-navy)]/20' : ''}`}>
                      <Icon size={15} />
                    </div>
                    <p className={`text-[10px] mt-2 text-center font-medium whitespace-nowrap ${isCompleted ? 'text-[var(--color-navy)]' : 'text-gray-300'}`}>
                      {step.label}
                    </p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`absolute top-[18px] left-1/2 w-full h-0.5 transition-all ${
                      i < completedIndex ? 'bg-[var(--color-navy)]' : 'bg-gray-100'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="admin-card">
            <h2 className="font-semibold text-[var(--color-navy)] mb-4">
              Items Ordered ({order.items?.length ?? 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, i) => {
                const customEntries = item.variant ? Object.entries(item.variant) : [];
                return (
                  <div key={i} className="flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-[var(--color-cream)] overflow-hidden relative shrink-0 border border-gray-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-navy)] text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qty: {item.quantity} · {formatCurrency(item.price)} each
                      </p>

                      {/* Customization fields */}
                      {customEntries.length > 0 && (
                        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles size={11} className="text-amber-600" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                              Personalization
                            </span>
                          </div>
                          <div className="space-y-1">
                            {customEntries.map(([label, value]) => (
                              <div key={label} className="flex items-start gap-2 text-xs">
                                <span className="text-amber-700 font-medium shrink-0">{label}:</span>
                                <span className="text-amber-900 font-semibold">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-[var(--color-navy)] text-sm shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gift message */}
          {order.giftMessage && (
            <div className="admin-card bg-[var(--color-cream)] border border-[rgba(207,169,106,0.3)]">
              <div className="flex items-start gap-3">
                <Gift size={18} className="text-[var(--color-gold-dark)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[var(--color-navy)] uppercase tracking-wider mb-1.5">Gift Message</p>
                  <p className="text-sm text-gray-700 italic leading-relaxed">&ldquo;{order.giftMessage}&rdquo;</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="admin-card">
            <h2 className="font-semibold text-[var(--color-navy)] mb-4">Order Timeline</h2>
            <div className="space-y-3">
              {[...order.timeline].reverse().map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    i === 0 ? 'bg-[var(--color-navy)]' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-navy)] capitalize">{t.status}</p>
                    <p className="text-xs text-gray-400">{t.message}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {new Date(t.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Admin controls */}
          <div className="admin-card">
            <h2 className="font-semibold text-[var(--color-navy)] mb-4">Admin Controls</h2>

            {/* Status update */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Update Status
              </label>
              <div className="flex gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-input flex-1 py-2 text-sm"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || newStatus === order.status}
                  className="px-3 py-2 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  {updatingStatus ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Save
                </button>
              </div>
            </div>

            {/* AWB entry */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                AWB / Tracking Number
              </label>
              {order.awbNumber && !awbEdit ? (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="font-mono text-sm font-semibold text-[var(--color-navy)]">{order.awbNumber}</p>
                    <a
                      href={`https://xpressbees.com/shipment/tracking?awb_number=${order.awbNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--color-gold-dark)] flex items-center gap-1 hover:underline mt-0.5"
                    >
                      Track on XpressBees <ExternalLink size={10} />
                    </a>
                  </div>
                  <button
                    onClick={() => { setAwbInput(order.awbNumber ?? ''); setAwbEdit(true); }}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={awbInput}
                    onChange={(e) => setAwbInput(e.target.value)}
                    placeholder="Enter AWB number"
                    className="admin-input flex-1 py-2 text-sm font-mono"
                  />
                  <button
                    onClick={handleSaveAwb}
                    disabled={savingAwb || !awbInput.trim()}
                    className="px-3 py-2 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    {savingAwb ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Save
                  </button>
                  {awbEdit && (
                    <button
                      onClick={() => { setAwbEdit(false); setAwbInput(''); }}
                      className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div className="admin-card">
            <h2 className="font-semibold text-[var(--color-navy)] mb-3 text-sm uppercase tracking-wider">Customer</h2>
            <p className="font-semibold text-[var(--color-navy)]">{customerName}</p>
            <p className="text-sm text-gray-500">{customerEmail}</p>
            {order.guestInfo && (
              <span className="inline-block mt-1.5 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Guest</span>
            )}
          </div>

          {/* Shipping address */}
          <div className="admin-card">
            <h2 className="font-semibold text-[var(--color-navy)] mb-3 text-sm uppercase tracking-wider">Ship To</h2>
            <p className="font-semibold text-[var(--color-navy)]">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-sm text-gray-500">{order.shippingAddress.addressLine2}</p>
            )}
            <p className="text-sm text-gray-500">
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
            </p>
            <p className="text-sm text-gray-500 mt-1">📞 {order.shippingAddress.phone}</p>
          </div>

          {/* Payment summary */}
          <div className="admin-card">
            <h2 className="font-semibold text-[var(--color-navy)] mb-3 text-sm uppercase tracking-wider">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Method</span>
                <span className="font-medium text-[var(--color-navy)] capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Payment Status</span>
                <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className={order.shippingCharge === 0 ? 'text-emerald-600' : ''}>
                  {order.shippingCharge === 0 ? 'Free' : formatCurrency(order.shippingCharge)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>- {formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[var(--color-navy)] pt-2 border-t border-gray-100 text-base">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
            {order.razorpayPaymentId && (
              <p className="text-[10px] text-gray-400 mt-3 font-mono break-all">
                Razorpay ID: {order.razorpayPaymentId}
              </p>
            )}
          </div>

          <Link
            href="/dashboard/orders"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-navy)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
