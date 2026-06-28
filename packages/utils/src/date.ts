/** Returns the ISO 8601 UTC string for a given Date. Always store/transfer in UTC. */
export function toUTC(date: Date): string {
  return date.toISOString();
}

/** Parses an ISO 8601 string and returns a UTC Date object. */
export function fromISO(iso: string): Date {
  const d = new Date(iso);
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date string: "${iso}"`);
  return d;
}

/** Returns true if two dates represent the same calendar day in UTC. */
export function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/** Adds `minutes` to a Date, returns a new Date (does not mutate). */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
