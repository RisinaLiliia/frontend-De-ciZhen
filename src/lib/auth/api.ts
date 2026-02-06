// src/lib/auth/api.ts
import { ApiError, type HttpErrorDto } from '@/lib/api/http-error';
import { buildApiUrl } from '@/lib/api/url';
import { getAccessToken } from '@/lib/auth/token';
import type {
  AuthResponseDto,
  LoginDto,
  LogoutResponseDto,
  MeResponseDto,
  RegisterDto,
} from '@/lib/api/dto/auth';

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

async function authPost<TReq, TRes>(path: string, body?: TReq): Promise<TRes> {
  const res = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const { message, data } = await parseError(res);
    throw new ApiError(message, res.status, data);
  }

  return (await res.json()) as TRes;
}

async function authGet<TRes>(path: string): Promise<TRes> {
  const token = getAccessToken();
  const res = await fetch(buildApiUrl(path), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    const { message, data } = await parseError(res);
    throw new ApiError(message, res.status, data);
  }

  return (await res.json()) as TRes;
}

export function login(payload: LoginDto) {
  return authPost<LoginDto, AuthResponseDto>('/auth/login', payload);
}

export function register(payload: RegisterDto) {
  return authPost<RegisterDto, AuthResponseDto>('/auth/register', payload);
}

export function logout() {
  return authPost<void, LogoutResponseDto>('/auth/logout');
}

export function getMe() {
  return authGet<MeResponseDto>('/users/me');
}
