/**
 * middleware.ts — Protección de rutas en el Edge de Next.js.
 *
 * El middleware corre en el servidor (Edge Runtime) y NO puede acceder
 * a localStorage. Por eso usamos la cookie `has_session` como indicador
 * de sesión activa. El token real siempre se valida en el backend.
 *
 * Reglas:
 * - /clients/* sin sesión → redirige a /login
 * - /login con sesión → redirige a /clients
 * - Todo lo demás → pasa normalmente
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('has_session');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/clients') && !session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && session) {
    const clientsUrl = new URL('/clients', request.url);
    return NextResponse.redirect(clientsUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/clients/:path*', '/login'],
};
