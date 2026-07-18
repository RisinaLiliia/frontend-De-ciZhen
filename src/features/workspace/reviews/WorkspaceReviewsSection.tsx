'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { RequestsPaginatedPanel } from '@/components/requests/RequestsPaginatedPanel';
import { RequestsResultsSummary } from '@/components/requests/RequestsFilters';
import { workspaceQK } from '@/features/workspace/data';
import { WorkspaceReviewsShellControls } from '@/features/workspace/reviews/WorkspaceReviewsShellControls';
import { useWorkspaceReviewControlsState } from '@/features/workspace/reviews/useWorkspaceReviewControlsState';
import { workspaceCardShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { getWorkspaceReviews } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import {
  DEFAULT_REQUESTS_LIST_DENSITY,
  REQUESTS_PAGE_SIZE,
  type RequestsListDensity,
} from '@/lib/requests/pagination';

type Translate = (key: I18nKey) => string;

type WorkspaceReviewsSectionProps = {
  t: Translate;
  locale: Locale;
};

export function WorkspaceReviewsSection({
  t,
  locale,
}: WorkspaceReviewsSectionProps) {
  const { reviewRange, reviewSort } = useWorkspaceReviewControlsState();
  const [reviewPage, setReviewPage] = React.useState(1);
  const [listDensity, setListDensity] = React.useState<RequestsListDensity>(DEFAULT_REQUESTS_LIST_DENSITY);
  const sort = reviewSort === 'top' ? 'rating_desc' : 'created_desc';

  const {
    data,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: workspaceQK.workspaceReviewsSection({
      range: reviewRange,
      sort,
      page: reviewPage,
      limit: REQUESTS_PAGE_SIZE,
    }),
    queryFn: () =>
      withStatusFallback(
        () =>
          getWorkspaceReviews({
            range: reviewRange,
            sort,
            page: reviewPage,
            limit: REQUESTS_PAGE_SIZE,
          }),
        null,
        [400, 404],
      ),
    retry: false,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

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

  React.useEffect(() => {
    setReviewPage(1);
  }, [reviewRange, reviewSort]);

  React.useEffect(() => {
    const resolvedPage = data?.list.page;
    if (!resolvedPage || resolvedPage === reviewPage) return;
    setReviewPage(resolvedPage);
  }, [data?.list.page, reviewPage]);

  const totalPages = data?.list.totalPages ?? 1;
  const totalResultsLabel = data?.list.totalLabel ?? '0';
  const reviewItems = data?.list.items ?? [];
  const emptyTitle = data?.list.emptyTitle ?? t(I18N_KEYS.homePublic.reviews);
  const emptyHint = data?.list.emptyHint ?? t(I18N_KEYS.requestsPage.platformReviewsEmptyHint);
  const isEmpty = !isLoading && reviewItems.length === 0;

  const topSlot = (
    <>
      <WorkspaceReviewsShellControls t={t} />

      <RequestsResultsSummary
        t={t}
        totalResults={totalResultsLabel}
        resultsLabel={t(I18N_KEYS.homePublic.reviews)}
        page={reviewPage}
        totalPages={totalPages}
        isPending={isFetching}
        listDensity={listDensity}
        onListDensityChange={setListDensity}
        onPrevPage={() => setReviewPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setReviewPage((prev) => Math.min(totalPages, prev + 1))}
      />
    </>
  );

  return (
    <RequestsPaginatedPanel
      t={t}
      page={reviewPage}
      totalPages={totalPages}
      onPrevPage={() => setReviewPage((prev) => Math.max(1, prev - 1))}
      onNextPage={() => setReviewPage((prev) => Math.min(totalPages, prev + 1))}
      topSlot={topSlot}
      panelClassName="workspace-platform-reviews"
      listAriaLabel={t(I18N_KEYS.homePublic.reviews)}
      listDensity={listDensity}
      listClassName="workspace-reviews-list"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyTitle={emptyTitle}
      emptyHint={emptyHint}
    >
      {reviewItems.map((review) => {
        const createdAtRaw = new Date(review.createdAt);
        const hasCreatedAt = Number.isFinite(createdAtRaw.getTime());

        return (
          <article key={review.id} className={workspaceCardShell('public-profile-reviews__item')}>
            <div className="public-profile-reviews__item-head">
              <p className="public-profile-reviews__item-author">{review.authorName}</p>
              <p className="public-profile-reviews__item-date">
                {hasCreatedAt ? reviewDateFormatter.format(createdAtRaw) : ''}
              </p>
            </div>
            <p className="public-profile-reviews__item-stars" aria-label={`${review.rating} of 5`}>
              {'★'.repeat(review.rating)}
              {'☆'.repeat(Math.max(0, 5 - review.rating))}
            </p>
            <p className="public-profile-reviews__item-text">{review.text}</p>
          </article>
        );
      })}
    </RequestsPaginatedPanel>
  );
}
