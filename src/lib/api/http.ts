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

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: ApiInit,
  retry = true,
): Promise<T> {
  const url = buildApiUrl(path);
  const accessToken = getAccessToken();

  const res = await fetch(url, {
    ...init,
    method,
    headers: {
      ...(init?.headers ?? {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && retry && !init?.skipAuthRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      setAccessToken(refreshed);
      return apiRequest<T>(method, path, body, init, false);
    }
    setAccessToken(null);
    clearAuth();
  }

  if (!res.ok) {
    const { message, data } = await parseError(res);
    throw new ApiError(message, res.status, data);
  }

  return (await res.json()) as T;
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

export async function apiPatch<TReq, TRes>(
  path: string,
  body?: TReq,
  init?: ApiInit,
): Promise<TRes> {
  return apiRequest<TRes>('PATCH', path, body, init);
}
