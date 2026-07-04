import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { getStoreSettings } from '@/lib/settings';

export const metadata = {
  title: 'Contact Us — MINARA',
};

const WHATSAPP_MSG = encodeURIComponent('Assalamu Alaikum! I have a query about MINARA gifts.');

export default async function ContactPage() {
  const settings = await getStoreSettings();
  return (
    <div className="pb-20 pt-10">
      <div className="section-container max-w-3xl">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Support</p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)] mb-2">Contact Us</h1>
        <p className="text-sm text-gray-400 mb-10">We usually respond within 24 hours.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          <a
            href={`https://wa.me/${settings.whatsappNumber}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3.5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-[var(--color-gold-light)] transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-[var(--color-navy)]" />
            </span>
            <div>
              <p className="font-semibold text-[var(--color-navy)] text-sm mb-0.5">WhatsApp</p>
              <p className="text-sm text-gray-500">Fastest way to reach us</p>
            </div>
          </a>

          <a
            href={`mailto:${settings.storeEmail}`}
            className="flex items-start gap-3.5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-[var(--color-gold-light)] transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center shrink-0">
              <Mail size={18} className="text-[var(--color-navy)]" />
            </span>
            <div>
              <p className="font-semibold text-[var(--color-navy)] text-sm mb-0.5">Email</p>
              <p className="text-sm text-gray-500">{settings.storeEmail}</p>
            </div>
          </a>

          <a
            href={`tel:${settings.storePhoneTel}`}
            className="flex items-start gap-3.5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-[var(--color-gold-light)] transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center shrink-0">
              <Phone size={18} className="text-[var(--color-navy)]" />
            </span>
            <div>
              <p className="font-semibold text-[var(--color-navy)] text-sm mb-0.5">Phone</p>
              <p className="text-sm text-gray-500">{settings.storePhone}</p>
            </div>
          </a>

          <div className="flex items-start gap-3.5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <span className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center shrink-0">
              <Clock size={18} className="text-[var(--color-navy)]" />
            </span>
            <div>
              <p className="font-semibold text-[var(--color-navy)] text-sm mb-0.5">Support Hours</p>
              <p className="text-sm text-gray-500">Mon–Sat, 10 AM – 7 PM IST</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-[var(--color-navy)]" />
            </span>
            <div>
              <p className="font-semibold text-[var(--color-navy)] text-sm mb-1">Registered Address</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {settings.storeName}<br />
                {settings.storeAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
