import Link from 'next/link';
import { getStoreSettings } from '@/lib/settings';

export const metadata = {
  title: 'About Us — MINARA',
};

export default async function AboutPage() {
  const { storeEmail } = await getStoreSettings();
  return (
    <div className="pb-20 pt-10">
      <div className="section-container max-w-3xl">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Our Story</p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-2">About MINARA</h1>
        <p className="text-sm text-gray-400 mb-10">Luxury Gifting, Reimagined</p>

        <div className="prose prose-sm max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <p>MINARA is a Hyderabad-based gifting studio built around a simple idea: gifts rooted in faith, made with love. From Quran sets and Nikkah hampers to Hajj return favours and Islamic home decor, every piece we curate is chosen to mark life&apos;s meaningful moments with care and elegance.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">What We Do</h2>
            <p>We handpick and package thoughtful gifts for weddings, Hajj and Umrah returns, festive occasions, and everyday celebrations — designed to feel personal, not mass-produced. Every order is packed with care and dispatched within 24 hours.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Bulk & Corporate Gifting</h2>
            <p>Planning a Nikkah, Hajj return set, or corporate gifting order in bulk? We handle custom quantities and personalisation for larger orders — reach out to us on WhatsApp to discuss your requirements.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Where We Are</h2>
            <p>We&apos;re based in Hyderabad, Telangana, and currently deliver across Maharashtra, Karnataka, Tamil Nadu, Punjab, Jammu &amp; Kashmir, Telangana, Uttar Pradesh, and Andhra Pradesh — with more states on the way. See our <Link href="/shipping-policy" className="text-[var(--color-gold-dark)] hover:underline">Shipping Policy</Link> for full details.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Get In Touch</h2>
            <p>Questions, custom orders, or feedback — we&apos;d love to hear from you. Visit our <Link href="/contact" className="text-[var(--color-gold-dark)] hover:underline">Contact page</Link> or reach us at <a href={`mailto:${storeEmail}`} className="text-[var(--color-gold-dark)] hover:underline">{storeEmail}</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/contact" className="text-[var(--color-gold-dark)] hover:underline">Contact Us</Link>
          <Link href="/shipping-policy" className="text-[var(--color-gold-dark)] hover:underline">Shipping Policy</Link>
          <Link href="/products" className="text-[var(--color-gold-dark)] hover:underline">Shop Gifts</Link>
        </div>
      </div>
    </div>
  );
}
