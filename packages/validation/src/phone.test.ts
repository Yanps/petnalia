import { describe, it, expect } from 'vitest';

import { isValidPhoneBR, stripPhone, zPhoneBR } from './phone.js';

describe('stripPhone', () => {
  it('remove caracteres não numéricos', () => {
    expect(stripPhone('(11) 98765-4321')).toBe('11987654321');
  });
});

describe('isValidPhoneBR', () => {
  it('aceita celular com DDD (11 dígitos, começa com 9)', () => {
    expect(isValidPhoneBR('11987654321')).toBe(true);
  });

  it('aceita fixo com DDD (10 dígitos)', () => {
    expect(isValidPhoneBR('1132109876')).toBe(true);
  });

  it('aceita com código de país +55', () => {
    expect(isValidPhoneBR('+5511987654321')).toBe(true);
    expect(isValidPhoneBR('5511987654321')).toBe(true);
  });

  it('aceita celular formatado', () => {
    expect(isValidPhoneBR('(11) 98765-4321')).toBe(true);
  });

  it('rejeita celular sem DDD (9 dígitos)', () => {
    expect(isValidPhoneBR('987654321')).toBe(false);
  });

  it('rejeita número com comprimento inválido', () => {
    expect(isValidPhoneBR('1198765')).toBe(false);
  });
});

describe('zPhoneBR', () => {
  const schema = zPhoneBR();

  it('parseia celular válido', () => {
    expect(schema.safeParse('11987654321').success).toBe(true);
  });

  it('rejeita telefone inválido com mensagem em pt-BR', () => {
    const result = schema.safeParse('123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('Telefone inválido');
    }
  });
});
