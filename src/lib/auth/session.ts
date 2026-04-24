// src/lib/auth/session.ts
import { buildApiUrl } from '@/lib/api/url';
import type { RefreshResponseDto } from '@/lib/api/dto/auth';

const REFRESH_MAX_ATTEMPTS = 3;
const REFRESH_RETRY_BASE_DELAY_MS = 300;
const REFRESH_COOLDOWN_MS = 15_000;
const SESSION_HINT_KEY = 'dc_auth_session_hint';
const SESSION_HINT_COOKIE = 'dc_auth_session_hint';

export type RefreshAccessTokenResult =
  | { status: 'success'; accessToken: string }
  | { status: 'unauthorized' }
  | { status: 'unavailable' };

let refreshPromise: Promise<RefreshAccessTokenResult> | null = null;
let refreshSuppressed = false;
let refreshCooldownUntil = 0;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function setSessionHintCookie(value: '1' | '', maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_HINT_COOKIE}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function isProtectedPath(pathname: string): boolean {
  const isSegment = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  return (
    isSegment('/chat') ||
    isSegment('/profile') ||
    isSegment('/client') ||
    isSegment('/provider')
  );
}

async function requestRefreshAccessToken(): Promise<RefreshAccessTokenResult> {
  try {
    const res = await fetch(buildApiUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        clearSessionHint();
        refreshSuppressed = true;
        return { status: 'unauthorized' };
      }
      return { status: 'unavailable' };
    }

    const data = (await res.json()) as RefreshResponseDto;
    if (!data?.accessToken) return { status: 'unavailable' };

    refreshSuppressed = false;
    refreshCooldownUntil = 0;
    return { status: 'success', accessToken: data.accessToken };
  } catch {
    return { status: 'unavailable' };
  }
}

export function allowRefreshAttempts() {
  refreshSuppressed = false;
  refreshCooldownUntil = 0;
}

export function suppressRefreshAttempts() {
  refreshSuppressed = true;
  refreshCooldownUntil = 0;
}

export function markSessionHint() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_HINT_KEY, '1');
  setSessionHintCookie('1', 60 * 60 * 24 * 30);
}

export function clearSessionHint() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_HINT_KEY);
  setSessionHintCookie('', 0);
}

export function shouldAttemptRefreshOnBootstrap(): boolean {
  if (typeof window === 'undefined') return true;
  if (isProtectedPath(window.location.pathname)) return true;
  return window.localStorage.getItem(SESSION_HINT_KEY) === '1';
}

export async function refreshAccessToken(): Promise<RefreshAccessTokenResult> {
  if (refreshSuppressed) return { status: 'unauthorized' };
  if (refreshPromise) return refreshPromise;
  if (refreshCooldownUntil > Date.now()) return { status: 'unavailable' };

  refreshPromise = (async () => {
    for (let attempt = 1; attempt <= REFRESH_MAX_ATTEMPTS; attempt += 1) {
      const result = await requestRefreshAccessToken();
      if (result.status !== 'unavailable') return result;
      if (attempt < REFRESH_MAX_ATTEMPTS) {
        await sleep(REFRESH_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }

    refreshCooldownUntil = Date.now() + REFRESH_COOLDOWN_MS;
    return { status: 'unavailable' };
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
