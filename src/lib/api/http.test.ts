import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

const { clearAuthMock, refreshAccessTokenMock } = vi.hoisted(() => ({
  clearAuthMock: vi.fn(),
  refreshAccessTokenMock: vi.fn(),
}));

vi.mock('@/features/auth/store', () => ({
  clearAuth: clearAuthMock,
}));

vi.mock('@/lib/auth/session', () => ({
  refreshAccessToken: refreshAccessTokenMock,
}));

import { apiGet } from '@/lib/api/http';
import { getAccessToken, setAccessToken } from '@/lib/auth/token';

describe('api http client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    clearAuthMock.mockReset();
    refreshAccessTokenMock.mockReset();
    setAccessToken(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it('keeps auth state when refresh is temporarily unavailable', async () => {
    setAccessToken('expired-token');

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      message: 'Unauthorized',
      error: 'Unauthorized',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: '/api/workspace/private',
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }));
    refreshAccessTokenMock.mockResolvedValue({ status: 'unavailable' });

    await expect(apiGet('/workspace/private')).rejects.toMatchObject({
      status: 503,
      data: expect.objectContaining({
        errorCode: 'AUTH_REFRESH_UNAVAILABLE',
      }),
    });

    expect(getAccessToken()).toBe('expired-token');
    expect(clearAuthMock).not.toHaveBeenCalled();
  });

  it('clears auth state when refresh becomes unauthorized', async () => {
    setAccessToken('expired-token');

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      message: 'Unauthorized',
      error: 'Unauthorized',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: '/api/workspace/private',
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }));
    refreshAccessTokenMock.mockResolvedValue({ status: 'unauthorized' });

    await expect(apiGet('/workspace/private')).rejects.toMatchObject({
      status: 401,
    });

    expect(getAccessToken()).toBe(null);
    expect(clearAuthMock).toHaveBeenCalledTimes(1);
  });
});
