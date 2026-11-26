import { EventEmitter } from 'node:events';

import { describe, expect, it } from 'vitest';

import { currentRequestId, requestContextMiddleware, resolveRequestId } from './request-context';

describe('resolveRequestId', () => {
  it('reaproveita um id recebido em formato seguro', () => {
    expect(resolveRequestId('abc-123_DEF.9')).toBe('abc-123_DEF.9');
  });

  it('gera um uuid quando o header falta, é inválido ou longo demais', () => {
    const uuid = /^[0-9a-f-]{36}$/;
    expect(resolveRequestId(undefined)).toMatch(uuid);
    expect(resolveRequestId('quebra\nlinha')).toMatch(uuid);
    expect(resolveRequestId('x'.repeat(65))).toMatch(uuid);
    expect(resolveRequestId(['a', 'b'])).toMatch(uuid);
  });
});

describe('requestContextMiddleware', () => {
  it('expõe o id no header da resposta e no contexto assíncrono da requisição', async () => {
    const headers: Record<string, string> = {};
    const res = Object.assign(new EventEmitter(), {
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
    });

    const seen = await new Promise<string | undefined>((resolve) => {
      requestContextMiddleware({ headers: { 'x-request-id': 'req-42' } } as never, res as never, () => {
        setTimeout(() => resolve(currentRequestId()), 0);
      });
    });

    expect(headers['X-Request-Id']).toBe('req-42');
    expect(seen).toBe('req-42');
    expect(currentRequestId()).toBeUndefined();
  });
});
