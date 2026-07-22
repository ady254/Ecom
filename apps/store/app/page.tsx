import HeroBanner, { Slide } from '@/components/home/HeroBanner';
import GiftingHadith from '@/components/home/GiftingHadith';
import OccasionSection from '@/components/home/OccasionSection';
import TrustBadges from '@/components/home/TrustBadges';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import HowItWorks from '@/components/home/HowItWorks';
import BrandStory from '@/components/home/BrandStory';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import { getStoreSettings } from '@/lib/settings';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getBanners(): Promise<Slide[]> {
  try {
    const res = await fetch(`${API}/banners`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.banners ?? []).filter(
      (b: Slide) => b.position === 'hero' || !b.position
    );
  } catch (e) {
    return [];
  }
}

export default async function HomePage() {
  const settings = await getStoreSettings();
  const initialBanners = await getBanners();
  
  return (
    <>
      <HeroBanner initialBanners={initialBanners} />
      <OccasionSection />
      <TrustBadges />
      <FeaturedProducts />
      <Testimonials />
      <GiftingHadith />
      <HowItWorks />
      <BrandStory />
      <FAQ whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
