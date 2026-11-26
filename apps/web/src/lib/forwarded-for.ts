/**
 * Builds the X-Forwarded-For header for server-side calls to the API, so the API can
 * rate-limit per browser instead of per Next.js server.
 *
 * Only the last entry is forwarded: it is the address our own proxy/load balancer saw.
 * Entries before it can be supplied by the client and are dropped.
 */
export function forwardedForHeader(incoming: string | null): Record<string, string> {
  const lastHop = incoming?.split(',').at(-1)?.trim();
  return lastHop ? { 'x-forwarded-for': lastHop } : {};
}
