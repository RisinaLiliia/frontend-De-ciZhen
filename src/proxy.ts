import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_AUTH_NEXT } from '@/features/auth/constants';

function hasRefreshSession(req: NextRequest): boolean {
  const value = req.cookies.get('refreshToken')?.value;
  return typeof value === 'string' && value.length > 0;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthenticated = hasRefreshSession(req);

  if (pathname.startsWith('/orders')) {
    if (!isAuthenticated) {
      const url = new URL('/auth/login', req.url);
      url.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === '/requests' && isAuthenticated) {
    const url = new URL(DEFAULT_AUTH_NEXT, req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders', '/orders/:path*', '/requests'],
};
