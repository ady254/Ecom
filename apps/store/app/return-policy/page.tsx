import Link from 'next/link';
import { getStoreSettings } from '@/lib/settings';

export const metadata = {
  title: 'Return Policy — MINARA',
};

export default async function ReturnPolicyPage() {
  const { storeEmail } = await getStoreSettings();
  return (
    <div className="pb-20 pt-10">
      <div className="section-container max-w-3xl">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Support</p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-2">Return Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: June 2025</p>

        {/* TL;DR summary */}
        <div className="bg-[var(--color-cream)] border border-[var(--color-gold-light)] rounded-2xl p-6 mb-10">
          <h2 className="font-heading text-xl text-[var(--color-navy)] mb-3">Quick Summary</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><span className="text-[var(--color-gold-dark)] font-bold">✓</span> 7-day return window from delivery date</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-gold-dark)] font-bold">✓</span> Full refund for damaged or incorrect items</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-gold-dark)] font-bold">✓</span> Free return pickup for eligible orders</li>
            <li className="flex items-start gap-2"><span className="text-red-400 font-bold">✗</span> Personalised/customised items are non-returnable</li>
            <li className="flex items-start gap-2"><span className="text-red-400 font-bold">✗</span> Items used or with missing packaging are not eligible</li>
          </ul>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Eligibility for Returns</h2>
            <p>To be eligible for a return, the following conditions must be met:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Return request is raised within <strong>7 days</strong> of delivery</li>
              <li>Item is unused, unwashed, and in original condition</li>
              <li>Original packaging and tags are intact</li>
              <li>Proof of purchase (order number) is provided</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Non-Returnable Items</h2>
            <p>The following cannot be returned or exchanged:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Personalised or customised products (with name, message, or photo)</li>
              <li>Perishable or consumable gift items (chocolates, candles that have been used, etc.)</li>
              <li>Items marked as &quot;Final Sale&quot; or &quot;Non-Returnable&quot; on the product page</li>
              <li>Gift cards and vouchers</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Email us at <a href={`mailto:${storeEmail}`} className="text-[var(--color-gold-dark)] hover:underline">{storeEmail}</a> with your order number and reason for return</li>
              <li>Attach photographs of the item and packaging (required for damaged/incorrect items)</li>
              <li>Our team will respond within 24 hours with return instructions</li>
              <li>Pack the item securely and hand it to our pickup partner</li>
            </ol>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Refunds</h2>
            <p>Once we receive and inspect the returned item, your refund will be processed within <strong>5–7 business days</strong> to the original payment method:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Online payments:</strong> Refund to original card/bank account</li>
              <li><strong>Cash on Delivery:</strong> Refund via bank transfer (NEFT/IMPS) — please provide your bank details</li>
            </ul>
            <p className="mt-2">Shipping charges are non-refundable unless the return is due to our error (wrong or damaged item).</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Damaged or Wrong Items</h2>
            <p>If you receive a damaged, defective, or incorrect item, please contact us within <strong>48 hours</strong> of delivery with photos. We will arrange a free replacement or full refund at your preference.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Exchange Policy</h2>
            <p>We currently do not offer direct exchanges. If you&apos;d like a different product, please initiate a return and place a new order.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">Contact Us</h2>
            <p>Have questions about a return? Reach us at <a href={`mailto:${storeEmail}`} className="text-[var(--color-gold-dark)] hover:underline">{storeEmail}</a> or WhatsApp us for faster support.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-[var(--color-gold-dark)] hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="text-[var(--color-gold-dark)] hover:underline">Privacy Policy</Link>
          <Link href="/products" className="text-[var(--color-gold-dark)] hover:underline">Shop Gifts</Link>
        </div>
      </div>
    </div>
  );
}
