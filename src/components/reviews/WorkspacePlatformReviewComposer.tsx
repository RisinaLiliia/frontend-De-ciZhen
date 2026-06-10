'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { WorkspaceReviewRatingField } from '@/components/reviews/WorkspaceReviewRatingField';

type Translate = (key: I18nKey) => string;

type WorkspacePlatformReviewComposerProps = {
  t: Translate;
  isAuthenticated: boolean;
  draftAuthorName: string;
  draftRating: number;
  draftText: string;
  isPending: boolean;
  onAuthorNameChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onTextChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function WorkspacePlatformReviewComposer({
  t,
  isAuthenticated,
  draftAuthorName,
  draftRating,
  draftText,
  isPending,
  onAuthorNameChange,
  onRatingChange,
  onTextChange,
  onSubmit,
  onReset,
}: WorkspacePlatformReviewComposerProps) {
  return (
    <article className="public-profile-reviews__item public-profile-reviews__item--composer card">
      <form className="form-stack public-profile-reviews__composer-form" onSubmit={onSubmit}>
        <p className="typo-h3 public-profile-reviews__composer-title">
          {t(I18N_KEYS.requestsPage.platformReviewFormTitle)}
        </p>
        <p className="typo-muted public-profile-reviews__composer-hint">
          {t(I18N_KEYS.requestsPage.platformReviewFormHint)}
        </p>
        {!isAuthenticated ? (
          <div className="form-group">
            <Input
              value={draftAuthorName}
              onChange={(event) => onAuthorNameChange(event.target.value)}
              maxLength={120}
              placeholder={t(I18N_KEYS.requestsPage.platformReviewFormAuthorPlaceholder)}
              aria-label={t(I18N_KEYS.requestsPage.platformReviewFormAuthorPlaceholder)}
            />
          </div>
        ) : null}
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
            placeholder={t(I18N_KEYS.requestsPage.platformReviewFormTextPlaceholder)}
            aria-label={t(I18N_KEYS.requestsPage.platformReviewFormTextPlaceholder)}
            rows={3}
          />
        </div>
        <div className="auth-social__row public-profile-reviews__composer-actions">
          <button
            type="submit"
            className="auth-social__btn auth-social__btn--google public-profile-reviews__composer-submit"
            disabled={isPending}
          >
            {t(I18N_KEYS.requestsPage.platformReviewFormSubmit)}
          </button>
          <button
            type="button"
            className="btn-ghost public-profile-reviews__composer-reset"
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
