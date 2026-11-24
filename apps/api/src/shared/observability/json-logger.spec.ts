import { afterEach, describe, expect, it, vi } from 'vitest';

import { JsonLogger } from './json-logger';
import { requestContextMiddleware } from './request-context';

function captureStdout(): { readonly lines: () => Record<string, unknown>[] } {
  const chunks: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk: string | Uint8Array) => {
    chunks.push(String(chunk));
    return true;
  });
  return {
    lines: () =>
      chunks
        .join('')
        .trim()
        .split('\n')
        .map((l) => JSON.parse(l) as Record<string, unknown>),
  };
}

describe('JsonLogger', () => {
  afterEach(() => vi.restoreAllMocks());

  it('escreve uma linha JSON por evento com nível, horário e contexto', () => {
    const out = captureStdout();
    new JsonLogger().log('servidor no ar', 'Bootstrap');

    const [entry] = out.lines();
    expect(entry).toMatchObject({ level: 'info', context: 'Bootstrap', message: 'servidor no ar' });
    expect(typeof entry?.['time']).toBe('string');
  });

  it('mescla objetos estruturados na linha', () => {
    const out = captureStdout();
    new JsonLogger().log({ method: 'GET', path: '/v1/pets', durationMs: 12 }, 'Http');

    expect(out.lines()[0]).toMatchObject({ level: 'info', context: 'Http', method: 'GET', path: '/v1/pets' });
  });

  it('separa stack e contexto em erros', () => {
    const out = captureStdout();
    new JsonLogger().error('falhou', 'Error: boom\n    at x', 'AllExceptionsFilter');

    expect(out.lines()[0]).toMatchObject({
      level: 'error',
      message: 'falhou',
      stack: 'Error: boom\n    at x',
      context: 'AllExceptionsFilter',
    });
  });

  it('inclui o requestId da requisição em andamento', async () => {
    const out = captureStdout();
    const res = { setHeader: () => undefined };
    await new Promise<void>((resolve) => {
      requestContextMiddleware({ headers: { 'x-request-id': 'req-7' } } as never, res as never, () => {
        new JsonLogger().warn('lento', 'Http');
        resolve();
      });
    });

    expect(out.lines()[0]).toMatchObject({ level: 'warn', requestId: 'req-7' });
  });
});
