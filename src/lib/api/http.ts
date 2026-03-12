// src/lib/api/http.ts
import { ApiError, type HttpErrorDto } from './http-error';
import { buildApiUrl } from './url';
import { getAccessToken, setAccessToken } from '@/lib/auth/token';
import { clearAuth } from '@/features/auth/store';
import { refreshAccessToken } from '@/lib/auth/session';

async function parseError(res: Response): Promise<{ message: string; data?: HttpErrorDto }> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = (await res.json().catch(() => undefined)) as HttpErrorDto | undefined;
    const msg =
      (Array.isArray(data?.message) ? data?.message.join(', ') : data?.message) ||
      data?.error ||
      `Request failed: ${res.status}`;
    return { message: msg, data };
  }
  const text = await res.text().catch(() => '');
  return { message: text || `Request failed: ${res.status}` };
}

type ApiInit = RequestInit & {
  skipAuthRefresh?: boolean;
};

function createRequestId(): string {
  const randomUuid =
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : null;
  if (randomUuid) return randomUuid;
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: ApiInit,
  retry = true,
  requestId = createRequestId(),
): Promise<T> {
  const url = buildApiUrl(path);
  const accessToken = getAccessToken();
  const headers = new Headers(init?.headers ?? undefined);

  if (!headers.has('x-request-id')) {
    headers.set('x-request-id', requestId);
  }
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    method,
    headers,
    credentials: 'include',
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (res.status === 401 && retry && !init?.skipAuthRefresh && Boolean(accessToken)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      setAccessToken(refreshed);
      return apiRequest<T>(method, path, body, init, false, requestId);
    }
    setAccessToken(null);
    clearAuth();
  }

  if (!res.ok) {
    const { message, data } = await parseError(res);
    throw new ApiError(message, res.status, data);
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const contentLength = res.headers.get('content-length');
  if (contentLength === '0') {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  const text = await res.text();
  return (text || undefined) as T;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return apiRequest<T>('GET', path, undefined, { ...init, cache: 'no-store' });
}

export async function apiPost<TReq, TRes>(
  path: string,
  body?: TReq,
  init?: ApiInit,
): Promise<TRes> {
  return apiRequest<TRes>('POST', path, body, init);
}

export async function apiPostForm<TRes>(path: string, body: FormData, init?: ApiInit) {
  return apiRequest<TRes>('POST', path, body, init);
}

export async function apiPatch<TReq, TRes>(
  path: string,
  body?: TReq,
  init?: ApiInit,
): Promise<TRes> {
  return apiRequest<TRes>('PATCH', path, body, init);
}

export async function apiDelete<TRes>(path: string, init?: ApiInit): Promise<TRes> {
  return apiRequest<TRes>('DELETE', path, undefined, init);
}
