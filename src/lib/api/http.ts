// src/lib/api/http.ts
import { ApiError, type HttpErrorDto } from './http-error';

export const API_URL = '/api';

function joinUrl(base: string, path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

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

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error('Missing NEXT_PUBLIC_API_URL');
  }

  const url = joinUrl(API_URL, path);

  const res = await fetch(url, {
    ...init,
    method: 'GET',
    headers: {
      ...(init?.headers ?? {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    const { message, data } = await parseError(res);
    throw new ApiError(message, res.status, data);
  }

  return (await res.json()) as T;
}

export async function apiPost<TReq, TRes>(
  path: string,
  body: TReq,
  init?: RequestInit,
): Promise<TRes> {
  if (!API_URL) {
    throw new Error('Missing NEXT_PUBLIC_API_URL');
  }

  const url = joinUrl(API_URL, path);

  const res = await fetch(url, {
    ...init,
    method: 'POST',
    headers: {
      ...(init?.headers ?? {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const { message, data } = await parseError(res);
    throw new ApiError(message, res.status, data);
  }

  return (await res.json()) as TRes;
}
