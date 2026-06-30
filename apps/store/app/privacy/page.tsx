import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — MINARA',
};

export default function PrivacyPage() {
  return (
    <div className="pb-20 pt-10">
      <div className="section-container max-w-3xl">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: June 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">1. Information We Collect</h2>
            <p>When you use MINARA, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account information:</strong> name, email address, phone number</li>
              <li><strong>Order information:</strong> shipping address, payment details (processed by Razorpay — we never store card numbers)</li>
              <li><strong>Usage data:</strong> pages visited, products viewed, search queries</li>
              <li><strong>Device data:</strong> IP address, browser type, operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Process and deliver your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your customer service requests</li>
              <li>Improve our website and product offerings</li>
              <li>Send promotional emails (you may unsubscribe at any time)</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Delivery partners</strong> (name, address, phone) to fulfill your orders</li>
              <li><strong>Razorpay</strong> for payment processing — subject to their privacy policy</li>
              <li><strong>Google</strong> if you use Google Sign-In</li>
              <li><strong>Law enforcement</strong> when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including SSL encryption, secure password hashing, and access controls. However, no transmission over the internet is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">5. Cookies</h2>
            <p>We use cookies to maintain your session, remember your cart, and analyse website traffic. You can disable cookies in your browser settings, but this may affect some features of the website.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at <a href="mailto:support@minara.in" className="text-[var(--color-gold-dark)] hover:underline">support@minara.in</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">7. Data Retention</h2>
            <p>We retain your account data for as long as your account is active or as needed to provide services. Order records are retained for 7 years for legal and accounting purposes.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">8. Changes to This Policy</h2>
            <p>We may update this policy periodically. We will notify you of significant changes via email or a prominent notice on our website. Continued use of MINARA after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--color-navy)] mb-3">9. Contact Us</h2>
            <p>For privacy-related queries, please email <a href="mailto:support@minara.in" className="text-[var(--color-gold-dark)] hover:underline">support@minara.in</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-[var(--color-gold-dark)] hover:underline">Terms of Service</Link>
          <Link href="/return-policy" className="text-[var(--color-gold-dark)] hover:underline">Return Policy</Link>
          <Link href="/products" className="text-[var(--color-gold-dark)] hover:underline">Shop Gifts</Link>
        </div>
      </div>
    </div>
  );
}
