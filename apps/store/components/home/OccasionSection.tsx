import Link from 'next/link';

const occasions = [
  { name: 'Wedding',     slug: 'wedding',     emoji: '💍' },
  { name: 'Birthday',    slug: 'birthday',    emoji: '🎂' },
  { name: 'Anniversary', slug: 'anniversary', emoji: '❤️' },
  { name: 'Corporate',   slug: 'corporate',   emoji: '💼' },
  { name: 'Baby Shower', slug: 'baby-shower', emoji: '🍼' },
  { name: 'Festive',     slug: 'festive',     emoji: '✨' },
  { name: 'New Home',    slug: 'new-home',    emoji: '🏠' },
  { name: 'Thank You',   slug: 'thank-you',   emoji: '🙏' },
];

export default function OccasionSection() {
  return (
    <section className="bg-white py-8 border-b border-gray-100">
      <div className="section-container">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide justify-center flex-wrap">
          {occasions.map((occ) => (
            <Link
              key={occ.slug}
              href={`/products?tags=${occ.slug}`}
              className="group flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[80px]"
            >
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-[var(--color-cream)] border-2 border-[rgba(207,169,106,0.3)] group-hover:border-[var(--color-gold)] group-hover:bg-[rgba(207,169,106,0.08)] transition-all duration-200 flex items-center justify-center text-2xl sm:text-3xl">
                {occ.emoji}
              </div>
              <span className="text-[11px] font-medium text-gray-600 group-hover:text-[var(--color-navy)] text-center transition-colors whitespace-nowrap">
                {occ.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
