import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getReviewsOverview } from '@/lib/api/reviews';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { withStatusFallback } from '@/lib/api/withStatusFallback';

const PROVIDER_REVIEWS_PAGE_SIZE = 4;
const EMPTY_REVIEWS_OVERVIEW = {
  items: [] as ReviewDto[],
  total: 0,
  limit: PROVIDER_REVIEWS_PAGE_SIZE,
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

type Translate = (key: I18nKey) => string;

type UseProviderReviewsModelParams = {
  providerId?: string | null;
  providerTargetUserId: string | null;
  providerRatingAvg?: number | null;
  providerRatingCount?: number | null;
  locale: Locale;
  t: Translate;
};

type NormalizedReview = {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  createdAtTs: number | null;
};

export function useProviderReviewsModel({
  providerId,
  providerTargetUserId,
  providerRatingAvg,
  providerRatingCount,
  locale,
  t,
}: UseProviderReviewsModelParams) {
  const [reviewSort, setReviewSort] = React.useState<'latest' | 'top'>('latest');
  const [reviewPage, setReviewPage] = React.useState(1);

  React.useEffect(() => {
    setReviewPage(1);
  }, [providerId, reviewSort]);

  const reviewsOffset = (reviewPage - 1) * PROVIDER_REVIEWS_PAGE_SIZE;
  const reviewsSortValue = reviewSort === 'top' ? 'rating_desc' : 'created_desc';

  const reviewsOverviewQuery = useQuery({
    queryKey: ['provider-reviews-overview', providerTargetUserId, reviewsSortValue, reviewPage],
    enabled: Boolean(providerTargetUserId),
    queryFn: () =>
      withStatusFallback(
        () =>
          getReviewsOverview({
            targetUserId: String(providerTargetUserId),
            targetRole: 'provider',
            limit: PROVIDER_REVIEWS_PAGE_SIZE,
            offset: reviewsOffset,
            sort: reviewsSortValue,
          }),
        EMPTY_REVIEWS_OVERVIEW,
        [400, 404],
      ),
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const reviewsUi = locale === 'de'
    ? {
        sortLatest: 'Neueste',
        sortTop: 'Top bewertet',
        noText: 'Kein Kommentar hinterlassen.',
        basedOn: 'aus',
        ratingsLabel: 'Bewertungen',
        expandAbout: 'Mehr lesen',
        collapseAbout: 'Weniger anzeigen',
      }
    : {
        sortLatest: 'Latest',
        sortTop: 'Top rated',
        noText: 'No text provided.',
        basedOn: 'from',
        ratingsLabel: 'ratings',
        expandAbout: 'Read more',
        collapseAbout: 'Show less',
      };

  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const reviewDateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [localeTag],
  );

  const normalizeReviews = React.useCallback(
    (rows: ReviewDto[]): NormalizedReview[] =>
      rows.map((item) => {
        const rawRating = Number(item.rating ?? 0);
        const rating = Number.isFinite(rawRating) ? Math.max(1, Math.min(5, Math.round(rawRating))) : 0;
        const text = item.text?.trim() || item.comment?.trim() || '';
        const createdAtRaw = item.createdAt ? new Date(item.createdAt) : null;
        const createdAtTs =
          createdAtRaw && Number.isFinite(createdAtRaw.getTime()) ? createdAtRaw.getTime() : null;
        return {
          id: item.id,
          rating,
          text,
          authorName: item.authorName?.trim() || t(I18N_KEYS.provider.unnamed),
          createdAtTs,
        };
      }),
    [t],
  );

  const pageReviews = React.useMemo(
    () => normalizeReviews(reviewsOverviewQuery.data?.items ?? []),
    [normalizeReviews, reviewsOverviewQuery.data?.items],
  );
  const fallbackReviewsAverage = React.useMemo(() => {
    if (pageReviews.length === 0) return 0;
    const sum = pageReviews.reduce((acc, item) => acc + item.rating, 0);
    return Math.round((sum / pageReviews.length) * 10) / 10;
  }, [pageReviews]);
  const displayRatingAvg = React.useMemo(() => {
    const raw = Number(providerRatingAvg);
    if (Number.isFinite(raw) && raw >= 0) return raw;
    const summaryAvg = Number(reviewsOverviewQuery.data?.summary?.averageRating);
    if (Number.isFinite(summaryAvg) && summaryAvg >= 0) return summaryAvg;
    return fallbackReviewsAverage;
  }, [fallbackReviewsAverage, providerRatingAvg, reviewsOverviewQuery.data?.summary?.averageRating]);
  const displayRatingCount = (() => {
    const raw = Number(providerRatingCount);
    if (Number.isFinite(raw) && raw >= 0) return Math.round(raw);
    const summaryTotal = Number(reviewsOverviewQuery.data?.summary?.total);
    if (Number.isFinite(summaryTotal) && summaryTotal >= 0) return Math.round(summaryTotal);
    if (typeof reviewsOverviewQuery.data?.total === 'number') return Math.round(reviewsOverviewQuery.data.total);
    return pageReviews.length;
  })();
  const hasRecentReview = displayRatingCount > 0;
  const reviewsDistribution = React.useMemo(() => {
    const stats = new Map<number, number>();
    for (let score = 1; score <= 5; score += 1) stats.set(score, 0);
    const summary = reviewsOverviewQuery.data?.summary?.distribution;
    if (summary) {
      for (let score = 1; score <= 5; score += 1) {
        const key = String(score) as '1' | '2' | '3' | '4' | '5';
        const count = Number(summary[key] ?? 0);
        stats.set(score, Number.isFinite(count) && count > 0 ? Math.floor(count) : 0);
      }
    } else {
      for (const item of pageReviews) {
        stats.set(item.rating, (stats.get(item.rating) ?? 0) + 1);
      }
    }
    const max = Math.max(1, ...Array.from(stats.values()));
    return { stats, max };
  }, [pageReviews, reviewsOverviewQuery.data?.summary?.distribution]);
  const visibleReviews = React.useMemo(() => {
    const list = [...pageReviews];
    if (reviewSort === 'top') {
      list.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        const aTs = a.createdAtTs ?? 0;
        const bTs = b.createdAtTs ?? 0;
        return bTs - aTs;
      });
    }
    return list;
  }, [pageReviews, reviewSort]);
  const reviewsTotalForPagination = (() => {
    if (typeof reviewsOverviewQuery.data?.total === 'number') return Math.max(0, Math.floor(reviewsOverviewQuery.data.total));
    const summaryTotal = Number(reviewsOverviewQuery.data?.summary?.total);
    if (Number.isFinite(summaryTotal) && summaryTotal >= 0) return Math.max(0, Math.floor(summaryTotal));
    const raw = Number(providerRatingCount);
    if (Number.isFinite(raw) && raw >= 0) return Math.max(0, Math.floor(raw));
    return pageReviews.length;
  })();
  const totalReviewPages = React.useMemo(
    () => Math.max(1, Math.ceil(reviewsTotalForPagination / PROVIDER_REVIEWS_PAGE_SIZE)),
    [reviewsTotalForPagination],
  );

  React.useEffect(() => {
    setReviewPage((prev) => Math.min(prev, totalReviewPages));
  }, [totalReviewPages]);

  const isReviewsLoading = reviewsOverviewQuery.isLoading && visibleReviews.length === 0;
  const hasReviewsPagination = reviewsTotalForPagination > PROVIDER_REVIEWS_PAGE_SIZE;

  return {
    reviewSort,
    setReviewSort,
    reviewPage,
    setReviewPage,
    reviewsUi,
    reviewDateFormatter,
    displayRatingAvg,
    displayRatingCount,
    hasRecentReview,
    reviewsDistribution,
    visibleReviews,
    reviewsTotalForPagination,
    totalReviewPages,
    isReviewsLoading,
    hasReviewsPagination,
  };
}
