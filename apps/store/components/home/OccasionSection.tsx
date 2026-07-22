import Link from 'next/link';
import {
  BookOpen,
  Gem,
  Gift,
  Moon,
  ScrollText,
  Home,
  PenLine,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const occasions: { name: string; slug: string; icon: LucideIcon }[] = [
  { name: 'Quran Sets',    slug: 'quran',        icon: BookOpen   },
  { name: 'Wedding Gifts', slug: 'wedding',      icon: Gem        },
  { name: 'Gift Hampers',  slug: 'hamper',       icon: Gift       },
  { name: 'Hajj Favours',  slug: 'hajj',         icon: Moon       },
  { name: 'Tasbih Cards',  slug: 'tasbih',       icon: ScrollText },
  { name: 'Home Decor',    slug: 'homedecor',    icon: Home       },
  { name: 'Personalised',  slug: 'personalised', icon: PenLine    },
  { name: 'New Arrivals',  slug: '',             icon: Sparkles   },
];

export default function OccasionSection() {
  return (
    <section className="bg-white py-8 border-b border-gray-100">
      <div className="section-container">
        <p className="text-center text-[10px] font-semibold tracking-[3px] uppercase text-[var(--color-gold-dark)] mb-6">
          Shop By Collection
        </p>

        <div className="flex items-start gap-3 sm:gap-5 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center flex-nowrap sm:flex-wrap px-2 sm:px-0">
          {occasions.map((occ) => {
            const Icon = occ.icon;
            return (
              <Link
                key={occ.name}
                href={occ.slug ? `/products?search=${occ.slug}` : '/products?sort=-createdAt'}
                className="group flex flex-col items-center gap-2.5 min-w-[68px] sm:min-w-[76px]"
              >
                <div className="
                  w-[60px] h-[60px] sm:w-[68px] sm:h-[68px]
                  rounded-full
                  bg-[var(--color-cream)]
                  border-2 border-[rgba(207,169,106,0.25)]
                  flex items-center justify-center
                  transition-all duration-200 ease-out
                  group-hover:border-[var(--color-gold)]
                  group-hover:bg-white
                  group-hover:shadow-[0_4px_18px_rgba(207,169,106,0.22)]
                  group-hover:-translate-y-1
                ">
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    className="text-[var(--color-gold-dark)] transition-colors duration-200 group-hover:text-[var(--color-gold)]"
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-500 group-hover:text-[var(--color-navy)] text-center transition-colors duration-200 leading-tight whitespace-nowrap">
                  {occ.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
