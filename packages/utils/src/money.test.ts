import { describe, it, expect } from 'vitest';

import { toCents, fromCents, formatBRL } from './money.js';

describe('toCents', () => {
  it('converte valor inteiro para centavos', () => {
    expect(toCents(99)).toBe(9900);
  });

  it('converte valor decimal para centavos arredondando', () => {
    expect(toCents(99.9)).toBe(9990);
    expect(toCents(0.1 + 0.2)).toBe(30); // evita erro de float
  });

  it('converte zero para zero', () => {
    expect(toCents(0)).toBe(0);
  });
});

describe('fromCents', () => {
  it('converte centavos para reais', () => {
    expect(fromCents(9900)).toBe(99);
    expect(fromCents(9990)).toBe(99.9);
  });
});

describe('formatBRL', () => {
  it('formata centavos como moeda pt-BR', () => {
    expect(formatBRL(9900)).toContain('99');
    expect(formatBRL(9900)).toContain('R$');
  });

  it('formata zero corretamente', () => {
    expect(formatBRL(0)).toContain('0');
  });
});
