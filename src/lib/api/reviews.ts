// src/lib/api/reviews.ts
import { apiGet, apiPost } from '@/lib/api/http';
import type { ReviewDto, ReviewOverviewDto, ReviewSummaryDto } from '@/lib/api/dto/reviews';

export type ReviewsSort = 'created_desc' | 'rating_desc';

type ReviewsOverviewQuery = {
  targetUserId: string;
  targetRole: 'client' | 'provider' | 'platform';
  limit?: number;
  offset?: number;
  sort?: ReviewsSort;
};

type MyReviewsQuery = {
  role?: 'all' | 'client' | 'provider';
  limit?: number;
  offset?: number;
};

type PlatformReviewsOverviewQuery = {
  limit?: number;
  offset?: number;
  sort?: ReviewsSort;
};

export type CreatePlatformReviewPayload = {
  rating: number;
  text?: string;
  authorName?: string;
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

function normalizeReviewSummary(input: Partial<ReviewSummaryDto>): ReviewSummaryDto {
  const distribution = {
    '1': Math.max(0, Math.floor(Number(input.distribution?.['1'] ?? 0) || 0)),
    '2': Math.max(0, Math.floor(Number(input.distribution?.['2'] ?? 0) || 0)),
    '3': Math.max(0, Math.floor(Number(input.distribution?.['3'] ?? 0) || 0)),
    '4': Math.max(0, Math.floor(Number(input.distribution?.['4'] ?? 0) || 0)),
    '5': Math.max(0, Math.floor(Number(input.distribution?.['5'] ?? 0) || 0)),
  } satisfies ReviewSummaryDto['distribution'];

  const total = Math.max(0, Math.floor(Number(input.total ?? 0) || 0));
  const averageRaw = Number(input.averageRating ?? 0);
  const averageRating = Number.isFinite(averageRaw) ? Math.max(0, Math.min(5, averageRaw)) : 0;

  return {
    targetUserId: String(input.targetUserId ?? ''),
    targetRole:
      input.targetRole === 'client' || input.targetRole === 'provider' || input.targetRole === 'platform'
        ? input.targetRole
        : null,
    total,
    averageRating,
    distribution,
  };
}

export async function getReviewsOverview(params: ReviewsOverviewQuery): Promise<ReviewOverviewDto> {
  const limit = normalizeLimit(params.limit) ?? 20;
  const offset = normalizeOffset(params.offset) ?? 0;
  const sort: ReviewsSort = params.sort === 'rating_desc' ? 'rating_desc' : 'created_desc';

  const qs = new URLSearchParams();
  qs.set('targetUserId', params.targetUserId);
  qs.set('targetRole', params.targetRole);
  qs.set('limit', String(limit));
  qs.set('offset', String(offset));
  qs.set('sort', sort);

  const response = await apiGet<Partial<ReviewOverviewDto>>(`/reviews/overview?${qs.toString()}`);
  const summary = normalizeReviewSummary({
    targetUserId: params.targetUserId,
    targetRole: params.targetRole,
    ...response.summary,
  });

  return {
    items: Array.isArray(response.items) ? response.items : [],
    total: Math.max(0, Math.floor(Number(response.total ?? summary.total) || 0)),
    limit: Math.max(1, Math.floor(Number(response.limit ?? limit) || limit)),
    offset: Math.max(0, Math.floor(Number(response.offset ?? offset) || offset)),
    summary: {
      total: summary.total,
      averageRating: summary.averageRating,
      distribution: summary.distribution,
    },
  };
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

export async function getPlatformReviewsOverview(
  params: PlatformReviewsOverviewQuery = {},
): Promise<ReviewOverviewDto> {
  const limit = normalizeLimit(params.limit) ?? 20;
  const offset = normalizeOffset(params.offset) ?? 0;
  const sort: ReviewsSort = params.sort === 'rating_desc' ? 'rating_desc' : 'created_desc';

  const qs = new URLSearchParams();
  qs.set('limit', String(limit));
  qs.set('offset', String(offset));
  qs.set('sort', sort);

  const response = await apiGet<Partial<ReviewOverviewDto>>(`/reviews/platform/overview?${qs.toString()}`);
  const summary = normalizeReviewSummary({
    targetUserId: 'platform',
    targetRole: 'platform',
    ...response.summary,
  });

  return {
    items: Array.isArray(response.items) ? response.items : [],
    total: Math.max(0, Math.floor(Number(response.total ?? summary.total) || 0)),
    limit: Math.max(1, Math.floor(Number(response.limit ?? limit) || limit)),
    offset: Math.max(0, Math.floor(Number(response.offset ?? offset) || offset)),
    summary: {
      total: summary.total,
      averageRating: summary.averageRating,
      distribution: summary.distribution,
    },
  };
}

export function createPlatformReview(payload: CreatePlatformReviewPayload) {
  return apiPost<CreatePlatformReviewPayload, ReviewDto>('/reviews/platform', payload);
}
