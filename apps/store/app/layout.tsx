import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import SplashScreen from '@/components/layout/SplashScreen';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import OfferPopup from '@/components/layout/OfferPopup';

export const metadata: Metadata = {
  metadataBase: new URL('https://minaragifting.com'),
  title: {
    default: 'MINARA — Luxury Gifting, Reimagined',
    template: '%s | MINARA',
  },
  description:
    'Discover curated luxury gifts for every occasion. Premium gifting experiences crafted with elegance and care.',
  keywords: ['luxury gifts', 'premium gifting', 'MINARA', 'gift hampers', 'corporate gifts'],
  authors: [{ name: 'MINARA' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo.jpeg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://minaragifting.com',
    siteName: 'MINARA',
    title: 'MINARA — Luxury Gifting, Reimagined',
    description:
      'Discover curated luxury gifts for every occasion. Premium gifting experiences crafted with elegance and care.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'MINARA — Luxury Gifting, Reimagined',
      },
      {
        url: '/logo.jpeg',
        width: 1024,
        height: 1024,
        alt: 'MINARA Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MINARA — Luxury Gifting, Reimagined',
    description:
      'Discover curated luxury gifts for every occasion. Premium gifting experiences crafted with elegance and care.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SplashScreen />
        <AnnouncementBar />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppButton />
        <OfferPopup />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0B2342',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(207, 169, 106, 0.3)',
            },
            success: {
              iconTheme: { primary: '#CFA96A', secondary: '#0B2342' },
            },
          }}
        />
      </body>
    </html>
  );
}

