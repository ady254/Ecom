import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://minara.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/checkout', '/account', '/orders/', '/verify-email', '/reset-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
