import { z } from 'zod';

/**
 * BR state abbreviations (UF) accepted in CRMV numbers.
 * Format: digits + UF, e.g. "12345SP", "9876RJ".
 */
const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
] as const;

const CRMV_REGEX = new RegExp(`^\\d{1,6}(${UF_LIST.join('|')})$`, 'i');

/** Returns true if the string matches the expected CRMV format (digits + UF). */
export function isValidCRMV(value: string): boolean {
  return CRMV_REGEX.test(value.trim());
}

/** Normalises a CRMV to uppercase (e.g. "12345sp" → "12345SP"). */
export function normalizeCRMV(value: string): string {
  return value.trim().toUpperCase();
}

/** Zod schema that validates a Brazilian CRMV number. */
export const zCrmv = () =>
  z
    .string()
    .transform(normalizeCRMV)
    .refine((v) => isValidCRMV(v), { message: 'CRMV inválido (ex.: 12345SP)' });
