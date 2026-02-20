import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_AUTH_NEXT } from '@/features/auth/constants';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function hasRefreshSession(req: NextRequest): boolean {
  const token = req.cookies.get('refreshToken')?.value;
  if (typeof token !== 'string' || token.length === 0) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const exp = typeof payload.exp === 'number' ? payload.exp : 0;
  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : '';
  const nowSec = Math.floor(Date.now() / 1000);

  return exp > nowSec && sub.length > 0 && sessionId.length > 0;
}

function hasAuthHint(req: NextRequest): boolean {
  return req.cookies.get('dc_auth_session_hint')?.value === '1';
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthenticated = hasRefreshSession(req);
  const hasHint = hasAuthHint(req);

  if (pathname.startsWith('/orders')) {
    if (!isAuthenticated) {
      const url = new URL('/auth/login', req.url);
      url.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === '/requests' && isAuthenticated && hasHint) {
    const url = new URL(DEFAULT_AUTH_NEXT, req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders', '/orders/:path*', '/requests'],
};
