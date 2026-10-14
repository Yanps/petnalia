import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const cookieValue = vi.hoisted((): { token: string | undefined } => ({ token: 'jwt-from-cookie' }));

vi.mock('next/headers', () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) =>
        name === 'petnalia_session' && cookieValue.token ? { value: cookieValue.token } : undefined,
    }),
}));

import { DELETE, GET, POST } from './route';

const fetchMock = vi.fn<typeof fetch>();

function ctx(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

function request(url: string, init: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: init.method ?? 'GET',
    headers: { host: 'localhost:3000', ...init.headers },
    ...(init.body !== undefined && { body: init.body }),
  });
}

beforeEach(() => {
  cookieValue.token = 'jwt-from-cookie';
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('proxy /api/v1/* → API', () => {
  it('repassa a chamada para a API com o token do cookie httpOnly', async () => {
    const res = await GET(request('/api/v1/appointments?status=requested'), ctx('appointments'));

    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect((url as URL).href).toBe('http://localhost:4000/v1/appointments?status=requested');
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer jwt-from-cookie');
  });

  it('repassa o IP do navegador para o rate limiting da API', async () => {
    await GET(
      request('/api/v1/appointments', { headers: { 'x-forwarded-for': '6.6.6.6, 203.0.113.9' } }),
      ctx('appointments'),
    );

    const [, init] = fetchMock.mock.calls[0]!;
    expect(new Headers(init?.headers).get('x-forwarded-for')).toBe('203.0.113.9');
  });

  it('não envia Authorization quando não há sessão', async () => {
    cookieValue.token = undefined;
    await GET(request('/api/v1/veterinarians/specialties'), ctx('veterinarians', 'specialties'));

    const [, init] = fetchMock.mock.calls[0]!;
    expect(new Headers(init?.headers).has('authorization')).toBe(false);
  });

  it('repassa corpo, content-type e Idempotency-Key em mutações da mesma origem', async () => {
    await POST(
      request('/api/v1/appointments', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', 'idempotency-key': 'k-1' },
        body: '{"a":1}',
      }),
      ctx('appointments'),
    );

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(init?.method).toBe('POST');
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('idempotency-key')).toBe('k-1');
    expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toBe('{"a":1}');
  });

  it('recusa mutação de outra origem (CSRF) sem chamar a API', async () => {
    const res = await DELETE(
      request('/api/v1/pets/x', { method: 'DELETE', headers: { origin: 'https://evil.example' } }),
      ctx('pets', 'x'),
    );

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: { code: 'FORBIDDEN_ORIGIN', message: 'Origem da requisição não permitida.' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('recusa mutação sem cabeçalho Origin', async () => {
    const res = await POST(request('/api/v1/reviews', { method: 'POST', body: '{}' }), ctx('reviews'));
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('recusa segmentos de path traversal', async () => {
    const res = await GET(request('/api/v1/x'), ctx('..', 'internal'));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preserva status e corpo de erro da API', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'APPOINTMENT_FORBIDDEN', message: 'x' } }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const res = await GET(request('/api/v1/appointments/1'), ctx('appointments', '1'));

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: { code: 'APPOINTMENT_FORBIDDEN', message: 'x' } });
  });

  it('responde 502 no envelope padrão quando a API está fora do ar', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    const res = await GET(request('/api/v1/appointments'), ctx('appointments'));

    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UPSTREAM_UNAVAILABLE');
  });
});
