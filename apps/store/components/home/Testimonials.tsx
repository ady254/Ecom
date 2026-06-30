'use client';

import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Fatima Shaikh',
    location: 'Mumbai',
    rating: 5,
    text: 'Ordered the Hajj return gift set for my parents and it was absolutely beautiful — Zamzam packaging, premium Quran, tasbihs. Everyone who received one was so touched.',
    verified: true,
    date: '2 weeks ago',
  },
  {
    name: 'Zainab Khan',
    location: 'Delhi',
    rating: 5,
    text: "Got the Nikkah hamper for my cousin's wedding and she was in tears — the good kind! Every product was premium quality and the box looked like it came from a luxury store.",
    verified: true,
    date: '1 month ago',
  },
  {
    name: 'Ayesha Siddiqui',
    location: 'Hyderabad',
    rating: 5,
    text: 'Fast delivery, beautiful presentation. Ordered on Wednesday, received Friday morning. The Quran set with personalised engraving was beyond my expectations. Will order again!',
    verified: true,
    date: '3 weeks ago',
  },
  {
    name: 'Sameer Ansari',
    location: 'Pune',
    rating: 5,
    text: 'Sent a wedding hamper to my cousin in Mumbai. It arrived in perfect condition — the couple called me specifically to rave about how beautiful everything was. Truly blessed.',
    verified: true,
    date: '1 week ago',
  },
  {
    name: 'Nadia Hussain',
    location: 'Lucknow',
    rating: 5,
    text: 'Ordered Tasbih cards for kids for an Eid event — 20 sets, each one packed exactly the same, on time, with personalised names. The children absolutely loved them. 10/10.',
    verified: true,
    date: '2 months ago',
  },
  {
    name: 'Imran Sheikh',
    location: 'Ahmedabad',
    rating: 5,
    text: 'Needed Hajj return favours quickly. The support team helped me pick the right set and it was dispatched same day. Absolutely saved me and the quality was outstanding.',
    verified: true,
    date: '5 days ago',
  },
];

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-[var(--color-gold)] text-xs font-bold shrink-0 border border-[rgba(207,169,106,0.3)]">
      {initials}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 bg-[var(--color-cream)]">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[var(--color-gold-dark)] text-xs font-semibold tracking-[3px] uppercase mb-2">
            Customer Reviews
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-navy)] mb-3">
            What Our Customers Say
          </h2>
          <div className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-5 py-2 shadow-sm">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-[var(--color-navy)]">4.9</span>
            <span className="text-xs text-gray-400">based on 4,200+ orders</span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.1, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[rgba(207,169,106,0.35)] hover:shadow-[0_4px_20px_rgba(207,169,106,0.1)] transition-all duration-200 flex flex-col relative overflow-hidden"
            >
              {/* Decorative quote icon */}
              <Quote
                size={40}
                strokeWidth={1}
                className="absolute top-3 right-4 text-[var(--color-gold)] opacity-10 rotate-180"
              />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={12} className={s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4 relative z-10">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author row */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Avatar name={t.name} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-navy)]">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {t.verified && (
                    <span className="text-[9px] font-semibold text-[var(--color-navy)] bg-[rgba(207,169,106,0.15)] px-2 py-0.5 rounded-full block border border-[rgba(207,169,106,0.3)]">
                      Verified
                    </span>
                  )}
                  <span className="text-[9px] text-gray-400 block mt-0.5">{t.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
