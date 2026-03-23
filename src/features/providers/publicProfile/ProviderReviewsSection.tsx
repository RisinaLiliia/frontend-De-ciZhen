import * as React from 'react';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type {
  NormalizedProviderReview,
  ProviderReviewsDistribution,
  ProviderReviewsUi,
  ProviderReviewSort,
} from '@/features/providers/publicProfile/useProviderReviewsModel';

type Translate = (key: I18nKey) => string;

type ProviderReviewsSectionProps = {
  t: Translate;
  isReviewsLoading: boolean;
  sectionId?: string;
  sectionTitle?: string;
  displayRatingAvg: number;
  displayRatingCount: number;
  reviewsDistribution: ProviderReviewsDistribution;
  reviewsUi: ProviderReviewsUi;
  reviewSort: ProviderReviewSort;
  onReviewSortChange: (next: ProviderReviewSort) => void;
  feedTopSlot?: React.ReactNode;
  emptyHint?: string;
  visibleReviews: NormalizedProviderReview[];
  reviewsTotalForPagination: number;
  hasReviewsPagination: boolean;
  reviewPage: number;
  totalReviewPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  formatReviewDate: (value: number) => string;
};

export function ProviderReviewsSection({
  t,
  isReviewsLoading,
  sectionId = 'reviews',
  sectionTitle,
  displayRatingAvg,
  displayRatingCount,
  reviewsDistribution,
  reviewsUi,
  reviewSort,
  onReviewSortChange,
  feedTopSlot,
  emptyHint,
  visibleReviews,
  reviewsTotalForPagination,
  hasReviewsPagination,
  reviewPage,
  totalReviewPages,
  onPrevPage,
  onNextPage,
  formatReviewDate,
}: ProviderReviewsSectionProps) {
  return (
    <div id={sectionId} className="request-detail__section request-detail__similar">
      <h3 className="request-detail__section-title">{sectionTitle ?? t(I18N_KEYS.requestsPage.reviewsViewLabel)}</h3>
      {isReviewsLoading ? <p className="request-detail__similar-note">...</p> : null}
      {!isReviewsLoading ? (
        <div className="provider-reviews-hub">
          <div className="provider-reviews-hub__summary card">
            <div className="provider-reviews-hub__rating-main">
              <p className="provider-reviews-hub__rating-value">{displayRatingAvg.toFixed(1)}</p>
              <p className="provider-reviews-hub__rating-stars" aria-hidden="true">
                {'★'.repeat(Math.max(1, Math.min(5, Math.round(displayRatingAvg))))}
                {'☆'.repeat(5 - Math.max(1, Math.min(5, Math.round(displayRatingAvg))))}
              </p>
              <p className="provider-reviews-hub__rating-meta">
                {displayRatingCount} {t(I18N_KEYS.homePublic.reviews)}
              </p>
            </div>
            <div className="provider-reviews-hub__distribution">
              {[5, 4, 3, 2, 1].map((score) => {
                const count = reviewsDistribution.stats.get(score) ?? 0;
                const width = `${(count / reviewsDistribution.max) * 100}%`;
                return (
                  <div key={score} className="provider-reviews-hub__distribution-row">
                    <span className="provider-reviews-hub__distribution-score">{score}★</span>
                    <span className="provider-reviews-hub__distribution-track">
                      <span className="provider-reviews-hub__distribution-fill" style={{ width }} />
                    </span>
                    <span className="provider-reviews-hub__distribution-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="provider-reviews-hub__feed">
            {feedTopSlot}
            <div className="provider-reviews-hub__toolbar">
              <span className="provider-reviews-hub__toolbar-label">
                {reviewsUi.basedOn} {displayRatingCount} {reviewsUi.ratingsLabel}
              </span>
              <div className="provider-reviews-hub__sort">
                <button
                  type="button"
                  className={`provider-reviews-hub__sort-btn ${reviewSort === 'latest' ? 'is-active' : ''}`.trim()}
                  aria-pressed={reviewSort === 'latest'}
                  onClick={() => onReviewSortChange('latest')}
                >
                  {reviewsUi.sortLatest}
                </button>
                <button
                  type="button"
                  className={`provider-reviews-hub__sort-btn ${reviewSort === 'top' ? 'is-active' : ''}`.trim()}
                  aria-pressed={reviewSort === 'top'}
                  onClick={() => onReviewSortChange('top')}
                >
                  {reviewsUi.sortTop}
                </button>
              </div>
            </div>

            <div className="provider-reviews-hub__list">
              {visibleReviews.map((review) => (
                <article key={review.id} className="provider-reviews-hub__item card">
                  <div className="provider-reviews-hub__item-head">
                    <p className="provider-reviews-hub__item-author">{review.authorName}</p>
                    <p className="provider-reviews-hub__item-date">
                      {review.createdAtTs ? formatReviewDate(review.createdAtTs) : ''}
                    </p>
                  </div>
                  <p className="provider-reviews-hub__item-stars" aria-label={`${review.rating} of 5`}>
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(Math.max(0, 5 - review.rating))}
                  </p>
                  <p className="provider-reviews-hub__item-text">{review.text || reviewsUi.noText}</p>
                </article>
              ))}
              {reviewsTotalForPagination === 0 ? (
                <article className="provider-reviews-hub__item card">
                  <p className="provider-reviews-hub__item-text">{emptyHint ?? t(I18N_KEYS.requestsPage.reviewsEmptyHint)}</p>
                </article>
              ) : null}
            </div>

            {hasReviewsPagination ? (
              <RequestsPageNav
                className="provider-reviews-hub__page-nav"
                page={reviewPage}
                totalPages={totalReviewPages}
                disabled={isReviewsLoading}
                onPrevPage={onPrevPage}
                onNextPage={onNextPage}
                ariaLabel={t(I18N_KEYS.requestsPage.paginationLabel)}
                prevAriaLabel={t(I18N_KEYS.requestsPage.paginationPrev)}
                nextAriaLabel={t(I18N_KEYS.requestsPage.paginationNext)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
