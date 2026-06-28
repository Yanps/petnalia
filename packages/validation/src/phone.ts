import { z } from 'zod';

/** Strips all non-digit characters from a phone string. */
export function stripPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Returns true if the phone looks like a valid Brazilian mobile or landline.
 * Accepts with/without country code (+55) and with/without DDD.
 * Mobile: 11 digits (with DDD) — starts with 9.
 * Landline: 10 digits (with DDD).
 */
export function isValidPhoneBR(value: string): boolean {
  const digits = stripPhone(value);
  // Remove country code if present
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  if (local.length === 11) return /^[1-9]{2}9\d{8}$/.test(local); // mobile
  if (local.length === 10) return /^[1-9]{2}[2-5]\d{7}$/.test(local); // landline
  return false;
}

/** Zod schema that validates a Brazilian phone number (mobile or landline). */
export const zPhoneBR = () =>
  z
    .string()
    .refine((v) => isValidPhoneBR(v), { message: 'Telefone inválido (use DDD + número)' });
