import { describe, expect, it } from 'vitest';

import { RateLimitedError, authLimitPerMinute, rateLimitTracker } from './rate-limit';

describe('rateLimitTracker', () => {
  it('rastreia por usuário quando a requisição é autenticada', () => {
    expect(rateLimitTracker({ user: { id: 'u-1' }, ip: '10.0.0.1' })).toBe('user:u-1');
  });

  it('rastreia por IP quando a requisição é anônima', () => {
    expect(rateLimitTracker({ ip: '10.0.0.1' })).toBe('ip:10.0.0.1');
  });

  it('agrupa requisições sem IP conhecido num balde próprio', () => {
    expect(rateLimitTracker({})).toBe('ip:unknown');
  });
});

describe('RateLimitedError', () => {
  it('usa o envelope padrão com código estável e mensagem em pt-BR', () => {
    const error = new RateLimitedError();
    expect(error.getStatus()).toBe(429);
    expect(error.getResponse()).toEqual({
      code: 'RATE_LIMITED',
      message: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
    });
  });
});

describe('authLimitPerMinute', () => {
  it('usa 10 por minuto por padrão', () => {
    expect(authLimitPerMinute({})).toBe(10);
  });

  it('aceita override por ambiente (ex.: e2e local, onde todo o tráfego vem de um IP)', () => {
    expect(authLimitPerMinute({ RATE_LIMIT_AUTH_PER_MINUTE: '500' })).toBe(500);
  });

  it('ignora valores inválidos', () => {
    expect(authLimitPerMinute({ RATE_LIMIT_AUTH_PER_MINUTE: 'abc' })).toBe(10);
    expect(authLimitPerMinute({ RATE_LIMIT_AUTH_PER_MINUTE: '0' })).toBe(10);
  });
});
