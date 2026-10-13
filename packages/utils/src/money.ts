/** Converts a BRL float (e.g. 99.90) to integer cents (9990). Never use float arithmetic for currency. */
export function toCents(brl: number): number {
  return Math.round(brl * 100);
}

/** Converts integer cents (9990) to BRL float (99.90). */
export function fromCents(cents: number): number {
  return cents / 100;
}

/** Formats integer cents as a pt-BR currency string (e.g. 9990 → "R$ 99,90"). */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(fromCents(cents));
}

/** Formats integer cents as a pt-BR amount without the currency symbol (18000 → "180,00"). For form inputs. */
export function formatBRLAmount(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fromCents(cents));
}

export type ParsedBRL =
  | { readonly kind: 'empty' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'value'; readonly cents: number };

// "150" · "150,5" · "1.500,00" — thousands groups must be exactly 3 digits.
const BRL_INPUT = /^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/;

/**
 * Parses a pt-BR money string typed by a user ("1.500,00", "R$ 90,5") into integer cents.
 * Uses integer arithmetic only, so "0,29" is exactly 29 (0.29 * 100 is not).
 */
export function parseBRL(input: string): ParsedBRL {
  const value = input.replace(/^\s*R\$\s*/i, '').trim();
  if (value === '') return { kind: 'empty' };
  if (!BRL_INPUT.test(value)) return { kind: 'invalid' };

  const [reais = '0', centavos = ''] = value.replace(/\./g, '').split(',');
  return { kind: 'value', cents: Number(reais) * 100 + Number(centavos.padEnd(2, '0')) };
}
