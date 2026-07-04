'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Package, Truck, Home, Loader2, XCircle, ChevronRight, Gift, ExternalLink, AlertTriangle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@minara/utils';
import api from '@/lib/api';

interface OrderItem {
  product?: { slug: string };
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variant?: Record<string, string>;
}

interface Order {
  _id: string;
  orderId: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  giftMessage?: string;
  awbNumber?: string;
  couponCode?: string;
  createdAt: string;
}

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const CANCELABLE_STATUSES = ['pending', 'confirmed'];

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const isSuccess = searchParams.get('success') === '1';
  const emailParam = searchParams.get('email') || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // Guest orders are only shown to someone who knows the email used at checkout
  const [needEmail, setNeedEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState(emailParam);

  const fetchOrder = (email: string) => {
    setLoading(true);
    setError('');
    api.get(`/orders/${orderId}`, { params: email ? { email } : {} })
      .then((res) => {
        if (res.data?.success) {
          setOrder(res.data.data.order);
          setNeedEmail(false);
          setVerifiedEmail(email);
        } else {
          setError(res.data?.message || 'Could not load order');
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message;
        if (msg === 'EMAIL_REQUIRED') {
          setNeedEmail(true);
        } else if (email && err?.response?.status === 403) {
          setNeedEmail(true);
          toast.error('That email does not match this order');
        } else {
          setError(msg || 'Could not load order');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder(emailParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/orders/${orderId}/cancel`, verifiedEmail ? { email: verifiedEmail } : {});
      setOrder((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
      toast.success('Order cancelled successfully');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Could not cancel order');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-navy)]" />
      </div>
    );
  }

  if (needEmail && !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center p-8">
        <Package size={48} className="text-[var(--color-gold-dark)]" />
        <h2 className="font-heading text-2xl text-[var(--color-navy)]">Verify Your Order</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          For your privacy, enter the email address you used when placing order{' '}
          <span className="font-semibold">{orderId}</span>.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (emailInput.trim()) fetchOrder(emailInput.trim()); }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
        >
          <input
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 px-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-gold)]"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--color-navy)] text-white rounded-full text-sm font-semibold hover:bg-[var(--color-navy-light)] transition-colors"
          >
            View Order
          </button>
        </form>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center p-8">
        <XCircle size={48} className="text-red-400" />
        <h2 className="font-heading text-2xl text-[var(--color-navy)]">Order Not Found</h2>
        <p className="text-gray-400">{error}</p>
        <Link href="/orders" className="text-sm text-[var(--color-gold-dark)] hover:underline">
          View My Orders
        </Link>
      </div>
    );
  }

  const completedStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="pb-20 pt-8">
      <div className="section-container max-w-3xl">
        {/* Success banner */}
        {isSuccess && (
          <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <CheckCircle2 size={28} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-heading text-xl text-emerald-800 mb-1">Order Placed Successfully!</h2>
              <p className="text-sm text-emerald-700">
                Thank you for your order. We&apos;ve received it and will start processing it right away.
                {order.paymentMethod === 'cod' && " You'll pay when your gift arrives."}
              </p>
            </div>
          </div>
        )}

        {/* Cancel confirmation dialog */}
        {showCancelConfirm && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 mb-1">Cancel this order?</p>
              <p className="text-xs text-red-600 mb-4">This cannot be undone. If you paid online, a refund will be initiated.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-full hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {cancelling ? <Loader2 size={12} className="animate-spin" /> : null}
                  Yes, cancel order
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-full hover:bg-red-100 transition-colors"
                >
                  Keep order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order</p>
            <h1 className="font-heading text-2xl text-[var(--color-navy)]">#{order.orderId}</h1>
            <p className="text-xs text-gray-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              order.status === 'delivered'
                ? 'bg-emerald-100 text-emerald-700'
                : order.status === 'cancelled'
                ? 'bg-red-100 text-red-700'
                : 'bg-[var(--color-cream)] text-[var(--color-navy)]'
            }`}>
              {order.status}
            </span>
            <span className={`text-xs font-medium ${
              order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              Payment: {order.paymentStatus}
            </span>
            {CANCELABLE_STATUSES.includes(order.status) && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-xs text-red-400 hover:text-red-600 hover:underline transition-colors mt-1"
              >
                Cancel order
              </button>
            )}
          </div>
        </div>

        {/* Status tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-[var(--color-navy)] mb-6">Order Tracking</h2>
            <div className="flex items-start gap-0">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= completedStepIndex;
                const isCurrent = i === completedStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex-1 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 relative transition-all ${
                        isCompleted
                          ? 'bg-[var(--color-navy)] text-white'
                          : 'bg-gray-100 text-gray-300'
                      } ${isCurrent ? 'ring-4 ring-[var(--color-navy)]/20' : ''}`}>
                        <Icon size={16} />
                      </div>
                      <p className={`text-[10px] mt-2 text-center font-medium ${isCompleted ? 'text-[var(--color-navy)]' : 'text-gray-300'}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`absolute top-5 left-1/2 w-full h-0.5 transition-all ${
                        i < completedStepIndex ? 'bg-[var(--color-navy)]' : 'bg-gray-100'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* AWB tracking */}
            {order.awbNumber && (
              <div className="mt-6 flex items-center justify-between bg-[var(--color-cream)] border border-[var(--color-gold-light)] rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Tracking Number (AWB)</p>
                  <p className="font-semibold text-sm text-[var(--color-navy)]">{order.awbNumber}</p>
                </div>
                <a
                  href={`https://xpressbees.com/shipment/tracking?awb_number=${order.awbNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors"
                >
                  Track Parcel <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-[var(--color-navy)] mb-3 text-sm uppercase tracking-wider">Shipping To</h2>
            <p className="font-semibold text-[var(--color-navy)]">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-sm text-gray-500">{order.shippingAddress.addressLine2}</p>
            )}
            <p className="text-sm text-gray-500">
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
            </p>
            <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.phone}</p>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-[var(--color-navy)] mb-3 text-sm uppercase tracking-wider">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Method</span>
                <span className="font-medium text-[var(--color-navy)] capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
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
              <div className="flex justify-between font-bold text-[var(--color-navy)] pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gift message */}
        {order.giftMessage && (
          <div className="bg-[var(--color-cream)] border border-[var(--color-gold-light)] rounded-2xl p-5 mb-6 flex items-start gap-3">
            <Gift size={18} className="text-[var(--color-gold-dark)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[var(--color-navy)] uppercase tracking-wider mb-1.5">Gift Message</p>
              <p className="text-sm text-gray-600 italic leading-relaxed">&ldquo;{order.giftMessage}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-8">
          <h2 className="font-semibold text-[var(--color-navy)] mb-5 text-sm uppercase tracking-wider">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl bg-[var(--color-cream)] overflow-hidden relative shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {item.product?.slug ? (
                    <Link href={`/products/${item.product.slug}`} className="font-medium text-[var(--color-navy)] hover:text-[var(--color-gold-dark)] text-sm line-clamp-2">
                      {item.name}
                    </Link>
                  ) : (
                    <p className="font-medium text-[var(--color-navy)] text-sm">{item.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                  {item.variant && Object.keys(item.variant).length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles size={10} className="text-amber-600" />
                        <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">Personalized</span>
                      </div>
                      {Object.entries(item.variant).map(([label, value]) => (
                        <div key={label} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-amber-600 font-medium shrink-0">{label}:</span>
                          <span className="text-amber-900 font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="font-semibold text-[var(--color-navy)] text-sm shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-navy)] text-[var(--color-navy)] font-semibold rounded-full hover:bg-[var(--color-cream)] transition-colors text-sm"
          >
            My Orders
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-navy)] text-white font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors text-sm"
          >
            Continue Shopping <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
