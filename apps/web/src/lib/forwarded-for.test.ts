import { describe, expect, it } from 'vitest';

import { forwardedForHeader } from './forwarded-for';

describe('forwardedForHeader', () => {
  it('repassa o IP adicionado pelo nosso proxy (a última entrada da cadeia)', () => {
    expect(forwardedForHeader('203.0.113.9')).toEqual({ 'x-forwarded-for': '203.0.113.9' });
    // Earlier entries can be set by the client itself, so they are not trusted.
    expect(forwardedForHeader('6.6.6.6, 203.0.113.9')).toEqual({ 'x-forwarded-for': '203.0.113.9' });
  });

  it('não envia nada quando não há cabeçalho de origem', () => {
    expect(forwardedForHeader(null)).toEqual({});
    expect(forwardedForHeader('  ')).toEqual({});
  });
});
