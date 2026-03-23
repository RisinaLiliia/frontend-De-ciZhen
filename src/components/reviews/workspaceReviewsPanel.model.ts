'use client';

import type { Option } from '@/components/ui/Select';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type {
  NormalizedProviderReview,
  ProviderReviewSort,
  ProviderReviewsDistribution,
  ProviderReviewsUi,
} from '@/features/providers/publicProfile/useProviderReviewsModel';

type Translate = (key: I18nKey) => string;

type ReviewLike = Pick<
  ReviewDto,
  'id' | 'rating' | 'text' | 'comment' | 'createdAt' | 'authorName'
>;

type ReviewDistributionLike = Partial<Record<'1' | '2' | '3' | '4' | '5', number>>;

type BookingLike = {
  id: string;
  requestId: string;
  startAt: string;
};

type ReviewableRequestLike = {
  id: string;
  title?: string | null;
  cityName?: string | null;
};

type BuildReviewableBookingOptionsArgs = {
  bookings: BookingLike[];
  reviewableRequestById: ReadonlyMap<string, { title?: string | null; cityName?: string | null }>;
  bookingDateFormatter: Intl.DateTimeFormat;
  t: Translate;
};

export function clampWorkspaceReviewRating(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function toNormalizedWorkspaceReview(
  item: ReviewLike,
  fallbackAuthor: string,
  fallbackText: string,
): NormalizedProviderReview {
  const rawRating = Number(item.rating ?? 0);
  const text = item.text?.trim() || item.comment?.trim() || fallbackText;
  const createdAtRaw = item.createdAt ? new Date(item.createdAt) : null;
  const createdAtTs =
    createdAtRaw && Number.isFinite(createdAtRaw.getTime()) ? createdAtRaw.getTime() : null;

  return {
    id: item.id,
    rating: clampWorkspaceReviewRating(rawRating),
    text,
    authorName: item.authorName?.trim() || fallbackAuthor,
    createdAtTs,
  };
}

export function buildWorkspaceReviewDistribution(
  items: NormalizedProviderReview[],
): ProviderReviewsDistribution {
  const stats = new Map<number, number>();
  for (let score = 1; score <= 5; score += 1) stats.set(score, 0);
  items.forEach((item) => {
    const score = clampWorkspaceReviewRating(item.rating);
    stats.set(score, (stats.get(score) ?? 0) + 1);
  });
  return { stats, max: Math.max(1, ...Array.from(stats.values())) };
}

export function buildWorkspacePlatformReviewDistribution(
  distribution: ReviewDistributionLike | null | undefined,
): ProviderReviewsDistribution {
  const stats = new Map<number, number>();
  for (let score = 1; score <= 5; score += 1) {
    const key = String(score) as keyof ReviewDistributionLike;
    const count = Number(distribution?.[key] ?? 0);
    stats.set(score, Number.isFinite(count) && count > 0 ? Math.floor(count) : 0);
  }
  return { stats, max: Math.max(1, ...Array.from(stats.values())) };
}

export function buildWorkspaceReviewsUi(locale: Locale, t: Translate): ProviderReviewsUi {
  if (locale === 'de') {
    return {
      sortLatest: 'Neueste',
      sortTop: 'Top bewertet',
      noText: t(I18N_KEYS.requestsPage.platformReviewNoText),
      basedOn: t(I18N_KEYS.requestsPage.platformReviewBasedOn),
      ratingsLabel: t(I18N_KEYS.homePublic.reviews),
      expandAbout: '',
      collapseAbout: '',
    };
  }

  return {
    sortLatest: 'Latest',
    sortTop: 'Top rated',
    noText: t(I18N_KEYS.requestsPage.platformReviewNoText),
    basedOn: t(I18N_KEYS.requestsPage.platformReviewBasedOn),
    ratingsLabel: t(I18N_KEYS.homePublic.reviews),
    expandAbout: '',
    collapseAbout: '',
  };
}

export function buildWorkspaceLocaleTag(locale: Locale) {
  return locale === 'de' ? 'de-DE' : 'en-US';
}

export function buildWorkspaceReviewableRequestById(requests: ReviewableRequestLike[]) {
  const map = new Map<string, { title?: string | null; cityName?: string | null }>();
  requests.forEach((requestItem) => {
    map.set(requestItem.id, {
      title: requestItem.title ?? null,
      cityName: requestItem.cityName ?? null,
    });
  });
  return map;
}

export function buildWorkspaceReviewableBookingOptions({
  bookings,
  reviewableRequestById,
  bookingDateFormatter,
  t,
}: BuildReviewableBookingOptionsArgs): Option[] {
  return bookings
    .slice()
    .sort((a, b) => {
      const aTs = new Date(a.startAt).getTime();
      const bTs = new Date(b.startAt).getTime();
      return (Number.isFinite(bTs) ? bTs : 0) - (Number.isFinite(aTs) ? aTs : 0);
    })
    .map((bookingItem) => {
      const requestInfo = reviewableRequestById.get(bookingItem.requestId);
      const requestTitle =
        requestInfo?.title?.trim() || t(I18N_KEYS.requestsPage.userReviewFormWorkFallback);
      const cityLabel = requestInfo?.cityName?.trim() || '';
      const bookingDateRaw = new Date(bookingItem.startAt);
      const bookingDateLabel = Number.isFinite(bookingDateRaw.getTime())
        ? bookingDateFormatter.format(bookingDateRaw)
        : '';
      const meta = [cityLabel, bookingDateLabel].filter((item) => item.length > 0).join(' · ');
      return {
        value: bookingItem.id,
        label: meta.length > 0 ? `${requestTitle} · ${meta}` : requestTitle,
      };
    });
}

export function buildWorkspacePlatformReviews(items: ReviewLike[], t: Translate) {
  return items.map((item) =>
    toNormalizedWorkspaceReview(
      item,
      t(I18N_KEYS.requestsPage.platformReviewAnonymous),
      t(I18N_KEYS.requestsPage.platformReviewNoText),
    ));
}

export function buildWorkspaceSortedUserReviews(
  items: ReviewLike[],
  reviewSort: ProviderReviewSort,
  t: Translate,
) {
  const mapped = items.map((item) =>
    toNormalizedWorkspaceReview(
      item,
      t(I18N_KEYS.requestsPage.navUserFallback),
      t(I18N_KEYS.requestsPage.platformReviewNoText),
    ));

  return mapped.sort((a, b) => {
    if (reviewSort === 'top' && b.rating !== a.rating) return b.rating - a.rating;
    return (b.createdAtTs ?? 0) - (a.createdAtTs ?? 0);
  });
}

export function buildWorkspaceReviewsAverage(params: {
  source: 'platform' | 'user';
  platformAverageRating: number | null | undefined;
  userReviews: NormalizedProviderReview[];
}) {
  if (params.source === 'platform') {
    const summaryAvg = Number(params.platformAverageRating ?? 0);
    return Number.isFinite(summaryAvg) && summaryAvg >= 0 ? summaryAvg : 0;
  }
  if (params.userReviews.length === 0) return 0;
  const sum = params.userReviews.reduce((acc, item) => acc + item.rating, 0);
  return sum / params.userReviews.length;
}

export function buildWorkspaceReviewsCount(params: {
  source: 'platform' | 'user';
  platformTotal: number | null | undefined;
  userReviewsCount: number;
}) {
  if (params.source === 'platform') {
    const summaryTotal = Number(params.platformTotal ?? 0);
    return Number.isFinite(summaryTotal) && summaryTotal >= 0 ? Math.floor(summaryTotal) : 0;
  }
  return params.userReviewsCount;
}

export function resolveWorkspaceReviewableBookingsLoading(params: {
  source: 'platform' | 'user';
  userCompletedBookingsLoading: boolean;
  reviewableRequestIdsCount: number;
  reviewableRequestsLoading: boolean;
}) {
  return (
    params.source === 'user' &&
    (params.userCompletedBookingsLoading ||
      (params.reviewableRequestIdsCount > 0 && params.reviewableRequestsLoading))
  );
}

export function resolveWorkspaceUserSubmitDisabled(params: {
  isPending: boolean;
  isAuthenticated: boolean;
  reviewableBookingOptionsLength: number;
  draftBookingId: string;
}) {
  return (
    params.isPending ||
    !params.isAuthenticated ||
    params.reviewableBookingOptionsLength === 0 ||
    params.draftBookingId.trim().length === 0
  );
}

export function resolveWorkspaceUserReviewMutationErrorKey(message: string): I18nKey {
  if (message === 'booking-required') return I18N_KEYS.requestsPage.userReviewFormBookingRequired;
  if (message === 'role-unsupported') return I18N_KEYS.requestsPage.userReviewFormRoleUnsupported;
  return I18N_KEYS.requestsPage.userReviewFormError;
}
