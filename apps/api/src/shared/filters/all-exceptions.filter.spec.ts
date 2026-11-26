import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const sentry = vi.hoisted(() => {
  const scope = { setTag: vi.fn() };
  return {
    scope,
    captureException: vi.fn(),
    withScope: vi.fn((cb: (s: typeof scope) => void) => cb(scope)),
  };
});
vi.mock('@sentry/nestjs', () => ({ captureException: sentry.captureException, withScope: sentry.withScope }));

import { AllExceptionsFilter } from './all-exceptions.filter';
import { requestContextMiddleware } from '../observability/request-context';

function run(exception: unknown) {
  const json = vi.fn();
  const res = { status: vi.fn((_code: number) => ({ json })) };
  const host = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => ({ method: 'POST', url: '/v1/appointments?x=1', path: '/v1/appointments' }),
    }),
  };
  new AllExceptionsFilter().catch(exception, host as never);
  return { status: res.status.mock.calls[0]?.[0] as number, body: json.mock.calls[0]?.[0] as unknown };
}

describe('AllExceptionsFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('responde 500 com envelope genérico e reporta o erro ao Sentry com o requestId', async () => {
    const error = new Error('connection refused at 10.0.0.3');
    let result: ReturnType<typeof run> | undefined;
    await new Promise<void>((resolve) => {
      requestContextMiddleware({ headers: { 'x-request-id': 'req-500' } } as never, { setHeader: vi.fn() } as never, () => {
        result = run(error);
        resolve();
      });
    });

    expect(result?.status).toBe(500);
    expect(result?.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno. Tente novamente mais tarde.' } });
    expect(JSON.stringify(result?.body)).not.toContain('10.0.0.3');
    expect(sentry.captureException).toHaveBeenCalledWith(error);
    expect(sentry.scope.setTag).toHaveBeenCalledWith('request_id', 'req-500');
  });

  it('reporta HttpException 5xx', () => {
    run(new HttpException('upstream', HttpStatus.BAD_GATEWAY));
    expect(sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('não reporta erros esperados (4xx e validação)', () => {
    expect(run(new HttpException({ code: 'VETERINARIAN_NOT_FOUND', message: 'x' }, 404)).status).toBe(404);
    const zodError = z.object({ a: z.string() }).safeParse({}).error;
    expect(run(zodError).status).toBe(422);
    expect(sentry.captureException).not.toHaveBeenCalled();
  });
});
