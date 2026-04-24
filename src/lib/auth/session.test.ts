import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

import {
  allowRefreshAttempts,
  clearSessionHint,
  markSessionHint,
  refreshAccessToken,
  suppressRefreshAttempts,
} from '@/lib/auth/session';

describe('auth session refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('window', {
      location: { pathname: '/' },
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    });
    vi.stubGlobal('document', { cookie: '' });
    allowRefreshAttempts();
  });

  afterEach(() => {
    suppressRefreshAttempts();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('retries transient refresh failures and eventually succeeds', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(new Response(null, { status: 502 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'token-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

    const pending = refreshAccessToken();
    await vi.runAllTimersAsync();

    await expect(pending).resolves.toEqual({
      status: 'success',
      accessToken: 'token-1',
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('returns unauthorized for hard auth failures and clears the session hint', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const removeItem = vi.spyOn(window.localStorage, 'removeItem');
    markSessionHint();

    await expect(refreshAccessToken()).resolves.toEqual({ status: 'unauthorized' });
    expect(removeItem).toHaveBeenCalledWith('dc_auth_session_hint');
  });

  it('enters cooldown after repeated transient failures', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    const firstAttempt = refreshAccessToken();
    await vi.runAllTimersAsync();
    await expect(firstAttempt).resolves.toEqual({ status: 'unavailable' });

    await expect(refreshAccessToken()).resolves.toEqual({ status: 'unavailable' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('can be reset after a previous failure state', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    const failingAttempt = refreshAccessToken();
    await vi.runAllTimersAsync();
    await failingAttempt;

    clearSessionHint();
    allowRefreshAttempts();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'token-2' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    await expect(refreshAccessToken()).resolves.toEqual({
      status: 'success',
      accessToken: 'token-2',
    });
  });
});
