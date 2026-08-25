import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

type UserRole = 'TUTOR' | 'VETERINARIAN' | 'ADMIN' | 'PET_SITTER';

interface JwtClaims {
  sub: string;
  role: string;
}

const VET_PROTECTED_SEGMENTS = new Set([
  'painel',
  'perfil',
  'area-atendimento',
  'assinatura',
  'consultas',
  'disponibilidade',
]);

const PET_SITTER_PROTECTED_SEGMENTS = new Set(['painel', 'perfil']);

function normalizeRole(role: string): UserRole | null {
  const map: Record<string, UserRole> = {
    tutor: 'TUTOR',
    veterinarian: 'VETERINARIAN',
    admin: 'ADMIN',
    pet_sitter: 'PET_SITTER',
  };
  return map[role.toLowerCase()] ?? null;
}

function matchRequiredRole(pathname: string): UserRole | null {
  if (pathname.startsWith('/admin')) return 'ADMIN';
  if (pathname === '/painel' || pathname === '/perfil' || pathname.startsWith('/consultas') || pathname.startsWith('/pets')) {
    return 'TUTOR';
  }
  const vetSegment = /^\/vet\/([^/]+)/.exec(pathname)?.[1];
  if (vetSegment && VET_PROTECTED_SEGMENTS.has(vetSegment)) return 'VETERINARIAN';
  const petSitterSegment = /^\/pet-sitter\/([^/]+)/.exec(pathname)?.[1];
  if (petSitterSegment && PET_SITTER_PROTECTED_SEGMENTS.has(petSitterSegment)) return 'PET_SITTER';
  return null;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set');
  return new TextEncoder().encode(secret);
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/entrar', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const requiredRole = matchRequiredRole(request.nextUrl.pathname);
  if (!requiredRole) return NextResponse.next();

  const token = request.cookies.get('petnalia_session')?.value;
  if (!token) return redirectToLogin(request);

  try {
    const { payload } = await jwtVerify<JwtClaims>(token, getJwtSecret());
    const role = normalizeRole(payload.role ?? '');
    if (!role || role !== requiredRole) return redirectToLogin(request);

    return NextResponse.next();
  } catch {
    const response = redirectToLogin(request);
    response.cookies.delete('petnalia_session');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};
