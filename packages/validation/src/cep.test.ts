import { describe, it, expect } from 'vitest';

import { isValidCEP, formatCEP, zCep } from './cep.js';

describe('isValidCEP', () => {
  it('aceita CEP com hífen', () => {
    expect(isValidCEP('01310-100')).toBe(true);
  });

  it('aceita CEP sem hífen', () => {
    expect(isValidCEP('01310100')).toBe(true);
  });

  it('rejeita CEP com comprimento errado', () => {
    expect(isValidCEP('0131010')).toBe(false);
    expect(isValidCEP('013101000')).toBe(false);
  });

  it('rejeita CEP com letras', () => {
    expect(isValidCEP('0131A-100')).toBe(false);
  });
});

describe('formatCEP', () => {
  it('formata dígitos brutos para XXXXX-XXX', () => {
    expect(formatCEP('01310100')).toBe('01310-100');
  });

  it('normaliza CEP já formatado', () => {
    expect(formatCEP('01310-100')).toBe('01310-100');
  });
});

describe('zCep', () => {
  const schema = zCep();

  it('parseia CEP válido', () => {
    expect(schema.safeParse('01310-100').success).toBe(true);
    expect(schema.safeParse('01310100').success).toBe(true);
  });

  it('rejeita CEP inválido', () => {
    const result = schema.safeParse('0131');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe('CEP inválido');
    }
  });
});
