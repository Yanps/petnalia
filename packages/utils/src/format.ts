/** Formats a distance in kilometers for pt-BR display (e.g. 1.5 → "1,5 km", 0.3 → "300 m"). */
export function formatDistanceKm(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(km) + ' km';
}

/** Formats a BR phone number string to (XX) XXXXX-XXXX or (XX) XXXX-XXXX. */
export function formatPhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/** Converts a string to a URL-safe kebab-case slug. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/** Truncates a string to `maxLength` chars, appending "…" if truncated. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}
