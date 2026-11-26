import * as Sentry from '@sentry/nextjs';

import { SENTRY_DATA_COLLECTION } from '@petnalia/config';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Browser errors. Only initialised with a DSN (inlined at build time): even without one,
// init would install the integrations that wrap fetch/history, which the router uses.
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    dataCollection: SENTRY_DATA_COLLECTION,
  });
}
