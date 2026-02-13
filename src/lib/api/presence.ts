// src/lib/api/presence.ts
import { apiPost } from '@/lib/api/http';

export function getPresenceSocketUrl() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/presence`;
  }
  return '';
}

export function pingPresence() {
  return apiPost<undefined, { ok: boolean }>('/presence/ping', undefined);
}
