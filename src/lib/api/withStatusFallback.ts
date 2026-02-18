import { ApiError } from '@/lib/api/http-error';

type StatusErrorLike = {
  status?: number;
};

export function hasAnyStatus(error: unknown, statuses: readonly number[]): boolean {
  if (error instanceof ApiError) {
    return statuses.includes(error.status);
  }
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as StatusErrorLike).status ?? 0);
    return statuses.includes(status);
  }
  return false;
}

export async function withStatusFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  statuses: readonly number[] = [403, 404],
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (hasAnyStatus(error, statuses)) return fallback;
    throw error;
  }
}
