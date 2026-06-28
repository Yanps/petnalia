import { z } from 'zod';

const CEP_REGEX = /^\d{5}-?\d{3}$/;

/** Returns true if the string looks like a valid BR CEP (format only, not ViaCEP lookup). */
export function isValidCEP(value: string): boolean {
  return CEP_REGEX.test(value.trim());
}

/** Normalises CEP to XXXXX-XXX format. */
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '');
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

/** Zod schema that validates a Brazilian CEP (with or without hyphen). */
export const zCep = () =>
  z
    .string()
    .refine((v) => isValidCEP(v), { message: 'CEP inválido' });
