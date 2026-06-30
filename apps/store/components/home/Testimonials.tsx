import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The packaging was absolutely stunning. My client was blown away by the corporate hamper. MINARA has become our go-to for every gifting occasion.',
    verified: true,
    date: '2 weeks ago',
  },
  {
    name: 'Rahul Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'Ordered a birthday hamper for my wife and she was in tears — the good kind! Every product was premium quality and the box looked like it came from a luxury store.',
    verified: true,
    date: '1 month ago',
  },
  {
    name: 'Ananya Iyer',
    location: 'Bangalore',
    rating: 5,
    text: 'Fast delivery, beautiful presentation. Ordered on Wednesday, received Friday morning. The gift wrapping alone was worth it. Will definitely order again for Diwali!',
    verified: true,
    date: '3 weeks ago',
  },
  {
    name: 'Sameer Khan',
    location: 'Hyderabad',
    rating: 5,
    text: 'Sent a wedding hamper to my cousin in Pune. It arrived in perfect condition. The couple called me specifically to rave about how beautiful everything was.',
    verified: true,
    date: '1 week ago',
  },
  {
    name: 'Kavya Nair',
    location: 'Chennai',
    rating: 5,
    text: 'Perfect for corporate gifting. Ordered 15 Diwali hampers for our team. Each one was packed exactly the same, on time, with a personalised card. 10/10.',
    verified: true,
    date: '2 months ago',
  },
  {
    name: 'Arjun Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'Needed a last-minute anniversary gift. Called support, they helped me pick the right hamper and it was dispatched same day. Absolutely saved the day!',
    verified: true,
    date: '5 days ago',
  },
];

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase();
  const colors = ['bg-rose-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${color} w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
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
          {/* Aggregate rating */}
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
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all flex flex-col"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
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
                    <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full block">
                      Verified
                    </span>
                  )}
                  <span className="text-[9px] text-gray-400 block mt-0.5">{t.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
