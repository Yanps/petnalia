import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: validate JWT from petnalia_session cookie using jose
// TODO: role-based redirects (TUTOR → /painel, VETERINARIAN → /vet/painel)

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};
