/**
 * Data the error-tracking SDK (Sentry) may attach to events. PetNalia handles personal and
 * health data (LGPD), so events carry the error, stack and route only — no user info,
 * cookies, headers, bodies, query strings, local variables or query data.
 *
 * Structurally matches Sentry's `dataCollection` option; kept SDK-free on purpose.
 */
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [] as never[],
  urlQueryParams: false,
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
  genAI: { inputs: false, outputs: false },
  graphQL: { document: false, variables: false },
  mcp: { inputs: false, outputs: false },
} as const;
