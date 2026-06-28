import { describe, it, expect } from 'vitest';

import { formatDistanceKm, formatPhoneBR, slugify, truncate } from './format.js';

describe('formatDistanceKm', () => {
  it('formata distância abaixo de 1km em metros', () => {
    expect(formatDistanceKm(0.3)).toBe('300 m');
    expect(formatDistanceKm(0.5)).toBe('500 m');
  });

  it('formata distância acima de 1km em km', () => {
    expect(formatDistanceKm(1.5)).toContain('km');
    expect(formatDistanceKm(10)).toContain('km');
  });
});

describe('formatPhoneBR', () => {
  it('formata celular com DDD (11 dígitos)', () => {
    expect(formatPhoneBR('11987654321')).toBe('(11) 98765-4321');
  });

  it('formata fixo com DDD (10 dígitos)', () => {
    expect(formatPhoneBR('1132109876')).toBe('(11) 3210-9876');
  });

  it('ignora formatação existente', () => {
    expect(formatPhoneBR('(11) 98765-4321')).toBe('(11) 98765-4321');
  });
});

describe('slugify', () => {
  it('converte texto para kebab-case sem acentos', () => {
    expect(slugify('Veterinário São Paulo')).toBe('veterinario-sao-paulo');
  });

  it('remove caracteres especiais', () => {
    expect(slugify('Dr. João & Cia!')).toBe('dr-joao-cia');
  });

  it('colapsa múltiplos hífens', () => {
    expect(slugify('a   b')).toBe('a-b');
  });
});

describe('truncate', () => {
  it('não trunca texto menor que o limite', () => {
    expect(truncate('abc', 10)).toBe('abc');
  });

  it('trunca com reticências', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcd…');
  });
});
