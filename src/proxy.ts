import { NextResponse, type NextRequest } from 'next/server';

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

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthenticated = hasRefreshSession(req);

  if (pathname === '/workspace') {
    const tab = req.nextUrl.searchParams.get('tab');
    const sectionRaw = req.nextUrl.searchParams.get('section');
    const section = sectionRaw === 'providers' ? 'providers' : 'orders';

    if (!isAuthenticated) {
      if (tab) {
        const login = new URL('/auth/login', req.url);
        login.searchParams.set('next', `${pathname}${search}`);
        return NextResponse.redirect(login);
      }
      const preview = new URL('/', req.url);
      preview.searchParams.set('view', 'orders');
      preview.searchParams.set('section', section);
      return NextResponse.rewrite(preview);
    }

    if (!tab) {
      const url = new URL('/workspace', req.url);
      url.searchParams.set('tab', 'new-orders');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/workspace', '/workspace/:path*'],
};
