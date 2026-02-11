// src/lib/api/presence.ts
import { apiPost } from '@/lib/api/http';
import { getAccessToken } from '@/lib/auth/token';

function toWsUrl(httpUrl: string) {
  if (httpUrl.startsWith('https://')) return httpUrl.replace('https://', 'wss://');
  if (httpUrl.startsWith('http://')) return httpUrl.replace('http://', 'ws://');
  return httpUrl;
}

export function getPresenceWsUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
  if (base) return `${toWsUrl(base.replace(/\/$/, ''))}/presence`;
  if (typeof window !== 'undefined') {
    return `${toWsUrl(window.location.origin)}/presence`;
  }
  return '';
}

export function buildPresenceWsUrl() {
  const base = getPresenceWsUrl();
  if (!base) return '';
  const token = getAccessToken();
  if (!token) return base;
  const qs = new URLSearchParams({ token });
  return `${base}?${qs.toString()}`;
}

export function pingPresence() {
  return apiPost<undefined, { ok: boolean }>('/presence/ping', undefined);
}
