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
  webpack: (config) => {
    // @petnalia/types re-exports its modules with explicit `.js` extensions
    // (required for NodeNext ESM output), but webpack resolves those specifiers
    // against the `.ts` source when bundling the workspace package directly.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
