import { HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerModuleOptions } from '@nestjs/throttler';

import { DomainError } from '../errors/domain.error';

const MINUTE_MS = 60_000;

/** Global default — generous; it exists to stop runaway clients, not normal use. */
export const RATE_LIMIT_DEFAULT: ThrottlerModuleOptions = [
  { name: 'default', ttl: MINUTE_MS, limit: 300 },
];

const AUTH_LIMIT_DEFAULT = 10;

/**
 * Auth limit, overridable with RATE_LIMIT_AUTH_PER_MINUTE. Locally every request reaches
 * the API from one address (no load balancer), so e2e runs need a higher value.
 */
export function authLimitPerMinute(env: Record<string, string | undefined> = process.env): number {
  const parsed = Number(env['RATE_LIMIT_AUTH_PER_MINUTE']);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : AUTH_LIMIT_DEFAULT;
}

/** Per-route overrides, used with `@Throttle(...)`. */
export const RATE_LIMIT = {
  /** Login, sign-up, password reset: slows down credential stuffing. Read per request,
   *  because decorators are evaluated before ConfigModule loads .env. */
  AUTH: { default: { ttl: MINUTE_MS, limit: () => authLimitPerMinute() } },
  /** Booking writes. */
  BOOKING: { default: { ttl: MINUTE_MS, limit: 20 } },
} as const;

export class RateLimitedError extends DomainError {
  constructor() {
    super(
      'RATE_LIMITED',
      'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

interface TrackableRequest {
  readonly user?: { readonly id: string };
  readonly ip?: string;
}

/**
 * Authenticated traffic is limited per user, anonymous traffic per IP.
 * Browser calls reach the API through the web app's proxy, so they all share the
 * Next.js server's IP — keying on the user keeps one user from throttling everyone.
 */
export function rateLimitTracker(request: TrackableRequest): string {
  if (request.user?.id) return `user:${request.user.id}`;
  return `ip:${request.ip ?? 'unknown'}`;
}

/** Must run after JwtAuthGuard (register it later in APP_GUARD) so `request.user` is set. */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected override getTracker(request: Record<string, unknown>): Promise<string> {
    return Promise.resolve(rateLimitTracker(request as TrackableRequest));
  }

  protected override throwThrottlingException(): Promise<void> {
    throw new RateLimitedError();
  }
}
