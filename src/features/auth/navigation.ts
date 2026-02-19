import { DEFAULT_AUTH_NEXT } from '@/features/auth/constants';

export function resolveSafeNext(rawNext: string | null | undefined): string {
  const value = (rawNext ?? '').trim();
  if (!value) return DEFAULT_AUTH_NEXT;

  // Only allow internal paths to prevent open-redirects.
  if (value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  return DEFAULT_AUTH_NEXT;
}
