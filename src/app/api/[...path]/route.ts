import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendProxyUrl,
  buildBackendRequestHeaders,
} from '@/app/api/_lib/backendProxy';

export const dynamic = 'force-dynamic';

async function handle(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  const path = Array.isArray(params.path) ? params.path.join('/') : '';
  const targetUrl = buildBackendProxyUrl(`/${path}`, request.nextUrl.search);
  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.arrayBuffer();
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: buildBackendRequestHeaders(request.headers),
    body,
    redirect: 'manual',
    cache: 'no-store',
  });

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE, handle as OPTIONS, handle as HEAD };
