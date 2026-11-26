import { describe, expect, it } from 'vitest';

import { securityHeaders } from './security-headers';

function header(headers: ReturnType<typeof securityHeaders>, key: string): string | undefined {
  return headers.find((h) => h.key === key)?.value;
}

describe('securityHeaders', () => {
  const prod = securityHeaders({ isDev: false, publicApiUrl: 'https://api.petnalia.com.br/v1' });

  it('envia os headers básicos de segurança', () => {
    expect(header(prod, 'X-Content-Type-Options')).toBe('nosniff');
    expect(header(prod, 'X-Frame-Options')).toBe('DENY');
    expect(header(prod, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header(prod, 'Strict-Transport-Security')).toContain('max-age=63072000');
    expect(header(prod, 'Permissions-Policy')).toContain('camera=()');
  });

  it('publica a CSP em modo Report-Only', () => {
    expect(header(prod, 'Content-Security-Policy')).toBeUndefined();
    expect(header(prod, 'Content-Security-Policy-Report-Only')).toContain("frame-ancestors 'none'");
  });

  it('libera na CSP só a origem da API pública e os serviços de CEP usados pelo navegador', () => {
    const csp = header(prod, 'Content-Security-Policy-Report-Only') ?? '';
    const connect = csp.split('; ').find((d) => d.startsWith('connect-src')) ?? '';
    expect(connect).toContain('https://api.petnalia.com.br');
    expect(connect).not.toContain('/v1');
    expect(connect).toContain('https://viacep.com.br');
    expect(connect).toContain('https://servicodados.ibge.gov.br');
    expect(connect).not.toContain('localhost');
  });

  it("só permite 'unsafe-eval' em desenvolvimento", () => {
    const devCsp = header(securityHeaders({ isDev: true }), 'Content-Security-Policy-Report-Only') ?? '';
    expect(devCsp).toContain("'unsafe-eval'");
    expect(header(prod, 'Content-Security-Policy-Report-Only')).not.toContain("'unsafe-eval'");
  });

  it('libera o envio de erros para a origem do DSN do Sentry', () => {
    const headers = securityHeaders({
      isDev: false,
      sentryDsn: 'https://abc123@o4507.ingest.us.sentry.io/4508',
    });
    const csp = header(headers, 'Content-Security-Policy-Report-Only') ?? '';
    expect(csp).toContain('https://o4507.ingest.us.sentry.io');
    expect(csp).not.toContain('abc123');
  });

  it('ignora uma URL pública da API malformada', () => {
    expect(() => securityHeaders({ isDev: false, publicApiUrl: 'not a url' })).not.toThrow();
  });
});
