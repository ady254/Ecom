import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone/ with its own server.js —
  // this is what Hostinger's Passenger runtime runs (respects PORT/HOSTNAME).
  output: 'standalone',
  // Trace deps from the monorepo root so workspace packages are included.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Disable Turbopack (too memory-intensive for shared hosting) — use Webpack instead.
  experimental: {
    turbopack: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  transpilePackages: ['@minara/config', '@minara/types', '@minara/utils'],
};

export default nextConfig;
