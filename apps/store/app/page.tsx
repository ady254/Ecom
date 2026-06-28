import HeroBanner from '@/components/home/HeroBanner';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrustBadges from '@/components/home/TrustBadges';
import Testimonials from '@/components/home/Testimonials';
import Newsletter from '@/components/home/Newsletter';
import BrandStory from '@/components/home/BrandStory';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <TrustBadges />
      <FeaturedCategories />
      <FeaturedProducts />
      <BrandStory />
      <Testimonials />
      <Newsletter />
    </>
  );
}
