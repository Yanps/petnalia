import { parseWebEnv } from '@petnalia/config';

/** Runs once when the Next server starts (not during `next build`). */
export function register(): void {
  // Fail fast on a missing/malformed variable (ADR-0001). The edge runtime only sees a
  // subset of the environment, so validate in the Node.js server.
  if (process.env.NEXT_RUNTIME === 'nodejs') parseWebEnv(process.env);
}
