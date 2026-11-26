import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { forwardedForHeader } from '@/lib/forwarded-for';

/**
 * Same-origin proxy (BFF) for browser calls to the API.
 *
 * Client Components call `/api/v1/...` instead of the API directly, so the JWT stays
 * in the httpOnly `petnalia_session` cookie and is attached here, on the server.
 * Business rules stay in the API — this only forwards.
 */

const API_BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const SESSION_COOKIE = 'petnalia_session';
const SAFE_METHODS = new Set(['GET', 'HEAD']);
const FORWARDED_REQUEST_HEADERS = ['accept', 'content-type', 'idempotency-key'] as const;
const FORWARDED_RESPONSE_HEADERS = ['content-type', 'content-disposition'] as const;

interface RouteContext {
  readonly params: Promise<{ path: string[] }>;
}

function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

// Cookie auth makes mutations CSRF-prone; SameSite=Lax already blocks cross-site POSTs,
// and browsers always send Origin on non-GET fetches, so require it to match our host.
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function proxy(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  if (!SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    return errorResponse(403, 'FORBIDDEN_ORIGIN', 'Origem da requisição não permitida.');
  }

  const { path } = await context.params;
  if (path.some((segment) => segment === '..' || segment === '.')) {
    return errorResponse(404, 'NOT_FOUND', 'Recurso não encontrado.');
  }

  const target = new URL(`/v1/${path.map(encodeURIComponent).join('/')}`, API_BASE);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) headers.set('authorization', `Bearer ${token}`);
  for (const [name, value] of Object.entries(forwardedForHeader(request.headers.get('x-forwarded-for')))) {
    headers.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      ...(!SAFE_METHODS.has(request.method) && { body: await request.arrayBuffer() }),
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    return errorResponse(502, 'UPSTREAM_UNAVAILABLE', 'Serviço indisponível. Tente novamente em instantes.');
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
