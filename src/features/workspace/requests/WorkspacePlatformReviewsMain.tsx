'use client';

import * as React from 'react';

import { RequestsPaginatedPanel } from '@/components/requests/RequestsPaginatedPanel';
import { RequestsResultsSummary } from '@/components/requests/RequestsFilters';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import {
  DEFAULT_REQUESTS_LIST_DENSITY,
  REQUESTS_PAGE_SIZE,
  type RequestsListDensity,
} from '@/lib/requests/pagination';
import { useWorkspacePlatformReviewsOverview } from '@/features/workspace/requests/useWorkspacePlatformReviewsOverview';
import { WorkspaceReviewsShellControls } from '@/features/workspace/requests/WorkspaceReviewsShellControls';
import { useWorkspaceReviewControlsState } from '@/features/workspace/requests/useWorkspaceReviewControlsState';
import { WorkspacePlatformReviewsRail } from '@/features/workspace/requests/WorkspacePlatformReviewsRail';

type Translate = (key: I18nKey) => string;

type WorkspacePlatformReviewsMainProps = {
  t: Translate;
  locale: Locale;
  showInlineRail?: boolean;
};

export function WorkspacePlatformReviewsMain({
  t,
  locale,
  showInlineRail = false,
}: WorkspacePlatformReviewsMainProps) {
  const { reviewRange, reviewSort } = useWorkspaceReviewControlsState();
  const [reviewPage, setReviewPage] = React.useState(1);
  const [listDensity, setListDensity] = React.useState<RequestsListDensity>(DEFAULT_REQUESTS_LIST_DENSITY);
  const {
    visibleReviews,
    displayRatingCount,
    totalPages,
    isLoading,
    isPending,
  } = useWorkspacePlatformReviewsOverview({
    t,
    page: reviewPage,
    limit: REQUESTS_PAGE_SIZE,
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
    setReviewPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const topSlot = (
    <>
      {showInlineRail ? (
        <div className="workspace-platform-reviews__mobile-rail">
          <WorkspacePlatformReviewsRail t={t} />
        </div>
      ) : null}

      <WorkspaceReviewsShellControls t={t} locale={locale} />

      <RequestsResultsSummary
        t={t}
        totalResults={displayRatingCount.toLocaleString(localeTag)}
        resultsLabel={t(I18N_KEYS.homePublic.reviews)}
        page={reviewPage}
        totalPages={totalPages}
        isPending={isPending}
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
      isEmpty={!isLoading && displayRatingCount === 0}
      emptyTitle={t(I18N_KEYS.homePublic.reviews)}
      emptyHint={t(I18N_KEYS.requestsPage.platformReviewsEmptyHint)}
    >
      {visibleReviews.map((review) => (
        <article key={review.id} className="provider-reviews-hub__item card">
          <div className="provider-reviews-hub__item-head">
            <p className="provider-reviews-hub__item-author">{review.authorName}</p>
            <p className="provider-reviews-hub__item-date">
              {review.createdAtTs ? reviewDateFormatter.format(new Date(review.createdAtTs)) : ''}
            </p>
          </div>
          <p className="provider-reviews-hub__item-stars" aria-label={`${review.rating} of 5`}>
            {'★'.repeat(review.rating)}
            {'☆'.repeat(Math.max(0, 5 - review.rating))}
          </p>
          <p className="provider-reviews-hub__item-text">{review.text}</p>
        </article>
      ))}
    </RequestsPaginatedPanel>
  );
}
