'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ProviderReviewsSection } from '@/features/providers/publicProfile/ProviderReviewsSection';
import type {
  NormalizedProviderReview,
  ProviderReviewSort,
  ProviderReviewsDistribution,
  ProviderReviewsUi,
} from '@/features/providers/publicProfile/useProviderReviewsModel';
import { listAllMyBookings } from '@/lib/api/bookings';
import {
  createClientReview,
  createPlatformReview,
  createProviderReview,
  getPlatformReviewsOverview,
} from '@/lib/api/reviews';
import { getWorkspacePublicRequestsBatch } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { Input } from '@/components/ui/Input';
import { Select, type Option } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { ReviewDto } from '@/lib/api/dto/reviews';

type Translate = (key: I18nKey) => string;

const REVIEWS_PAGE_SIZE = 6;
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
  limit: REVIEWS_PAGE_SIZE,
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

type WorkspaceReviewsPanelProps = {
  t: Translate;
  source: 'platform' | 'user';
  locale?: Locale;
  userReviews?: ReviewDto[];
  isUserReviewsLoading?: boolean;
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

function buildDistributionFromReviews(items: NormalizedProviderReview[]): ProviderReviewsDistribution {
  const stats = new Map<number, number>();
  for (let score = 1; score <= 5; score += 1) stats.set(score, 0);
  items.forEach((item) => {
    const score = clampRating(item.rating);
    stats.set(score, (stats.get(score) ?? 0) + 1);
  });
  return { stats, max: Math.max(1, ...Array.from(stats.values())) };
}

export function WorkspaceReviewsPanel({
  t,
  source,
  locale,
  userReviews = [],
  isUserReviewsLoading = false,
}: WorkspaceReviewsPanelProps) {
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const queryClient = useQueryClient();
  const { locale: i18nLocale } = useI18n();
  const resolvedLocale = locale ?? i18nLocale;
  const isAuthenticated = authStatus === 'authenticated';

  const [reviewSort, setReviewSort] = React.useState<ProviderReviewSort>('latest');
  const [reviewPage, setReviewPage] = React.useState(1);
  const [draftRating, setDraftRating] = React.useState(5);
  const [draftText, setDraftText] = React.useState('');
  const [draftAuthorName, setDraftAuthorName] = React.useState('');
  const [draftBookingId, setDraftBookingId] = React.useState('');

  React.useEffect(() => {
    setReviewPage(1);
  }, [reviewSort, source]);

  const reviewsOffset = (reviewPage - 1) * REVIEWS_PAGE_SIZE;
  const sortValue = reviewSort === 'top' ? 'rating_desc' : 'created_desc';

  const platformQuery = useQuery({
    queryKey: ['platform-reviews-overview', sortValue, reviewPage],
    enabled: source === 'platform',
    queryFn: () =>
      withStatusFallback(
        () =>
          getPlatformReviewsOverview({
            limit: REVIEWS_PAGE_SIZE,
            offset: reviewsOffset,
            sort: sortValue,
          }),
        EMPTY_PLATFORM_OVERVIEW,
        [400, 404],
      ),
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const userCompletedBookingsQuery = useQuery({
    queryKey: ['bookings-my-reviewable'],
    enabled: source === 'user' && isAuthenticated,
    queryFn: () =>
      withStatusFallback(
        () =>
          listAllMyBookings({
            status: 'completed',
            pageLimit: 100,
            maxPages: 25,
          }),
        [],
        [400, 404],
      ),
    staleTime: 60_000,
  });

  const reviewableRequestIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          (userCompletedBookingsQuery.data ?? [])
            .map((booking) => String(booking.requestId ?? '').trim())
            .filter((id) => id.length > 0),
        ),
      ),
    [userCompletedBookingsQuery.data],
  );

  const reviewableRequestsQuery = useQuery({
    queryKey: ['workspace-review-booking-requests', reviewableRequestIds],
    enabled: source === 'user' && isAuthenticated && reviewableRequestIds.length > 0,
    queryFn: () =>
      withStatusFallback(
        () => getWorkspacePublicRequestsBatch(reviewableRequestIds),
        { items: [], missingIds: [] },
        [400, 404],
      ),
    staleTime: 60_000,
  });

  const platformReviews = React.useMemo<NormalizedProviderReview[]>(
    () =>
      (platformQuery.data?.items ?? []).map((item) =>
        toNormalizedReview(item, t(I18N_KEYS.requestsPage.platformReviewAnonymous), t(I18N_KEYS.requestsPage.platformReviewNoText))),
    [platformQuery.data?.items, t],
  );

  const sortedUserReviews = React.useMemo<NormalizedProviderReview[]>(
    () => {
      const mapped = userReviews.map((item) =>
        toNormalizedReview(item, t(I18N_KEYS.requestsPage.navUserFallback), t(I18N_KEYS.requestsPage.platformReviewNoText)));

      return mapped.sort((a, b) => {
        if (reviewSort === 'top') {
          if (b.rating !== a.rating) return b.rating - a.rating;
        }
        return (b.createdAtTs ?? 0) - (a.createdAtTs ?? 0);
      });
    },
    [reviewSort, t, userReviews],
  );

  const visibleUserReviews = React.useMemo(
    () => sortedUserReviews.slice(reviewsOffset, reviewsOffset + REVIEWS_PAGE_SIZE),
    [reviewsOffset, sortedUserReviews],
  );

  const visibleReviews = source === 'platform' ? platformReviews : visibleUserReviews;

  const displayRatingAvg = React.useMemo(() => {
    if (source === 'platform') {
      const summaryAvg = Number(platformQuery.data?.summary.averageRating ?? 0);
      return Number.isFinite(summaryAvg) && summaryAvg >= 0 ? summaryAvg : 0;
    }
    if (sortedUserReviews.length === 0) return 0;
    const sum = sortedUserReviews.reduce((acc, item) => acc + item.rating, 0);
    return sum / sortedUserReviews.length;
  }, [platformQuery.data?.summary.averageRating, sortedUserReviews, source]);

  const displayRatingCount = React.useMemo(() => {
    if (source === 'platform') {
      const summaryTotal = Number(platformQuery.data?.summary.total ?? 0);
      return Number.isFinite(summaryTotal) && summaryTotal >= 0 ? Math.floor(summaryTotal) : 0;
    }
    return sortedUserReviews.length;
  }, [platformQuery.data?.summary.total, sortedUserReviews.length, source]);

  const reviewsDistribution: ProviderReviewsDistribution = React.useMemo(() => {
    if (source === 'platform') {
      const stats = new Map<number, number>();
      for (let score = 1; score <= 5; score += 1) stats.set(score, 0);
      const distribution = platformQuery.data?.summary.distribution;
      for (let score = 1; score <= 5; score += 1) {
        const key = String(score) as '1' | '2' | '3' | '4' | '5';
        const count = Number(distribution?.[key] ?? 0);
        stats.set(score, Number.isFinite(count) && count > 0 ? Math.floor(count) : 0);
      }
      return { stats, max: Math.max(1, ...Array.from(stats.values())) };
    }
    return buildDistributionFromReviews(sortedUserReviews);
  }, [platformQuery.data?.summary, sortedUserReviews, source]);

  const hasReviewsPagination = displayRatingCount > REVIEWS_PAGE_SIZE;
  const totalReviewPages = Math.max(1, Math.ceil(displayRatingCount / REVIEWS_PAGE_SIZE));

  React.useEffect(() => {
    setReviewPage((prev) => Math.min(prev, totalReviewPages));
  }, [totalReviewPages]);

  const reviewsUi: ProviderReviewsUi = resolvedLocale === 'de'
    ? {
        sortLatest: 'Neueste',
        sortTop: 'Top bewertet',
        noText: t(I18N_KEYS.requestsPage.platformReviewNoText),
        basedOn: t(I18N_KEYS.requestsPage.platformReviewBasedOn),
        ratingsLabel: t(I18N_KEYS.homePublic.reviews),
        expandAbout: '',
        collapseAbout: '',
      }
    : {
        sortLatest: 'Latest',
        sortTop: 'Top rated',
        noText: t(I18N_KEYS.requestsPage.platformReviewNoText),
        basedOn: t(I18N_KEYS.requestsPage.platformReviewBasedOn),
        ratingsLabel: t(I18N_KEYS.homePublic.reviews),
        expandAbout: '',
        collapseAbout: '',
      };

  const localeTag = resolvedLocale === 'de' ? 'de-DE' : 'en-US';
  const reviewDateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [localeTag],
  );
  const bookingDateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [localeTag],
  );

  const reviewableRequestById = React.useMemo(() => {
    const map = new Map<string, { title?: string | null; cityName?: string | null }>();
    (reviewableRequestsQuery.data?.items ?? []).forEach((requestItem) => {
      map.set(requestItem.id, {
        title: requestItem.title ?? null,
        cityName: requestItem.cityName ?? null,
      });
    });
    return map;
  }, [reviewableRequestsQuery.data?.items]);

  const reviewableBookingOptions = React.useMemo<Option[]>(
    () =>
      (userCompletedBookingsQuery.data ?? [])
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
        }),
    [bookingDateFormatter, reviewableRequestById, t, userCompletedBookingsQuery.data],
  );

  React.useEffect(() => {
    if (source !== 'user') return;
    setDraftBookingId((prev) => {
      if (prev && reviewableBookingOptions.some((item) => item.value === prev)) return prev;
      return reviewableBookingOptions[0]?.value ?? '';
    });
  }, [reviewableBookingOptions, source]);

  const createReviewMutation = useMutation({
    mutationFn: () =>
      createPlatformReview({
        rating: draftRating,
        text: draftText.trim() || undefined,
        authorName: isAuthenticated ? undefined : draftAuthorName.trim() || undefined,
      }),
    onSuccess: async () => {
      setDraftText('');
      if (!isAuthenticated) setDraftAuthorName('');
      toast.success(t(I18N_KEYS.requestsPage.platformReviewFormSuccess));
      await queryClient.invalidateQueries({ queryKey: ['platform-reviews-overview'] });
    },
    onError: () => {
      toast.error(t(I18N_KEYS.requestsPage.platformReviewFormError));
    },
  });

  const createUserReviewMutation = useMutation({
    mutationFn: () => {
      const bookingId = draftBookingId.trim();
      if (!bookingId) throw new Error('booking-required');
      if (authUser?.role === 'provider') {
        return createClientReview({
          bookingId,
          rating: draftRating,
          text: draftText.trim() || undefined,
        });
      }
      if (authUser?.role === 'client') {
        return createProviderReview({
          bookingId,
          rating: draftRating,
          text: draftText.trim() || undefined,
        });
      }
      throw new Error('role-unsupported');
    },
    onSuccess: async () => {
      setDraftText('');
      setDraftRating(5);
      toast.success(t(I18N_KEYS.requestsPage.userReviewFormSuccess));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reviews-my'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings-my-reviewable'] }),
      ]);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '';
      if (message === 'booking-required') {
        toast.error(t(I18N_KEYS.requestsPage.userReviewFormBookingRequired));
        return;
      }
      if (message === 'role-unsupported') {
        toast.error(t(I18N_KEYS.requestsPage.userReviewFormRoleUnsupported));
        return;
      }
      toast.error(t(I18N_KEYS.requestsPage.userReviewFormError));
    },
  });

  const onSubmitPlatform = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createReviewMutation.isPending || source !== 'platform') return;
    createReviewMutation.mutate();
  };

  const onSubmitUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createUserReviewMutation.isPending || source !== 'user') return;
    createUserReviewMutation.mutate();
  };

  const platformComposer = (
    <article className="provider-reviews-hub__item provider-reviews-hub__item--composer card">
      <form className="form-stack provider-reviews-hub__composer-form" onSubmit={onSubmitPlatform}>
        <p className="typo-h3 provider-reviews-hub__composer-title">{t(I18N_KEYS.requestsPage.platformReviewFormTitle)}</p>
        <p className="typo-muted provider-reviews-hub__composer-hint">{t(I18N_KEYS.requestsPage.platformReviewFormHint)}</p>
        {!isAuthenticated ? (
          <div className="form-group">
            <Input
              value={draftAuthorName}
              onChange={(event) => setDraftAuthorName(event.target.value)}
              maxLength={120}
              placeholder={t(I18N_KEYS.requestsPage.platformReviewFormAuthorPlaceholder)}
              aria-label={t(I18N_KEYS.requestsPage.platformReviewFormAuthorPlaceholder)}
            />
          </div>
        ) : null}
        <div className="form-group">
          <p className="typo-small">{t(I18N_KEYS.requestsPage.platformReviewFormRatingLabel)}</p>
          <div className="provider-reviews-hub__star-line">
            <div
              className="chip-row provider-reviews-hub__star-picker"
              role="group"
              aria-label={t(I18N_KEYS.requestsPage.platformReviewFormRatingLabel)}
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`icon-button icon-button--md provider-reviews-hub__star-btn ${score <= draftRating ? '' : 'typo-muted'}`.trim()}
                  aria-pressed={draftRating === score}
                  onClick={() => setDraftRating(score)}
                  aria-label={`${score}`}
                >
                  {score <= draftRating ? '★' : '☆'}
                </button>
              ))}
            </div>
            <span className="typo-body provider-reviews-hub__star-value" aria-live="polite">
              {draftRating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="form-group">
          <Textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            maxLength={1000}
            placeholder={t(I18N_KEYS.requestsPage.platformReviewFormTextPlaceholder)}
            aria-label={t(I18N_KEYS.requestsPage.platformReviewFormTextPlaceholder)}
            rows={3}
          />
        </div>
        <div className="auth-social__row provider-reviews-hub__composer-actions">
          <button
            type="submit"
            className="auth-social__btn auth-social__btn--google provider-reviews-hub__composer-submit"
            disabled={createReviewMutation.isPending}
          >
            {t(I18N_KEYS.requestsPage.platformReviewFormSubmit)}
          </button>
          <button
            type="button"
            className="btn-ghost provider-reviews-hub__composer-reset"
            onClick={() => {
              setDraftRating(5);
              setDraftText('');
              if (!isAuthenticated) setDraftAuthorName('');
            }}
            disabled={createReviewMutation.isPending}
          >
            {t(I18N_KEYS.requestsPage.platformReviewFormClear)}
          </button>
        </div>
      </form>
    </article>
  );
  const isReviewableBookingsLoading =
    source === 'user' &&
    (userCompletedBookingsQuery.isLoading ||
      (reviewableRequestIds.length > 0 && reviewableRequestsQuery.isLoading));
  const isUserSubmitDisabled =
    createUserReviewMutation.isPending ||
    !isAuthenticated ||
    reviewableBookingOptions.length === 0 ||
    draftBookingId.trim().length === 0;

  const userComposer = (
    <article className="provider-reviews-hub__item provider-reviews-hub__item--composer card">
      <form className="form-stack provider-reviews-hub__composer-form" onSubmit={onSubmitUser}>
        <p className="typo-h3 provider-reviews-hub__composer-title">{t(I18N_KEYS.requestsPage.userReviewFormTitle)}</p>
        <p className="typo-muted provider-reviews-hub__composer-hint">{t(I18N_KEYS.requestsPage.userReviewFormHint)}</p>
        <div className="form-group">
          <p className="typo-small">{t(I18N_KEYS.requestsPage.userReviewFormBookingLabel)}</p>
          <Select
            options={reviewableBookingOptions}
            value={draftBookingId}
            onChange={setDraftBookingId}
            placeholder={t(I18N_KEYS.requestsPage.userReviewFormBookingPlaceholder)}
            disabled={isReviewableBookingsLoading || createUserReviewMutation.isPending}
            aria-label={t(I18N_KEYS.requestsPage.userReviewFormBookingLabel)}
          />
          {!isReviewableBookingsLoading && reviewableBookingOptions.length === 0 ? (
            <p className="typo-small typo-muted">{t(I18N_KEYS.requestsPage.userReviewFormNoEligibleHint)}</p>
          ) : null}
        </div>
        <div className="form-group">
          <p className="typo-small">{t(I18N_KEYS.requestsPage.platformReviewFormRatingLabel)}</p>
          <div className="provider-reviews-hub__star-line">
            <div
              className="chip-row provider-reviews-hub__star-picker"
              role="group"
              aria-label={t(I18N_KEYS.requestsPage.platformReviewFormRatingLabel)}
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`icon-button icon-button--md provider-reviews-hub__star-btn ${score <= draftRating ? '' : 'typo-muted'}`.trim()}
                  aria-pressed={draftRating === score}
                  onClick={() => setDraftRating(score)}
                  aria-label={`${score}`}
                >
                  {score <= draftRating ? '★' : '☆'}
                </button>
              ))}
            </div>
            <span className="typo-body provider-reviews-hub__star-value" aria-live="polite">
              {draftRating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="form-group">
          <Textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            maxLength={1000}
            placeholder={t(I18N_KEYS.requestsPage.userReviewFormTextPlaceholder)}
            aria-label={t(I18N_KEYS.requestsPage.userReviewFormTextPlaceholder)}
            rows={3}
          />
        </div>
        <div className="auth-social__row provider-reviews-hub__composer-actions">
          <button
            type="submit"
            className="auth-social__btn auth-social__btn--google provider-reviews-hub__composer-submit"
            disabled={isUserSubmitDisabled}
          >
            {t(I18N_KEYS.requestsPage.userReviewFormSubmit)}
          </button>
          <button
            type="button"
            className="btn-ghost provider-reviews-hub__composer-reset"
            onClick={() => {
              setDraftRating(5);
              setDraftText('');
            }}
            disabled={createUserReviewMutation.isPending}
          >
            {t(I18N_KEYS.requestsPage.platformReviewFormClear)}
          </button>
        </div>
      </form>
    </article>
  );

  const feedTopSlot = source === 'platform' ? platformComposer : userComposer;
  const isLoading = source === 'platform'
    ? platformQuery.isLoading && platformReviews.length === 0
    : isUserReviewsLoading && visibleUserReviews.length === 0;

  return (
    <section className="panel">
      <ProviderReviewsSection
        t={t}
        sectionId={source === 'platform' ? 'platform-reviews' : 'my-reviews'}
        sectionTitle={source === 'platform' ? t(I18N_KEYS.requestsPage.platformReviewsTitle) : t(I18N_KEYS.requestsPage.navReviews)}
        isReviewsLoading={isLoading}
        displayRatingAvg={displayRatingAvg}
        displayRatingCount={displayRatingCount}
        reviewsDistribution={reviewsDistribution}
        reviewsUi={reviewsUi}
        reviewSort={reviewSort}
        onReviewSortChange={setReviewSort}
        feedTopSlot={feedTopSlot}
        emptyHint={source === 'platform' ? t(I18N_KEYS.requestsPage.platformReviewsEmptyHint) : t(I18N_KEYS.requestsPage.reviewsEmptyHint)}
        visibleReviews={visibleReviews}
        reviewsTotalForPagination={displayRatingCount}
        hasReviewsPagination={hasReviewsPagination}
        reviewPage={reviewPage}
        totalReviewPages={totalReviewPages}
        onPrevPage={() => setReviewPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setReviewPage((prev) => Math.min(totalReviewPages, prev + 1))}
        formatReviewDate={(value) => reviewDateFormatter.format(new Date(value))}
      />
    </section>
  );
}
