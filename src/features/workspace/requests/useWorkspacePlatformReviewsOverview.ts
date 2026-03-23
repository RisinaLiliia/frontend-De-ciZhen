'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getPlatformReviewsOverview } from '@/lib/api/reviews';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type {
  NormalizedProviderReview,
  ProviderReviewsDistribution,
} from '@/features/providers/publicProfile/useProviderReviewsModel';
import { useWorkspaceReviewControlsState } from '@/features/workspace/requests/useWorkspaceReviewControlsState';

const EMPTY_PLATFORM_OVERVIEW = {
  items: [] as Array<{
    id: string;
    rating?: number | null;
    text?: string | null;
    comment?: string | null;
    createdAt?: string | null;
    authorName?: string | null;
  }>,
  total: 0,
  limit: 1,
  offset: 0,
  summary: {
    total: 0,
    averageRating: 0,
    distribution: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    },
  },
};

function clampRating(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(1, Math.min(5, Math.round(value)));
}

function toNormalizedReview(
  item: {
    id: string;
    rating?: number | null;
    text?: string | null;
    comment?: string | null;
    createdAt?: string | null;
    authorName?: string | null;
  },
  fallbackAuthor: string,
  fallbackText: string,
) {
  const rawRating = Number(item.rating ?? 0);
  const text = item.text?.trim() || item.comment?.trim() || fallbackText;
  const createdAtRaw = item.createdAt ? new Date(item.createdAt) : null;
  const createdAtTs =
    createdAtRaw && Number.isFinite(createdAtRaw.getTime()) ? createdAtRaw.getTime() : null;

  return {
    id: item.id,
    rating: clampRating(rawRating),
    text,
    authorName: item.authorName?.trim() || fallbackAuthor,
    createdAtTs,
  } satisfies NormalizedProviderReview;
}

export function useWorkspacePlatformReviewsOverview({
  t,
  page,
  limit,
}: {
  t: (key: I18nKey) => string;
  page: number;
  limit: number;
}) {
  const { reviewSort, reviewRange } = useWorkspaceReviewControlsState();
  const reviewsOffset = (page - 1) * limit;
  const sortValue = reviewSort === 'top' ? 'rating_desc' : 'created_desc';

  const platformQuery = useQuery({
    queryKey: ['platform-reviews-overview', sortValue, reviewRange, page, limit],
    queryFn: () =>
      withStatusFallback(
        () =>
          getPlatformReviewsOverview({
            limit,
            offset: reviewsOffset,
            sort: sortValue,
            range: reviewRange,
          }),
        {
          ...EMPTY_PLATFORM_OVERVIEW,
          limit,
          offset: reviewsOffset,
        },
        [400, 404],
      ),
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const visibleReviews = React.useMemo<NormalizedProviderReview[]>(
    () =>
      (platformQuery.data?.items ?? []).map((item) =>
        toNormalizedReview(
          item,
          t(I18N_KEYS.requestsPage.platformReviewAnonymous),
          t(I18N_KEYS.requestsPage.platformReviewNoText),
        )),
    [platformQuery.data?.items, t],
  );

  const displayRatingCount = React.useMemo(() => {
    const summaryTotal = Number(platformQuery.data?.summary.total ?? 0);
    return Number.isFinite(summaryTotal) && summaryTotal >= 0 ? Math.floor(summaryTotal) : 0;
  }, [platformQuery.data?.summary.total]);

  const displayRatingAvg = React.useMemo(() => {
    const summaryAvg = Number(platformQuery.data?.summary.averageRating ?? 0);
    return Number.isFinite(summaryAvg) && summaryAvg >= 0 ? summaryAvg : 0;
  }, [platformQuery.data?.summary.averageRating]);

  const reviewsDistribution: ProviderReviewsDistribution = React.useMemo(() => {
    const stats = new Map<number, number>();
    for (let score = 1; score <= 5; score += 1) stats.set(score, 0);
    const distribution = platformQuery.data?.summary.distribution;
    for (let score = 1; score <= 5; score += 1) {
      const key = String(score) as '1' | '2' | '3' | '4' | '5';
      const count = Number(distribution?.[key] ?? 0);
      stats.set(score, Number.isFinite(count) && count > 0 ? Math.floor(count) : 0);
    }
    return { stats, max: Math.max(1, ...Array.from(stats.values())) };
  }, [platformQuery.data?.summary.distribution]);

  const totalPages = Math.max(1, Math.ceil(displayRatingCount / limit));
  const isLoading = platformQuery.isLoading && visibleReviews.length === 0;

  return {
    reviewSort,
    reviewRange,
    visibleReviews,
    displayRatingAvg,
    displayRatingCount,
    reviewsDistribution,
    totalPages,
    isLoading,
    isPending: platformQuery.isFetching,
  };
}
