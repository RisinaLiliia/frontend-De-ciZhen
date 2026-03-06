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
import { createPlatformReview, getPlatformReviewsOverview } from '@/lib/api/reviews';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Translate = (key: I18nKey) => string;

const PLATFORM_REVIEWS_PAGE_SIZE = 6;
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
  limit: PLATFORM_REVIEWS_PAGE_SIZE,
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

type WorkspacePlatformReviewsPanelProps = {
  t: Translate;
  locale: Locale;
};

function clampRating(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function WorkspacePlatformReviewsPanel({ t, locale }: WorkspacePlatformReviewsPanelProps) {
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const queryClient = useQueryClient();
  const isAuthenticated = authStatus === 'authenticated';

  const [reviewSort, setReviewSort] = React.useState<ProviderReviewSort>('latest');
  const [reviewPage, setReviewPage] = React.useState(1);
  const [draftRating, setDraftRating] = React.useState(5);
  const [draftText, setDraftText] = React.useState('');
  const [draftAuthorName, setDraftAuthorName] = React.useState('');

  React.useEffect(() => {
    setReviewPage(1);
  }, [reviewSort]);

  const reviewsOffset = (reviewPage - 1) * PLATFORM_REVIEWS_PAGE_SIZE;
  const sortValue = reviewSort === 'top' ? 'rating_desc' : 'created_desc';

  const reviewsOverviewQuery = useQuery({
    queryKey: ['platform-reviews-overview', sortValue, reviewPage],
    queryFn: () =>
      withStatusFallback(
        () =>
          getPlatformReviewsOverview({
            limit: PLATFORM_REVIEWS_PAGE_SIZE,
            offset: reviewsOffset,
            sort: sortValue,
          }),
        EMPTY_PLATFORM_OVERVIEW,
        [400, 404],
      ),
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const visibleReviews = React.useMemo<NormalizedProviderReview[]>(
    () =>
      (reviewsOverviewQuery.data?.items ?? []).map((item) => {
        const rawRating = Number(item.rating ?? 0);
        const text = item.text?.trim() || item.comment?.trim() || '';
        const createdAtRaw = item.createdAt ? new Date(item.createdAt) : null;
        const createdAtTs =
          createdAtRaw && Number.isFinite(createdAtRaw.getTime()) ? createdAtRaw.getTime() : null;
        return {
          id: item.id,
          rating: clampRating(rawRating),
          text,
          authorName: item.authorName?.trim() || t(I18N_KEYS.requestsPage.platformReviewAnonymous),
          createdAtTs,
        };
      }),
    [reviewsOverviewQuery.data?.items, t],
  );

  const displayRatingAvg = React.useMemo(() => {
    const summaryAvg = Number(reviewsOverviewQuery.data?.summary.averageRating ?? 0);
    if (Number.isFinite(summaryAvg) && summaryAvg >= 0) return summaryAvg;
    return 0;
  }, [reviewsOverviewQuery.data?.summary.averageRating]);

  const displayRatingCount = React.useMemo(() => {
    const summaryTotal = Number(reviewsOverviewQuery.data?.summary.total ?? 0);
    if (Number.isFinite(summaryTotal) && summaryTotal >= 0) return Math.floor(summaryTotal);
    return 0;
  }, [reviewsOverviewQuery.data?.summary.total]);

  const reviewsDistribution: ProviderReviewsDistribution = React.useMemo(() => {
    const stats = new Map<number, number>();
    for (let score = 1; score <= 5; score += 1) stats.set(score, 0);
    const distribution = reviewsOverviewQuery.data?.summary.distribution;
    for (let score = 1; score <= 5; score += 1) {
      const key = String(score) as '1' | '2' | '3' | '4' | '5';
      const count = Number(distribution?.[key] ?? 0);
      stats.set(score, Number.isFinite(count) && count > 0 ? Math.floor(count) : 0);
    }
    return { stats, max: Math.max(1, ...Array.from(stats.values())) };
  }, [reviewsOverviewQuery.data?.summary.distribution]);

  const hasReviewsPagination = displayRatingCount > PLATFORM_REVIEWS_PAGE_SIZE;
  const totalReviewPages = Math.max(1, Math.ceil(displayRatingCount / PLATFORM_REVIEWS_PAGE_SIZE));

  React.useEffect(() => {
    setReviewPage((prev) => Math.min(prev, totalReviewPages));
  }, [totalReviewPages]);

  const reviewsUi: ProviderReviewsUi = locale === 'de'
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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createReviewMutation.isPending) return;
    createReviewMutation.mutate();
  };

  const feedTopSlot = (
    <article className="provider-reviews-hub__item provider-reviews-hub__item--composer card">
      <form className="form-stack provider-reviews-hub__composer-form" onSubmit={onSubmit}>
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
        ) : (
          <p className="typo-small">
            {t(I18N_KEYS.requestsPage.platformReviewFormSignedAs)}: {authUser?.name?.trim() || t(I18N_KEYS.requestsPage.navUserFallback)}
          </p>
        )}
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

  return (
    <section className="panel">
      <ProviderReviewsSection
        t={t}
        sectionId="platform-reviews"
        sectionTitle={t(I18N_KEYS.requestsPage.platformReviewsTitle)}
        isReviewsLoading={reviewsOverviewQuery.isLoading && visibleReviews.length === 0}
        displayRatingAvg={displayRatingAvg}
        displayRatingCount={displayRatingCount}
        reviewsDistribution={reviewsDistribution}
        reviewsUi={reviewsUi}
        reviewSort={reviewSort}
        onReviewSortChange={setReviewSort}
        feedTopSlot={feedTopSlot}
        emptyHint={t(I18N_KEYS.requestsPage.platformReviewsEmptyHint)}
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
