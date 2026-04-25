import { describe, expect, it, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/config/env.server', () => ({
  getServerEnv: () => ({
    NODE_ENV: 'development',
    API_BASE_URL: 'http://localhost:4000',
    NEXT_PUBLIC_API_BASE: undefined,
    NEXT_PUBLIC_PRESENCE_WS_BASE: undefined,
    NEXT_PUBLIC_PRIVACY_POLICY_URL: undefined,
    NEXT_PUBLIC_COOKIE_NOTICE_URL: undefined,
    NEXT_PUBLIC_ENABLE_APPLE_AUTH: undefined,
    NEXT_PUBLIC_DEMO: undefined,
    NEXT_PUBLIC_HERO_ANIMATION_MODE: undefined,
    NEXT_PUBLIC_ANALYTICS_ENABLED: undefined,
    NEXT_PUBLIC_WORKSPACE_STATS_SHOW_KPI: undefined,
    NEXT_PUBLIC_WORKSPACE_STATS_BFF: undefined,
    NEXT_IMAGE_UNOPTIMIZED: undefined,
    NEXT_IMAGE_OPTIMIZE_DEV: undefined,
  }),
}));

import { GET } from '@/app/api/[...path]/route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('workspace api proxy route', () => {
  it('returns a structured 503 payload when the backend is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    const request = new NextRequest('http://localhost:3000/api/catalog/services', {
      headers: {
        'x-request-id': 'req-123',
      },
    });

    const response = await GET(request, {
      params: Promise.resolve({ path: ['catalog', 'services'] }),
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      statusCode: 503,
      errorCode: 'UPSTREAM_UNAVAILABLE',
      message: 'Backend temporarily unavailable',
      path: '/api/catalog/services',
      requestId: 'req-123',
    }));
  });
});
