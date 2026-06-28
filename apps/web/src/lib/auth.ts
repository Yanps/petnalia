import { cookies } from 'next/headers';

export type UserRole = 'TUTOR' | 'VETERINARIAN' | 'ADMIN';

export interface Session {
  readonly userId: string;
  readonly role: UserRole;
  readonly email: string;
  readonly name: string;
}

// TODO: replace with real JWT validation (jose or similar)
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('petnalia_session')?.value;
  if (!token) return null;

  // Placeholder: in production, verify JWT signature and extract claims
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString(),
    ) as Partial<Session>;
    if (!payload.userId || !payload.role) return null;
    return payload as Session;
  } catch {
    return null;
  }
}

export async function requireSession(role?: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('Unauthenticated');
  if (role && session.role !== role) throw new Error('Forbidden');
  return session;
}
