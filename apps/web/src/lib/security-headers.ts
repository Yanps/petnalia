/**
 * HTTP security headers for every response of the web app (SECURITY-CHECKLIST, ADR-0001).
 *
 * The CSP ships as Report-Only: violations show up in the browser console without
 * blocking anything. Enforce it (rename the header) once it has run clean in production.
 */

export interface SecurityHeadersOptions {
  readonly isDev: boolean;
  /** NEXT_PUBLIC_API_URL — the only API origin the browser calls directly. */
  readonly publicApiUrl?: string | undefined;
  /** NEXT_PUBLIC_SENTRY_DSN — the browser SDK posts errors to its origin. */
  readonly sentryDsn?: string | undefined;
}

export interface Header {
  readonly key: string;
  readonly value: string;
}

/** Third-party origins the browser calls directly (CEP lookup in the address form). */
const BROWSER_FETCH_ORIGINS = ['https://viacep.com.br', 'https://servicodados.ibge.gov.br'];

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function contentSecurityPolicy({ isDev, publicApiUrl, sentryDsn }: SecurityHeadersOptions): string {
  const apiOrigin = originOf(publicApiUrl) ?? (isDev ? 'http://localhost:4000' : null);
  const sentryOrigin = originOf(sentryDsn);
  const connectSrc = [
    "'self'",
    ...BROWSER_FETCH_ORIGINS,
    ...(apiOrigin ? [apiOrigin] : []),
    ...(sentryOrigin ? [sentryOrigin] : []),
  ];
  if (isDev) connectSrc.push('ws:'); // HMR

  const directives = [
    "default-src 'self'",
    // Next.js injects inline bootstrap scripts; nonces would force every page dynamic.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    // Avatars and CRMV previews come from object storage (S3 in prod, MinIO locally).
    `img-src 'self' data: blob: https:${isDev ? ' http://localhost:9000' : ''}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(' ')}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  return directives.join('; ');
}

export function securityHeaders(options: SecurityHeadersOptions): readonly Header[] {
  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // Ignored by browsers over plain http, so it is harmless locally.
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy(options) },
  ];
}
