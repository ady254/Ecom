import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'MINARA — Luxury Gifting, Reimagined',
    template: '%s | MINARA',
  },
  description:
    'Discover curated luxury gifts for every occasion. Premium gifting experiences crafted with elegance and care.',
  keywords: ['luxury gifts', 'premium gifting', 'MINARA', 'gift hampers', 'corporate gifts'],
  authors: [{ name: 'MINARA' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://minara.in',
    siteName: 'MINARA',
    title: 'MINARA — Luxury Gifting, Reimagined',
    description: 'Premium luxury gifting platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MINARA — Luxury Gifting',
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
        <Navbar />
        <main>{children}</main>
        <Footer />
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
