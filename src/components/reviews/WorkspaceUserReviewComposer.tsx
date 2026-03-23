'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { Select, type Option } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { WorkspaceReviewRatingField } from '@/components/reviews/WorkspaceReviewRatingField';

type Translate = (key: I18nKey) => string;

type WorkspaceUserReviewComposerProps = {
  t: Translate;
  draftBookingId: string;
  draftRating: number;
  draftText: string;
  reviewableBookingOptions: Option[];
  isReviewableBookingsLoading: boolean;
  isPending: boolean;
  isSubmitDisabled: boolean;
  onBookingChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onTextChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function WorkspaceUserReviewComposer({
  t,
  draftBookingId,
  draftRating,
  draftText,
  reviewableBookingOptions,
  isReviewableBookingsLoading,
  isPending,
  isSubmitDisabled,
  onBookingChange,
  onRatingChange,
  onTextChange,
  onSubmit,
  onReset,
}: WorkspaceUserReviewComposerProps) {
  return (
    <article className="provider-reviews-hub__item provider-reviews-hub__item--composer card">
      <form className="form-stack provider-reviews-hub__composer-form" onSubmit={onSubmit}>
        <p className="typo-h3 provider-reviews-hub__composer-title">{t(I18N_KEYS.requestsPage.userReviewFormTitle)}</p>
        <p className="typo-muted provider-reviews-hub__composer-hint">{t(I18N_KEYS.requestsPage.userReviewFormHint)}</p>
        <div className="form-group">
          <p className="typo-small">{t(I18N_KEYS.requestsPage.userReviewFormBookingLabel)}</p>
          <Select
            options={reviewableBookingOptions}
            value={draftBookingId}
            onChange={onBookingChange}
            placeholder={t(I18N_KEYS.requestsPage.userReviewFormBookingPlaceholder)}
            disabled={isReviewableBookingsLoading || isPending}
            aria-label={t(I18N_KEYS.requestsPage.userReviewFormBookingLabel)}
          />
          {!isReviewableBookingsLoading && reviewableBookingOptions.length === 0 ? (
            <p className="typo-small typo-muted">{t(I18N_KEYS.requestsPage.userReviewFormNoEligibleHint)}</p>
          ) : null}
        </div>
        <WorkspaceReviewRatingField
          label={t(I18N_KEYS.requestsPage.platformReviewFormRatingLabel)}
          value={draftRating}
          onChange={onRatingChange}
        />
        <div className="form-group">
          <Textarea
            value={draftText}
            onChange={(event) => onTextChange(event.target.value)}
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
            disabled={isSubmitDisabled}
          >
            {t(I18N_KEYS.requestsPage.userReviewFormSubmit)}
          </button>
          <button
            type="button"
            className="btn-ghost provider-reviews-hub__composer-reset"
            onClick={onReset}
            disabled={isPending}
          >
            {t(I18N_KEYS.requestsPage.platformReviewFormClear)}
          </button>
        </div>
      </form>
    </article>
  );
}
