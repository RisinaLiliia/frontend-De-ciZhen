// src/lib/api/reviews.ts
import { apiGet } from '@/lib/api/http';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import { isMockProviderId, listMockReviews } from '@/lib/api/reviews-mock';

type ReviewsQuery = {
  targetUserId: string;
  targetRole: 'client' | 'provider';
  limit?: number;
  offset?: number;
};

type MyReviewsQuery = {
  role?: 'all' | 'client' | 'provider';
  limit?: number;
  offset?: number;
};

function normalizeLimit(value: number | undefined) {
  if (value == null) return undefined;
  const int = Math.trunc(value);
  return Math.min(Math.max(int, 1), 100);
}

function normalizeOffset(value: number | undefined) {
  if (value == null) return undefined;
  const int = Math.trunc(value);
  return Math.max(int, 0);
}

export function listReviews(params: ReviewsQuery) {
  if (params.targetRole === 'provider' && isMockProviderId(params.targetUserId)) {
    return Promise.resolve(listMockReviews(params));
  }

  const limit = normalizeLimit(params.limit);
  const offset = normalizeOffset(params.offset);
  const qs = new URLSearchParams();
  qs.set('targetUserId', params.targetUserId);
  qs.set('targetRole', params.targetRole);
  if (limit != null) qs.set('limit', String(limit));
  if (offset != null) qs.set('offset', String(offset));
  return apiGet<ReviewDto[]>(`/reviews?${qs.toString()}`);
}

export function listMyReviews(params: MyReviewsQuery = {}) {
  const limit = normalizeLimit(params.limit);
  const offset = normalizeOffset(params.offset);
  const qs = new URLSearchParams();
  if (params.role) qs.set('role', params.role);
  if (limit != null) qs.set('limit', String(limit));
  if (offset != null) qs.set('offset', String(offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<ReviewDto[]>(`/reviews/my${suffix}`);
}
