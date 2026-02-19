// src/lib/api/presence.ts
import { apiPost } from '@/lib/api/http';

function normalizeToWsOrigin(raw: string): string | null {
  try {
    const url = new URL(raw);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.origin;
  } catch {
    return null;
  }
}

export function getPresenceSocketUrl() {
  const explicitWsBase = process.env.NEXT_PUBLIC_PRESENCE_WS_BASE?.trim();
  if (explicitWsBase) {
    const wsOrigin = normalizeToWsOrigin(explicitWsBase);
    if (wsOrigin) return `${wsOrigin}/presence`;
  }

  const publicApiBase = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (publicApiBase) {
    const wsOrigin = normalizeToWsOrigin(publicApiBase);
    if (wsOrigin) return `${wsOrigin}/presence`;
  }

  // Dev fallback only: in production we do not auto-connect to the frontend host.
  if (typeof window !== 'undefined') {
    const isLocalDev =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalDev) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${window.location.host}/presence`;
    }
  }

  return '';
}

export function pingPresence() {
  return apiPost<undefined, { ok: boolean }>('/presence/ping', undefined);
}
