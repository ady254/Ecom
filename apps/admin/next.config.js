const path = require('path');

const nextConfig = {
  // Produces a self-contained .next/standalone/ with its own server.js —
  // this is what Hostinger's Passenger runtime runs (respects PORT/HOSTNAME).
  output: 'standalone',
  // Trace deps from the monorepo root so workspace packages are included.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  transpilePackages: ['@minara/config', '@minara/types', '@minara/utils'],
};

module.exports = nextConfig;
