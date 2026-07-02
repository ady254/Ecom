import Link from 'next/link';

export const metadata = {
  title: 'Shipping Policy — MINARA',
};

const SERVICEABLE_STATES = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Punjab',
  'Jammu & Kashmir', 'Telangana', 'Uttar Pradesh', 'Andhra Pradesh',
];

export default function ShippingPolicyPage() {
  return (
    <div className="pb-20 pt-10">
      <div className="section-container max-w-3xl">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Support</p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-2">Shipping Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: July 2026</p>

        {/* TL;DR summary */}
        <div className="bg-[var(--color-cream)] border border-[var(--color-gold-light)] rounded-2xl p-6 mb-10">
          <h2 className="font-heading text-xl text-[var(--color-navy)] mb-3">Quick Summary</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><span className="text-[var(--color-gold-dark)] font-bold">✓</span> Orders are packed and dispatched within 24 hours</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-gold-dark)] font-bold">✓</span> Delivered in 2–5 business days after dispatch</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-gold-dark)] font-bold">✓</span> Free shipping on orders above ₹999, otherwise ₹99</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-gold-dark)] font-bold">✓</span> Every order is trackable once shipped</li>
          </ul>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Where We Deliver</h2>
            <p>We currently ship to the following states:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {SERVICEABLE_STATES.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <p className="mt-2">We&apos;re steadily expanding coverage. At checkout, enter your pincode and we&apos;ll let you know right away if we deliver to your address. If your state isn&apos;t listed yet, please check back soon or reach out to us to ask about availability.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Processing & Delivery Time</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Orders are packed and handed to our courier partner within <strong>24 hours</strong> of confirmation</li>
              <li>Delivery typically takes <strong>2–5 business days</strong> from dispatch, depending on your location</li>
              <li>Orders placed on Sundays or public holidays are processed the next business day</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Shipping Charges</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Free shipping</strong> on all orders above ₹999</li>
              <li>A flat ₹99 shipping charge applies to orders below ₹999</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Our Courier Partner</h2>
            <p>All orders are shipped via <strong>XpressBees</strong>. Once your order is dispatched, you&apos;ll receive an email with your AWB (tracking) number, which you can also view anytime under <Link href="/orders" className="text-[var(--color-gold-dark)] hover:underline">My Orders</Link>.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Order Tracking</h2>
            <p>Track your order status — Confirmed, Processing, Shipped, or Delivered — anytime from <Link href="/orders" className="text-[var(--color-gold-dark)] hover:underline">My Orders</Link>. Once shipped, you can also track the shipment directly on the XpressBees website using your AWB number.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Delays & Issues</h2>
            <p>Occasionally, deliveries may be delayed due to weather, regional restrictions, or courier network disruptions. If your order is taking longer than expected, contact us at <a href="mailto:support@minara.in" className="text-[var(--color-gold-dark)] hover:underline">support@minara.in</a> with your order number and we&apos;ll look into it right away.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/return-policy" className="text-[var(--color-gold-dark)] hover:underline">Return Policy</Link>
          <Link href="/terms" className="text-[var(--color-gold-dark)] hover:underline">Terms of Service</Link>
          <Link href="/contact" className="text-[var(--color-gold-dark)] hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
