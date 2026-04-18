import { getServerEnv } from '@/lib/config/env.server';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function resolveBackendBaseUrl() {
  const env = getServerEnv();
  const configuredBase = env.API_BASE_URL ?? env.NEXT_PUBLIC_API_BASE;
  if (configuredBase) return trimTrailingSlash(configuredBase);
  if (env.NODE_ENV === 'development') return 'http://localhost:4000';
  throw new Error('API base URL is not configured');
}

export function buildBackendProxyUrl(pathname: string, search: string) {
  return `${resolveBackendBaseUrl()}${pathname}${search}`;
}

export function buildBackendRequestHeaders(source: Headers) {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

