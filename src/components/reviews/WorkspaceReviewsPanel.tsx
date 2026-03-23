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
import type { Option } from '@/components/ui/Select';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import { WorkspacePlatformReviewComposer } from '@/components/reviews/WorkspacePlatformReviewComposer';
import { WorkspaceUserReviewComposer } from '@/components/reviews/WorkspaceUserReviewComposer';
import {
  buildWorkspaceLocaleTag,
  buildWorkspacePlatformReviewDistribution,
  buildWorkspacePlatformReviews,
  buildWorkspaceReviewDistribution,
  buildWorkspaceReviewableBookingOptions,
  buildWorkspaceReviewableRequestById,
  buildWorkspaceReviewsAverage,
  buildWorkspaceReviewsCount,
  buildWorkspaceReviewsUi,
  buildWorkspaceSortedUserReviews,
  resolveWorkspaceReviewableBookingsLoading,
  resolveWorkspaceUserReviewMutationErrorKey,
  resolveWorkspaceUserSubmitDisabled,
} from '@/components/reviews/workspaceReviewsPanel.model';

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
    () => buildWorkspacePlatformReviews(platformQuery.data?.items ?? [], t),
    [platformQuery.data?.items, t],
  );

  const sortedUserReviews = React.useMemo<NormalizedProviderReview[]>(
    () => buildWorkspaceSortedUserReviews(userReviews, reviewSort, t),
    [reviewSort, t, userReviews],
  );

  const visibleUserReviews = React.useMemo(
    () => sortedUserReviews.slice(reviewsOffset, reviewsOffset + REVIEWS_PAGE_SIZE),
    [reviewsOffset, sortedUserReviews],
  );

  const visibleReviews = source === 'platform' ? platformReviews : visibleUserReviews;

  const displayRatingAvg = React.useMemo(() => {
    return buildWorkspaceReviewsAverage({
      source,
      platformAverageRating: platformQuery.data?.summary.averageRating,
      userReviews: sortedUserReviews,
    });
  }, [platformQuery.data?.summary.averageRating, sortedUserReviews, source]);

  const displayRatingCount = React.useMemo(() => {
    return buildWorkspaceReviewsCount({
      source,
      platformTotal: platformQuery.data?.summary.total,
      userReviewsCount: sortedUserReviews.length,
    });
  }, [platformQuery.data?.summary.total, sortedUserReviews.length, source]);

  const reviewsDistribution: ProviderReviewsDistribution = React.useMemo(() => {
    if (source === 'platform') {
      return buildWorkspacePlatformReviewDistribution(platformQuery.data?.summary.distribution);
    }
    return buildWorkspaceReviewDistribution(sortedUserReviews);
  }, [platformQuery.data?.summary, sortedUserReviews, source]);

  const hasReviewsPagination = displayRatingCount > REVIEWS_PAGE_SIZE;
  const totalReviewPages = Math.max(1, Math.ceil(displayRatingCount / REVIEWS_PAGE_SIZE));

  React.useEffect(() => {
    setReviewPage((prev) => Math.min(prev, totalReviewPages));
  }, [totalReviewPages]);

  const reviewsUi: ProviderReviewsUi = React.useMemo(
    () => buildWorkspaceReviewsUi(resolvedLocale, t),
    [resolvedLocale, t],
  );

  const localeTag = React.useMemo(() => buildWorkspaceLocaleTag(resolvedLocale), [resolvedLocale]);
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

  const reviewableRequestById = React.useMemo(
    () => buildWorkspaceReviewableRequestById(reviewableRequestsQuery.data?.items ?? []),
    [reviewableRequestsQuery.data?.items],
  );

  const reviewableBookingOptions = React.useMemo<Option[]>(
    () => buildWorkspaceReviewableBookingOptions({
      bookings: userCompletedBookingsQuery.data ?? [],
      reviewableRequestById,
      bookingDateFormatter,
      t,
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
      toast.error(t(resolveWorkspaceUserReviewMutationErrorKey(message)));
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
    <WorkspacePlatformReviewComposer
      t={t}
      isAuthenticated={isAuthenticated}
      draftAuthorName={draftAuthorName}
      draftRating={draftRating}
      draftText={draftText}
      isPending={createReviewMutation.isPending}
      onAuthorNameChange={setDraftAuthorName}
      onRatingChange={setDraftRating}
      onTextChange={setDraftText}
      onSubmit={onSubmitPlatform}
      onReset={() => {
        setDraftRating(5);
        setDraftText('');
        if (!isAuthenticated) setDraftAuthorName('');
      }}
    />
  );

  const isReviewableBookingsLoading = resolveWorkspaceReviewableBookingsLoading({
    source,
    userCompletedBookingsLoading: userCompletedBookingsQuery.isLoading,
    reviewableRequestIdsCount: reviewableRequestIds.length,
    reviewableRequestsLoading: reviewableRequestsQuery.isLoading,
  });
  const isUserSubmitDisabled = resolveWorkspaceUserSubmitDisabled({
    isPending: createUserReviewMutation.isPending,
    isAuthenticated,
    reviewableBookingOptionsLength: reviewableBookingOptions.length,
    draftBookingId,
  });

  const userComposer = (
    <WorkspaceUserReviewComposer
      t={t}
      draftBookingId={draftBookingId}
      draftRating={draftRating}
      draftText={draftText}
      reviewableBookingOptions={reviewableBookingOptions}
      isReviewableBookingsLoading={isReviewableBookingsLoading}
      isPending={createUserReviewMutation.isPending}
      isSubmitDisabled={isUserSubmitDisabled}
      onBookingChange={setDraftBookingId}
      onRatingChange={setDraftRating}
      onTextChange={setDraftText}
      onSubmit={onSubmitUser}
      onReset={() => {
        setDraftRating(5);
        setDraftText('');
      }}
    />
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
