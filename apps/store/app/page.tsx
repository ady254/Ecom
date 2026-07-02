import HeroBanner from '@/components/home/HeroBanner';
import GiftingHadith from '@/components/home/GiftingHadith';
import OccasionSection from '@/components/home/OccasionSection';
import TrustBadges from '@/components/home/TrustBadges';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import HowItWorks from '@/components/home/HowItWorks';
import BrandStory from '@/components/home/BrandStory';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import Newsletter from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <GiftingHadith />
      <OccasionSection />
      <TrustBadges />
      <FeaturedProducts />
      <HowItWorks />
      <BrandStory />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </>
  );
}
