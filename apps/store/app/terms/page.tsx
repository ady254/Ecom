import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — MINARA',
};

export default function TermsPage() {
  return (
    <div className="pb-20 pt-10">
      <div className="section-container max-w-3xl">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: June 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the MINARA website and services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">2. Products and Orders</h2>
            <p>All products listed on MINARA are subject to availability. We reserve the right to limit quantities or discontinue products at any time. Prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</p>
            <p className="mt-2">By placing an order, you confirm that the information provided is accurate and complete. We reserve the right to cancel orders in cases of pricing errors, suspected fraud, or stock unavailability.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">3. Payment</h2>
            <p>We accept payments via UPI, debit/credit cards, net banking (processed by Razorpay), and Cash on Delivery (COD) for eligible pin codes. All online transactions are secured with 256-bit SSL encryption.</p>
            <p className="mt-2">COD orders may be subject to an additional handling charge. We reserve the right to cancel COD orders with a history of non-acceptance.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">4. Shipping and Delivery</h2>
            <p>Orders are typically dispatched within 1–2 business days. Estimated delivery is 2–5 business days depending on your location. Delivery timelines may vary during festive seasons or due to factors beyond our control.</p>
            <p className="mt-2">Free shipping is available on orders above ₹999. A shipping charge of ₹99 applies to orders below this threshold.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">5. Returns and Refunds</h2>
            <p>We offer a 7-day return window for eligible products. Products must be unused, in original packaging, and accompanied by proof of purchase. Please refer to our <Link href="/return-policy" className="text-[var(--color-gold-dark)] hover:underline">Return Policy</Link> for full details.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">6. Intellectual Property</h2>
            <p>All content on this website — including images, text, logos, and graphics — is the property of MINARA and protected by applicable copyright and trademark laws. You may not reproduce, distribute, or use any content without prior written permission.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">7. Limitation of Liability</h2>
            <p>MINARA shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the relevant order.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">8. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts located in Maharashtra, India.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">9. Contact</h2>
            <p>For any questions regarding these terms, please contact us at <a href="mailto:support@minara.in" className="text-[var(--color-gold-dark)] hover:underline">support@minara.in</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="text-[var(--color-gold-dark)] hover:underline">Privacy Policy</Link>
          <Link href="/return-policy" className="text-[var(--color-gold-dark)] hover:underline">Return Policy</Link>
          <Link href="/products" className="text-[var(--color-gold-dark)] hover:underline">Shop Gifts</Link>
        </div>
      </div>
    </div>
  );
}
