import { Package, RefreshCw, Shield, Truck } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'On orders above ₹999 — Pan India',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-100',
  },
  {
    icon: Shield,
    title: '100% Secure Payments',
    desc: 'Razorpay 256-bit SSL encryption',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    icon: Package,
    title: 'Premium Gift Wrapping',
    desc: 'Every order packed beautifully',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    icon: RefreshCw,
    title: 'Easy 7-Day Returns',
    desc: 'Hassle-free return & refund policy',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div
              key={b.title}
              className={`${b.bg} rounded-xl p-4 flex items-start gap-3 border border-transparent hover:border-gray-200 transition-colors`}
            >
              <div className={`${b.iconBg} ${b.iconColor} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}>
                <b.icon size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-navy)] leading-snug">{b.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
