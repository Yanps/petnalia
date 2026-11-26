import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type UserRole = 'TUTOR' | 'VETERINARIAN' | 'ADMIN' | 'PET_SITTER';

export interface Session {
  readonly userId: string;
  readonly role: UserRole;
  readonly email: string;
  readonly name: string;
}

interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set');
  return new TextEncoder().encode(secret);
}

function normalizeRole(role: string): UserRole | null {
  const map: Record<string, UserRole> = {
    tutor: 'TUTOR',
    veterinarian: 'VETERINARIAN',
    admin: 'ADMIN',
    pet_sitter: 'PET_SITTER',
  };
  return map[role.toLowerCase()] ?? null;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('petnalia_session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<JwtClaims>(token, getJwtSecret());
    const role = normalizeRole(payload.role ?? '');
    if (!payload.sub || !role) return null;
    return {
      userId: payload.sub,
      role,
      email: payload.email,
      name: payload.name ?? payload.email,
    };
  } catch {
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('petnalia_session')?.value ?? null;
}

export async function requireSession(role?: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/entrar');
  if (role && session.role !== role) redirect('/entrar');
  return session;
}
