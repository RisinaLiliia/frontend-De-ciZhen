import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config/env.server', () => ({
  getServerEnv: vi.fn(),
}));

import { getServerEnv } from '@/lib/config/env.server';
import {
  buildBackendProxyUrl,
  buildBackendRequestHeaders,
  resolveBackendBaseUrl,
} from '@/app/api/_lib/backendProxy';

const mockedGetServerEnv = vi.mocked(getServerEnv);

describe('backendProxy', () => {
  it('uses explicit API_BASE_URL when configured', () => {
    mockedGetServerEnv.mockReturnValue({
      NODE_ENV: 'development',
      API_BASE_URL: 'http://localhost:4100/',
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
    });

    expect(resolveBackendBaseUrl()).toBe('http://localhost:4100');
    expect(buildBackendProxyUrl('/requests/public', '?page=1')).toBe(
      'http://localhost:4100/requests/public?page=1',
    );
  });

  it('falls back to local backend in development', () => {
    mockedGetServerEnv.mockReturnValue({
      NODE_ENV: 'development',
      API_BASE_URL: undefined,
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
    });

    expect(resolveBackendBaseUrl()).toBe('http://localhost:4000');
  });

  it('drops hop-by-hop headers before proxying', () => {
    const source = new Headers({
      authorization: 'Bearer token',
      connection: 'keep-alive',
      'content-length': '123',
      cookie: 'a=b',
      host: 'localhost:3000',
    });

    const headers = buildBackendRequestHeaders(source);

    expect(headers.get('authorization')).toBe('Bearer token');
    expect(headers.get('cookie')).toBe('a=b');
    expect(headers.has('connection')).toBe(false);
    expect(headers.has('content-length')).toBe(false);
    expect(headers.has('host')).toBe(false);
  });
});
