// src/lib/api/reviews.ts
import { apiGet } from '@/lib/api/http';
import type { ReviewDto } from '@/lib/api/dto/reviews';

type ReviewsQuery = {
  targetUserId: string;
  targetRole: 'client' | 'provider';
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
