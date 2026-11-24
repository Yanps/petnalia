import * as Sentry from '@sentry/nextjs';

import { parseWebEnv, SENTRY_DATA_COLLECTION } from '@petnalia/config';

/** Runs once when the Next server starts (not during `next build`). */
export function register(): void {
  // Fail fast on a missing/malformed variable (ADR-0001). The edge runtime only sees a
  // subset of the environment, so validate in the Node.js server.
  if (process.env.NEXT_RUNTIME === 'nodejs') parseWebEnv(process.env);

  // Only with a DSN: without one, init would still instrument the server for nothing.
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
      dataCollection: SENTRY_DATA_COLLECTION,
    });
  }
}

/** Errors thrown while rendering Server Components, route handlers and Server Actions. */
export const onRequestError = Sentry.captureRequestError;
