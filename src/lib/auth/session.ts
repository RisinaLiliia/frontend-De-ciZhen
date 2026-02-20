// src/lib/auth/session.ts
import { buildApiUrl } from '@/lib/api/url';
import type { RefreshResponseDto } from '@/lib/api/dto/auth';

let refreshPromise: Promise<string | null> | null = null;
let refreshSuppressed = false;
const SESSION_HINT_KEY = 'dc_auth_session_hint';
const SESSION_HINT_COOKIE = 'dc_auth_session_hint';

function setSessionHintCookie(value: '1' | '', maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_HINT_COOKIE}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/orders') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/client') ||
    pathname.startsWith('/provider')
  );
}

export function allowRefreshAttempts() {
  refreshSuppressed = false;
}

export function suppressRefreshAttempts() {
  refreshSuppressed = true;
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

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshSuppressed) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(buildApiUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status >= 500) {
          refreshSuppressed = true;
        }
        return null;
      }

      const data = (await res.json()) as RefreshResponseDto;
      if (!data?.accessToken) return null;
      refreshSuppressed = false;
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
