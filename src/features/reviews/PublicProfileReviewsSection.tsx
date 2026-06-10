import * as React from 'react';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type {
  NormalizedPublicProfileReview,
  PublicProfileReviewsDistribution,
  PublicProfileReviewsUi,
  PublicProfileReviewSort,
} from '@/features/reviews/usePublicProfileReviewsModel';

type Translate = (key: I18nKey) => string;

type PublicProfileReviewsSectionProps = {
  t: Translate;
  isReviewsLoading: boolean;
  sectionId?: string;
  sectionTitle?: string;
  sectionClassName?: string;
  displayRatingAvg: number;
  displayRatingCount: number;
  reviewsDistribution: PublicProfileReviewsDistribution;
  reviewsUi: PublicProfileReviewsUi;
  reviewSort: PublicProfileReviewSort;
  showSortControls?: boolean;
  layout?: 'split' | 'stacked';
  onReviewSortChange: (next: PublicProfileReviewSort) => void;
  feedTopSlot?: React.ReactNode;
  emptyHint?: string;
  visibleReviews: NormalizedPublicProfileReview[];
  reviewsTotalForPagination: number;
  hasReviewsPagination: boolean;
  reviewPage: number;
  totalReviewPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  formatReviewDate: (value: number) => string;
};

export function PublicProfileReviewsSection({
  t,
  isReviewsLoading,
  sectionId = 'reviews',
  sectionTitle,
  sectionClassName,
  displayRatingAvg,
  displayRatingCount,
  reviewsDistribution,
  reviewsUi,
  reviewSort,
  showSortControls = true,
  layout = 'split',
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
}: PublicProfileReviewsSectionProps) {
  const isEmpty = reviewsTotalForPagination === 0;
  const canSort = showSortControls && !isEmpty;

  return (
    <div
      id={sectionId}
      className={`request-detail__section request-detail__similar public-profile-detail__reviews-section ${sectionClassName ?? ''}`.trim()}
    >
      <h3 className="request-detail__section-title">
        {sectionTitle ?? t(I18N_KEYS.requestsPage.reviewsViewLabel)}
      </h3>
      {isReviewsLoading ? <p className="request-detail__similar-note">...</p> : null}
      {!isReviewsLoading ? (
        <div
          className={`public-profile-reviews ${
            layout === 'stacked' ? 'public-profile-reviews--stacked' : ''
          } ${isEmpty ? 'public-profile-reviews--empty' : ''}`.trim()}
        >
          <div
            className={`public-profile-reviews__summary card ${
              layout === 'stacked' ? 'public-profile-reviews__summary--stacked' : ''
            }`.trim()}
          >
            <div className="public-profile-reviews__rating-main">
              <p className="public-profile-reviews__rating-value">{displayRatingAvg.toFixed(1)}</p>
              <p className="public-profile-reviews__rating-stars" aria-hidden="true">
                {'★'.repeat(Math.max(1, Math.min(5, Math.round(displayRatingAvg))))}
                {'☆'.repeat(5 - Math.max(1, Math.min(5, Math.round(displayRatingAvg))))}
              </p>
              <p className="public-profile-reviews__rating-meta">
                {displayRatingCount} {t(I18N_KEYS.homePublic.reviews)}
              </p>
            </div>
            <div className="public-profile-reviews__distribution">
              {[5, 4, 3, 2, 1].map((score) => {
                const count = reviewsDistribution.stats.get(score) ?? 0;
                const width = `${(count / reviewsDistribution.max) * 100}%`;
                return (
                  <div key={score} className="public-profile-reviews__distribution-row">
                    <span className="public-profile-reviews__distribution-score">{score}★</span>
                    <span className="public-profile-reviews__distribution-track">
                      <span
                        className="public-profile-reviews__distribution-fill"
                        style={{ width }}
                      />
                    </span>
                    <span className="public-profile-reviews__distribution-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`public-profile-reviews__feed ${
              isEmpty ? 'public-profile-reviews__feed--empty' : ''
            }`.trim()}
          >
            {feedTopSlot}
            <div className="public-profile-reviews__toolbar">
              <span className="public-profile-reviews__toolbar-label">
                {reviewsUi.basedOn} {displayRatingCount} {reviewsUi.ratingsLabel}
              </span>
              {canSort ? (
                <div className="public-profile-reviews__sort">
                  <button
                    type="button"
                    className={`public-profile-reviews__sort-btn ${reviewSort === 'latest' ? 'is-active' : ''}`.trim()}
                    aria-pressed={reviewSort === 'latest'}
                    onClick={() => onReviewSortChange('latest')}
                  >
                    {reviewsUi.sortLatest}
                  </button>
                  <button
                    type="button"
                    className={`public-profile-reviews__sort-btn ${reviewSort === 'top' ? 'is-active' : ''}`.trim()}
                    aria-pressed={reviewSort === 'top'}
                    onClick={() => onReviewSortChange('top')}
                  >
                    {reviewsUi.sortTop}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="public-profile-reviews__list">
              {visibleReviews.map((review) => (
                <article key={review.id} className="public-profile-reviews__item card">
                  <div className="public-profile-reviews__item-head">
                    <p className="public-profile-reviews__item-author">{review.authorName}</p>
                    <p className="public-profile-reviews__item-date">
                      {review.createdAtTs ? formatReviewDate(review.createdAtTs) : ''}
                    </p>
                  </div>
                  <p
                    className="public-profile-reviews__item-stars"
                    aria-label={`${review.rating} of 5`}
                  >
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(Math.max(0, 5 - review.rating))}
                  </p>
                  <p className="public-profile-reviews__item-text">
                    {review.text || reviewsUi.noText}
                  </p>
                </article>
              ))}
              {isEmpty ? (
                <article className="public-profile-reviews__item public-profile-reviews__item--empty card">
                  <p className="public-profile-reviews__item-text">
                    {emptyHint ?? t(I18N_KEYS.requestsPage.reviewsEmptyHint)}
                  </p>
                </article>
              ) : null}
            </div>

            {hasReviewsPagination ? (
              <RequestsPageNav
                className="public-profile-reviews__page-nav"
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
