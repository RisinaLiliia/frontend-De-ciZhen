import { NextResponse, type NextRequest } from 'next/server';

const DEFAULT_ORDERS_WORKSPACE_URL = '/orders?tab=my-requests&sort=date_desc&page=1&limit=20';

function hasRefreshSession(req: NextRequest): boolean {
  const value = req.cookies.get('refreshToken')?.value;
  return typeof value === 'string' && value.length > 0;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthenticated = hasRefreshSession(req);

  if (pathname.startsWith('/orders')) {
    if (!isAuthenticated) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.search = '';
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === '/requests' && isAuthenticated) {
    const url = new URL(DEFAULT_ORDERS_WORKSPACE_URL, req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders', '/orders/:path*', '/requests'],
};
