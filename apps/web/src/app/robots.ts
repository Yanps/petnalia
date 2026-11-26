import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site-url';

// Read APP_URL at request time, not at build time.
export const dynamic = 'force-dynamic';

/** Logged-in areas and one-off auth flows — nothing useful for search engines. */
const PRIVATE_PATHS = [
  '/api/',
  '/admin',
  '/painel',
  '/perfil',
  '/consultas',
  '/pets',
  '/reservas',
  '/vet/painel',
  '/vet/perfil',
  '/vet/area-atendimento',
  '/vet/assinatura',
  '/vet/consultas',
  '/vet/disponibilidade',
  '/pet-sitter/painel',
  '/pet-sitter/perfil',
  '/pet-sitter/disponibilidade',
  '/pet-sitter/reservas',
  '/recuperar-senha',
  '/redefinir-senha',
];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
    sitemap: `${base}/sitemap.xml`,
  };
}
