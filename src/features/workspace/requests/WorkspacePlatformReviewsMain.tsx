'use client';

import * as React from 'react';

import { RequestsResultsSummary } from '@/components/requests/RequestsFilters';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useWorkspacePlatformReviewsOverview } from '@/features/workspace/requests/useWorkspacePlatformReviewsOverview';
import { WorkspaceReviewsShellControls } from '@/features/workspace/requests/WorkspaceReviewsShellControls';
import { useWorkspaceReviewControlsState } from '@/features/workspace/requests/useWorkspaceReviewControlsState';
import { WorkspacePlatformReviewsRail } from '@/features/workspace/requests/WorkspacePlatformReviewsRail';

const REVIEWS_PAGE_SIZE = 20;

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
  const [listDensity, setListDensity] = React.useState<'single' | 'double'>('single');
  const {
    visibleReviews,
    displayRatingCount,
    totalPages,
    isLoading,
    isPending,
  } = useWorkspacePlatformReviewsOverview({
    t,
    page: reviewPage,
    limit: REVIEWS_PAGE_SIZE,
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

  return (
    <section className="panel requests-panel" id="platform-reviews">
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

      <section
        className={`requests-list requests-list--stable workspace-reviews-list ${listDensity === 'double' ? 'is-double' : 'is-single'}`.trim()}
        role="region"
        aria-label={t(I18N_KEYS.homePublic.reviews)}
        aria-live="polite"
      >
        <WorkspaceContentState
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
        </WorkspaceContentState>
      </section>

      <div className="requests-pagination">
        <span className="requests-page-nav__label">
          {reviewPage}/{Math.max(1, totalPages)}
        </span>
        <div className="requests-page-nav" role="group" aria-label={t(I18N_KEYS.requestsPage.paginationBottomLabel)}>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={() => setReviewPage((prev) => Math.max(1, prev - 1))}
            disabled={reviewPage <= 1}
            aria-label={t(I18N_KEYS.requestsPage.paginationPrev)}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={() => setReviewPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={reviewPage >= totalPages}
            aria-label={t(I18N_KEYS.requestsPage.paginationNext)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
