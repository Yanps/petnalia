import { describe, it, expect } from 'vitest';

import { isValidCPF, stripCPF, zCpf } from './cpf.js';

const VALID_CPF = '111.444.777-35';
const VALID_CPF_DIGITS = '11144477735';

describe('stripCPF', () => {
  it('remove pontuação', () => {
    expect(stripCPF('111.444.777-35')).toBe('11144477735');
  });

  it('deixa somente dígitos intactos', () => {
    expect(stripCPF('11144477735')).toBe('11144477735');
  });
});

describe('isValidCPF', () => {
  it('aceita CPF válido formatado', () => {
    expect(isValidCPF(VALID_CPF)).toBe(true);
  });

  it('aceita CPF válido sem formatação', () => {
    expect(isValidCPF(VALID_CPF_DIGITS)).toBe(true);
  });

  it('rejeita CPF com todos dígitos iguais', () => {
    expect(isValidCPF('111.111.111-11')).toBe(false);
    expect(isValidCPF('00000000000')).toBe(false);
  });

  it('rejeita CPF com dígitos verificadores errados', () => {
    expect(isValidCPF('111.444.777-00')).toBe(false);
  });

  it('rejeita CPF com comprimento errado', () => {
    expect(isValidCPF('1234567890')).toBe(false);
    expect(isValidCPF('123456789012')).toBe(false);
  });
});

describe('zCpf', () => {
  const schema = zCpf();

  it('parseia CPF válido', () => {
    expect(schema.safeParse(VALID_CPF).success).toBe(true);
  });

  it('rejeita CPF inválido com mensagem em pt-BR', () => {
    const result = schema.safeParse('000.000.000-00');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe('CPF inválido');
    }
  });
});
