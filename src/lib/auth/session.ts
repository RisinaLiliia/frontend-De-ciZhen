// src/lib/auth/session.ts
import { buildApiUrl } from '@/lib/api/url';
import type { RefreshResponseDto } from '@/lib/api/dto/auth';

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(buildApiUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) return null;

      const data = (await res.json()) as RefreshResponseDto;
      if (!data?.accessToken) return null;
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
