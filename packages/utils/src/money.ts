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
