'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

const FALLBACK: FAQItem[] = [
  {
    _id: 'f1',
    question: 'Do you offer personalised gifts?',
    answer: 'Yes! Many of our products support personalisation — you can add names, messages, or custom text. Look for the "Customize & Personalize" button on the product page.',
  },
  {
    _id: 'f2',
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 4–7 business days across India. Personalised orders may take an additional 1–2 days for customisation. Express delivery options are available at checkout.',
  },
  {
    _id: 'f3',
    question: 'Can I order Hajj return gifts in bulk?',
    answer: 'Absolutely. We specialise in bulk Hajj return favours. Contact us on WhatsApp for bulk pricing, custom packaging, and guaranteed on-time delivery.',
  },
  {
    _id: 'f4',
    question: 'Do the Quran sets come gift-wrapped?',
    answer: 'Yes, every order comes beautifully packaged at no extra cost. Our Quran sets are wrapped in premium gift boxes — perfect for gifting straight out of the box.',
  },
  {
    _id: 'f5',
    question: 'What is your return/replacement policy?',
    answer: 'We offer a 10-day replacement policy for damaged or defective items. Please note that personalised/customised orders are non-refundable unless the product arrives damaged.',
  },
  {
    _id: 'f6',
    question: 'Which payment methods do you accept?',
    answer: 'We accept all major payment methods via Razorpay — UPI, credit/debit cards, net banking, and wallets. Cash on Delivery is also available on select orders.',
  },
];

export default function FAQ({ whatsappNumber = '918873355385' }: { whatsappNumber?: string }) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/faqs`)
      .then((r) => r.json())
      .then((j) => {
        const items: FAQItem[] = j.data?.faqs ?? [];
        setFaqs(items.length > 0 ? items : FALLBACK);
      })
      .catch(() => setFaqs(FALLBACK));
  }, []);

  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id));

  return (
    <section className="py-20 bg-white">
      <div className="section-container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
            <span className="text-[var(--color-gold-dark)] text-xs tracking-[3px] uppercase font-medium">
              Got Questions?
            </span>
            <div className="w-6 h-[1px] bg-[var(--color-gold)]" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-[var(--color-navy)]">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 mt-3 text-sm">
            Everything you need to know about MINARA gifts.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                open === faq._id
                  ? 'border-[var(--color-gold-light)] shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => toggle(faq._id)}
                aria-expanded={open === faq._id}
              >
                <span className="font-semibold text-[var(--color-navy)] text-sm md:text-base leading-snug">
                  {faq.question}
                </span>
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  open === faq._id
                    ? 'bg-[var(--color-gold)] text-[var(--color-navy)]'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {open === faq._id ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open === faq._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5 pt-0">
                      <div className="h-px bg-gray-100 mb-4" />
                      <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <p className="text-center text-sm text-gray-400 mt-10">
          Still have questions?{' '}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-gold-dark)] font-semibold hover:underline"
          >
            Chat with us on WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}
