// src/lib/api/reviews.ts
import { apiGet } from '@/lib/api/http';
import type { ReviewDto } from '@/lib/api/dto/reviews';

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

export function listReviews(params: ReviewsQuery) {
  const qs = new URLSearchParams();
  qs.set('targetUserId', params.targetUserId);
  qs.set('targetRole', params.targetRole);
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));
  return apiGet<ReviewDto[]>(`/reviews?${qs.toString()}`);
}

export function listMyReviews(params: MyReviewsQuery = {}) {
  const qs = new URLSearchParams();
  if (params.role) qs.set('role', params.role);
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<ReviewDto[]>(`/reviews/my${suffix}`);
}
