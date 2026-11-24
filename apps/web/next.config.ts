import type { NextConfig } from 'next';

import { securityHeaders } from './src/lib/security-headers';

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compiler: {
    // Keep error/warn: they are how boundaries and libraries surface real problems.
    removeConsole: isDev ? false : { exclude: ['error', 'warn'] },
  },
  headers: () =>
    Promise.resolve([
      {
        source: '/:path*',
        headers: [
          ...securityHeaders({
            isDev,
            publicApiUrl: process.env.NEXT_PUBLIC_API_URL,
            sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          }),
        ],
      },
    ]),
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
  webpack: (config: { resolve: { extensionAlias?: Record<string, string[]> } }) => {
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
