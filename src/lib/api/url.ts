// src/lib/api/url.ts
export const API_URL = '/api';

export function joinUrl(base: string, path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function buildApiUrl(path: string) {
  return joinUrl(API_URL, path);
}
