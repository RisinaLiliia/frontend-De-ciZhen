// src/lib/api/presence.ts
import { apiPost } from '@/lib/api/http';

export function getPresenceSocketUrl() {
  const publicApiBase = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (publicApiBase) {
    try {
      const url = new URL(publicApiBase);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${url.origin}/presence`;
    } catch {
      // Fall through to window-based URL.
    }
  }

  if (typeof window !== 'undefined') {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${window.location.host}/presence`;
  }
  return '';
}

export function pingPresence() {
  return apiPost<undefined, { ok: boolean }>('/presence/ping', undefined);
}
