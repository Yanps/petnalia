import * as Sentry from '@sentry/nextjs';

import { SENTRY_DATA_COLLECTION } from '@petnalia/config';

// Browser errors. Without NEXT_PUBLIC_SENTRY_DSN (inlined at build time) the SDK stays disabled.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  dataCollection: SENTRY_DATA_COLLECTION,
});
