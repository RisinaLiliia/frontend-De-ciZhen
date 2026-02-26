// src/lib/api/reviews.ts
import { apiGet } from '@/lib/api/http';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import { isMockProviderId, listMockReviewsPage } from '@/lib/api/reviews-mock';

export type ReviewsSort = 'created_desc' | 'rating_desc';

type ReviewsQuery = {
  targetUserId: string;
  targetRole: 'client' | 'provider';
  limit?: number;
  offset?: number;
  sort?: ReviewsSort;
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

type ReviewsPageResponseDto = {
  items: ReviewDto[];
  total?: number | null;
  page?: number | null;
  limit?: number | null;
  offset?: number | null;
};

export type ReviewsPageResult = {
  items: ReviewDto[];
  total: number | null;
  limit: number;
  offset: number;
};

export async function listReviewsPage(params: ReviewsQuery): Promise<ReviewsPageResult> {
  const limit = normalizeLimit(params.limit) ?? 20;
  const offset = normalizeOffset(params.offset) ?? 0;

  if (params.targetRole === 'provider' && isMockProviderId(params.targetUserId)) {
    return Promise.resolve(listMockReviewsPage({ ...params, limit, offset }));
  }

  const qs = new URLSearchParams();
  qs.set('targetUserId', params.targetUserId);
  qs.set('targetRole', params.targetRole);
  qs.set('limit', String(limit));
  qs.set('offset', String(offset));
  if (params.sort) qs.set('sort', params.sort);

  const response = await apiGet<ReviewDto[] | ReviewsPageResponseDto>(`/reviews?${qs.toString()}`);
  if (Array.isArray(response)) {
    return {
      items: response,
      total: null,
      limit,
      offset,
    };
  }

  return {
    items: Array.isArray(response.items) ? response.items : [],
    total: typeof response.total === 'number' ? Math.max(0, Math.floor(response.total)) : null,
    limit: typeof response.limit === 'number' ? Math.max(1, Math.floor(response.limit)) : limit,
    offset: typeof response.offset === 'number' ? Math.max(0, Math.floor(response.offset)) : offset,
  };
}

export async function listReviews(params: ReviewsQuery) {
  const page = await listReviewsPage(params);
  return page.items;
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
