import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const stats = [
  { num: '500+',  label: 'Curated Gifts' },
  { num: '4,200+', label: 'Orders Delivered' },
  { num: '4.9 ★', label: 'Average Rating' },
  { num: '48 hrs', label: 'Avg. Delivery Time' },
];

export default function BrandStory() {
  return (
    <section className="py-16 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Stats side */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[var(--color-cream)] rounded-2xl p-6 border border-[rgba(207,169,106,0.2)] hover:border-[rgba(207,169,106,0.5)] transition-colors"
              >
                <div className="font-heading text-3xl md:text-4xl text-[var(--color-navy)] mb-1">{s.num}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Copy side */}
          <div>
            <p className="text-[var(--color-gold-dark)] text-xs font-semibold tracking-[3px] uppercase mb-4">
              Our Story
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-navy)] mb-5 leading-tight">
              Every Gift Is a<br />
              <span className="italic">Personal Touch</span>
            </h2>
            <div className="w-10 h-0.5 bg-[var(--color-gold)] mb-6" />
            <p className="text-gray-500 leading-relaxed mb-4 text-[15px]">
              At MINARA, we believe a great gift is more than a product — it&rsquo;s a memory. We handpick every item in our collection for quality, beauty, and meaning.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8 text-[15px]">
              From Nikkah celebrations to Hajj return favours, Quran sets to Tasbih cards for little ones — each gift is packed with care, shipped fast, and arrives ready to delight.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[var(--color-navy)] text-white text-sm font-semibold rounded-full hover:bg-[var(--color-navy-light)] transition-colors group"
            >
              Shop Now
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
