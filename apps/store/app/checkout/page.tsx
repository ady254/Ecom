'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ChevronLeft, Loader2, CheckCircle, CreditCard, Truck, ShieldCheck, Tag, X, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@minara/utils';
import { SERVICEABLE_STATES } from '@minara/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const FREE_SHIPPING = 999;
const SHIPPING_CHARGE = 99;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface FormData {
  fullName: string; email: string; phone: string;
  addressLine1: string; addressLine2: string;
  city: string; state: string; pincode: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName: '', email: '', phone: '',
    addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '',
  });
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'serviceable' | 'unserviceable'>('idle');

  useEffect(() => setMounted(true), []);

  // Look up the pincode once 6 digits are entered — auto-fills city/state and
  // warns early if we don't currently deliver there. Fails open (idle) if the
  // lookup API is unavailable, so checkout is never blocked by a third-party outage.
  useEffect(() => {
    if (!/^\d{6}$/.test(form.pincode)) { setPincodeStatus('idle'); return; }
    let cancelled = false;
    setPincodeStatus('checking');
    const timer = setTimeout(() => {
      fetch(`${API_URL}/shipping/check-pincode/${form.pincode}`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled || !json.success) return;
          const { serviceable, state, city } = json.data;
          if (serviceable === null) { setPincodeStatus('idle'); return; }
          setPincodeStatus(serviceable ? 'serviceable' : 'unserviceable');
          setForm((f) => ({
            ...f,
            city: f.city.trim() ? f.city : city || f.city,
            state: f.state ? f.state : state || f.state,
          }));
        })
        .catch(() => { if (!cancelled) setPincodeStatus('idle'); });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [form.pincode]);

  const sub = subtotal();
  const shipping = sub >= FREE_SHIPPING ? 0 : SHIPPING_CHARGE;
  const total = sub + shipping - couponDiscount;

  const set = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.fullName.trim()) { toast.error('Full name is required'); return false; }
    if (!form.phone.match(/^[6-9]\d{9}$/)) { toast.error('Enter a valid 10-digit mobile number'); return false; }
    if (!form.email.includes('@')) { toast.error('Enter a valid email address'); return false; }
    if (!form.addressLine1.trim()) { toast.error('Address is required'); return false; }
    if (!form.city.trim()) { toast.error('City is required'); return false; }
    if (!form.state) { toast.error('State is required'); return false; }
    if (!form.pincode.match(/^\d{6}$/)) { toast.error('Enter a valid 6-digit pincode'); return false; }
    if (!SERVICEABLE_STATES.includes(form.state as (typeof SERVICEABLE_STATES)[number])) {
      toast.error(`Sorry, we don't currently deliver to ${form.state}`);
      return false;
    }
    return true;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), orderAmount: sub }),
      });
      const json = await res.json();
      if (json.valid) {
        const discount = json.discount as number;
        setCouponDiscount(discount);
        setCouponApplied(true);
        toast.success(`Coupon applied! You save ${formatCurrency(discount)}`);
      } else {
        toast.error(json.message || 'Invalid coupon code');
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch {
      toast.error('Could not validate coupon. Try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
  };

  // The server prices every item from the database — we only say WHAT we
  // want to buy (product + quantity + variant), never how much it costs.
  const buildOrderPayload = (method: 'cod' | 'razorpay') => {
    return {
      items: items.map((i) => ({
        product: i.productId,
        quantity: i.quantity,
        ...(i.variant && Object.keys(i.variant).length > 0 ? { variant: i.variant } : {}),
      })),
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: 'India',
      },
      paymentMethod: method,
      guestInfo: { name: form.fullName, email: form.email, phone: form.phone },
      ...(giftMessage.trim() ? { giftMessage: giftMessage.trim() } : {}),
      ...(couponApplied ? { couponCode: couponCode.trim().toUpperCase() } : {}),
    };
  };

  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const placeOrder = async (payload: object) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to place order');
    return json.data as {
      order: { orderId: string };
      payment?: { keyId: string; razorpayOrderId: string; amount: number; currency: string };
    };
  };

  const orderUrl = (orderId: string) =>
    `/orders/${orderId}?success=1&email=${encodeURIComponent(form.email)}`;

  const handleCOD = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { order } = await placeOrder(buildOrderPayload('cod'));
      clearCart();
      router.push(orderUrl(order.orderId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpay = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // 1. Create the order — the server computes the amount and creates the
      //    Razorpay order, so the amount charged can never be tampered with.
      const { order, payment } = await placeOrder(buildOrderPayload('razorpay'));
      if (!payment) throw new Error('Could not initiate payment');

      const rzp = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'MINARA',
        description: 'Luxury Gifting',
        order_id: payment.razorpayOrderId,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: '#0B2342' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // 2. Confirm on the server: it verifies the signature AND the amount
          //    with Razorpay before marking the order paid.
          try {
            const res = await fetch(`${API_URL}/orders/${order.orderId}/pay/confirm`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Verification failed');
            clearCart();
            router.push(orderUrl(order.orderId));
          } catch {
            // The webhook will still mark it paid server-side
            toast.error('Payment received — confirmation is taking a moment. Check your email for the receipt.');
            clearCart();
            router.push(orderUrl(order.orderId));
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast('Payment not completed. Your order will be cancelled automatically.', { icon: 'ℹ️' });
          },
        },
      });
      rzp.open();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Payment failed');
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'cod') handleCOD();
    else handleRazorpay();
  };

  if (!mounted) return (
    <div className="pb-20 pt-6">
      <div className="section-container max-w-6xl">
        <div className="h-10 w-40 bg-gray-100 rounded-full mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-gray-100 rounded-xl animate-pulse col-span-2" />
                  <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit space-y-4">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-14 bg-gray-100 rounded-full animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center p-8">
        <p className="text-5xl">🛒</p>
        <h2 className="font-heading text-2xl text-[var(--color-navy)]">Your cart is empty</h2>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-navy)] text-white rounded-full text-sm font-semibold hover:bg-[var(--color-navy-light)] transition-colors">
          Explore Gifts
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="pb-20 pt-6">
        <div className="section-container max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="font-heading text-3xl text-[var(--color-navy)]">Checkout</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              {/* Left: Form */}
              <div className="space-y-6">
                {/* Contact info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-semibold text-[var(--color-navy)] mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-navy)] text-white text-xs flex items-center justify-center">1</span>
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" placeholder="Aarav Sharma" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                      <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" placeholder="9876543210" maxLength={10} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                      <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" placeholder="you@example.com" required />
                    </div>
                  </div>
                </div>

                {/* Gift message */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-semibold text-[var(--color-navy)] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-xs flex items-center justify-center">
                      <Gift size={11} />
                    </span>
                    Gift Message
                    <span className="text-xs font-normal text-gray-400">(optional)</span>
                  </h2>
                  <p className="text-xs text-gray-400 mb-3">Write a personal note to be included with the gift packaging.</p>
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="e.g. JazakAllah Khair for attending our Nikkah — this is a small token of our love. 🎁"
                    maxLength={300}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
                  />
                  <p className="text-right text-xs text-gray-300 mt-1">{giftMessage.length}/300</p>
                </div>

                {/* Shipping address */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-semibold text-[var(--color-navy)] mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-navy)] text-white text-xs flex items-center justify-center">2</span>
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address Line 1 *</label>
                      <input value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" placeholder="Flat no, Building, Street" required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address Line 2</label>
                      <input value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" placeholder="Locality, Landmark (optional)" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">City *</label>
                      <input value={form.city} onChange={(e) => set('city', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" placeholder="Mumbai" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Pincode *</label>
                      <input value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" placeholder="400001" maxLength={6} required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">State *</label>
                      <select value={form.state} onChange={(e) => set('state', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors bg-white" required>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {pincodeStatus === 'unserviceable' && (
                      <div className="sm:col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                        Sorry, we don&apos;t currently deliver to this pincode. We ship to Maharashtra, Karnataka, Tamil Nadu, Punjab, Jammu &amp; Kashmir, Telangana, Uttar Pradesh, and Andhra Pradesh.
                      </div>
                    )}
                  </div>
                </div>

                {/* Coupon code */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-semibold text-[var(--color-navy)] mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-navy)] text-white text-xs flex items-center justify-center">3</span>
                    Coupon Code
                  </h2>
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={15} className="text-emerald-600" />
                        <span className="font-semibold text-sm text-emerald-700">{couponCode.toUpperCase()}</span>
                        <span className="text-xs text-emerald-600">— {formatCurrency(couponDiscount)} off</span>
                      </div>
                      <button onClick={removeCoupon} className="p-1 text-emerald-500 hover:text-red-500 transition-colors">
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors uppercase tracking-wider"
                        maxLength={20}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-5 py-3 bg-[var(--color-cream)] border border-gray-200 text-[var(--color-navy)] text-sm font-semibold rounded-xl hover:bg-[var(--color-gold-light)] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {couponLoading ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment method */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-semibold text-[var(--color-navy)] mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-navy)] text-white text-xs flex items-center justify-center">4</span>
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === 'cod'
                          ? 'border-[var(--color-navy)] bg-[var(--color-cream)]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'bg-[var(--color-navy)]' : 'bg-gray-100'}`}>
                        <Truck size={18} className={paymentMethod === 'cod' ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-navy)]">Cash on Delivery</p>
                        <p className="text-xs text-gray-400">Pay when your order arrives</p>
                      </div>
                      {paymentMethod === 'cod' && <CheckCircle size={16} className="text-[var(--color-navy)] ml-auto" />}
                    </button>

                    {/* Razorpay */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === 'razorpay'
                          ? 'border-[var(--color-gold)] bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'razorpay' ? 'bg-[var(--color-gold)]' : 'bg-gray-100'}`}>
                        <CreditCard size={18} className={paymentMethod === 'razorpay' ? 'text-[var(--color-navy)]' : 'text-gray-400'} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-navy)]">Pay Online</p>
                        <p className="text-xs text-gray-400">UPI, Cards, Net Banking</p>
                      </div>
                      {paymentMethod === 'razorpay' && <CheckCircle size={16} className="text-[var(--color-gold-dark)] ml-auto" />}
                    </button>
                  </div>

                  {paymentMethod === 'razorpay' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      Secured by Razorpay — 256-bit SSL encryption
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Order summary */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                  <h2 className="font-semibold text-[var(--color-navy)] mb-5">Order Summary</h2>

                  <div className="space-y-4 mb-5 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={`${item.productId}-${JSON.stringify(item.variant ?? {})}`} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg bg-[var(--color-cream)] overflow-hidden relative shrink-0">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                          )}
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--color-navy)] text-white text-[9px] font-bold flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--color-navy)] line-clamp-2">{item.name}</p>
                          <p className="text-xs font-semibold text-[var(--color-navy)] mt-1">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span><span>{formatCurrency(sub)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                    </div>
                    {couponApplied && couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span className="flex items-center gap-1"><Tag size={12} /> Coupon ({couponCode})</span>
                        <span>- {formatCurrency(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-[var(--color-navy)] text-base pt-2 border-t border-gray-100">
                      <span>Total</span><span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full py-4 bg-[var(--color-navy)] text-white font-semibold tracking-wider rounded-full hover:bg-[var(--color-navy-light)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    ) : (
                      paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ${formatCurrency(total)}`
                    )}
                  </button>

                  {/* Trust row — the last thing they see before committing */}
                  <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 mt-4">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={11} className="text-emerald-500" /> 10-day replacement
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck size={11} className="text-emerald-500" /> Ships in 24 hrs
                    </span>
                    <span className="flex items-center gap-1">
                      <Gift size={11} className="text-emerald-500" /> Gift-wrapped
                    </span>
                  </div>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    By placing this order you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-[var(--color-navy)]">Terms of Service</Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
