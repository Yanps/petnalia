import * as Sentry from '@sentry/nestjs';

import { SENTRY_DATA_COLLECTION } from '@petnalia/config';

// Imported first in main.ts so the SDK can instrument http/express before they load.
// Only with SENTRY_DSN: local dev and tests run without any instrumentation.
const dsn = process.env['SENTRY_DSN'];
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env['SENTRY_ENVIRONMENT'] ?? process.env['NODE_ENV'] ?? 'development',
    // LGPD: error, stack and route only (see @petnalia/config).
    dataCollection: SENTRY_DATA_COLLECTION,
  });
}
