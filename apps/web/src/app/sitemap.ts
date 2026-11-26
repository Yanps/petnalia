import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site-url';

// Read APP_URL at request time, not at build time.
export const dynamic = 'force-dynamic';

const PUBLIC_PAGES: readonly { readonly path: string; readonly priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/busca', priority: 0.9 },
  { path: '/para-veterinarios', priority: 0.7 },
  { path: '/planos', priority: 0.6 },
  { path: '/cadastro', priority: 0.5 },
  { path: '/entrar', priority: 0.3 },
  { path: '/termos', priority: 0.2 },
  { path: '/privacidade', priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PUBLIC_PAGES.map(({ path, priority }) => ({
    url: `${base}${path === '/' ? '' : path}`,
    changeFrequency: 'weekly',
    priority,
  }));
}
