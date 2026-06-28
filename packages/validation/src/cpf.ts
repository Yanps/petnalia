import { z } from 'zod';

/** Strips CPF formatting, leaving only digits. */
export function stripCPF(value: string): string {
  return value.replace(/\D/g, '');
}

/** Returns true if the CPF check digits are valid (does not check DB existence). */
export function isValidCPF(value: string): boolean {
  const digits = stripCPF(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // all same digit

  const calcDigit = (slice: string, weights: number[]): number => {
    const sum = slice
      .split('')
      .reduce((acc, d, i) => acc + Number(d) * (weights[i] ?? 0), 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const first = calcDigit(digits.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (first !== Number(digits[9])) return false;

  const second = calcDigit(digits.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return second === Number(digits[10]);
}

/** Zod schema that validates Brazilian CPF (with or without formatting). */
export const zCpf = () =>
  z
    .string()
    .refine((v) => isValidCPF(v), { message: 'CPF inválido' });
