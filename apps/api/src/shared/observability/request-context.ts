import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

interface RequestContext {
  readonly requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Incoming ids are echoed into logs, so only accept short, log-safe values. */
const SAFE_ID = /^[A-Za-z0-9._-]{1,64}$/;

export function resolveRequestId(incoming: unknown): string {
  return typeof incoming === 'string' && SAFE_ID.test(incoming) ? incoming : randomUUID();
}

/** Correlation id of the request being handled, if any. */
export function currentRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

/**
 * Assigns a correlation id to each request (reusing a valid `X-Request-Id` from the caller),
 * returns it in the response and makes it available to logs and error reports.
 */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = resolveRequestId(req.headers['x-request-id']);
  res.setHeader('X-Request-Id', requestId);
  storage.run({ requestId }, next);
}
