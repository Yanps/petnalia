import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@petnalia/ui',
    '@petnalia/types',
    '@petnalia/utils',
    '@petnalia/validation',
    '@petnalia/config',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
};

export default nextConfig;
