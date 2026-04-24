'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Textarea } from '@/components/ui/Textarea';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { createPlatformReview } from '@/lib/api/reviews';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { useWorkspacePlatformReviewsOverview } from '@/features/workspace/requests/useWorkspacePlatformReviewsOverview';

type Translate = (key: I18nKey) => string;

type WorkspacePlatformReviewsRailProps = {
  t: Translate;
};

export function WorkspacePlatformReviewsRail({
  t,
}: WorkspacePlatformReviewsRailProps) {
  const {
    displayRatingAvg,
    displayRatingCount,
    reviewsDistribution,
  } = useWorkspacePlatformReviewsOverview({
    t,
    page: 1,
    limit: 1,
  });
  const authStatus = useAuthStatus();
  const queryClient = useQueryClient();
  const isAuthenticated = authStatus === 'authenticated';
  const [draftRating, setDraftRating] = React.useState(5);
  const [draftText, setDraftText] = React.useState('');
  const [draftAuthorName, setDraftAuthorName] = React.useState('');

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
      await queryClient.invalidateQueries({ queryKey: workspaceQK.platformReviewsOverviewPrefix() });
    },
    onError: () => {
      toast.error(t(I18N_KEYS.requestsPage.platformReviewFormError));
    },
  });

  const onSubmitPlatform = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createReviewMutation.isPending) return;
    createReviewMutation.mutate();
  };

  const roundedStars = Math.max(1, Math.min(5, Math.round(displayRatingAvg)));

  return (
    <section className="panel requests-panel workspace-platform-reviews">
      <SectionHeader
        title={t(I18N_KEYS.requestsPage.platformReviewsTitle)}
        titleAs="h3"
        className="workspace-platform-reviews__header"
      />

      <div className="workspace-platform-reviews__summary provider-reviews-hub__summary">
        <div className="provider-reviews-hub__rating-main">
          <p className="provider-reviews-hub__rating-value">{displayRatingAvg.toFixed(1)}</p>
          <p className="provider-reviews-hub__rating-stars" aria-hidden="true">
            {'★'.repeat(roundedStars)}
            {'☆'.repeat(5 - roundedStars)}
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

      <div className="workspace-platform-reviews__composer">
        <SectionHeader
          title={t(I18N_KEYS.requestsPage.platformReviewFormTitle)}
          subtitle={t(I18N_KEYS.requestsPage.platformReviewFormHint)}
          titleAs="h3"
          className="workspace-platform-reviews__header workspace-platform-reviews__subheader"
        />
        <form className="form-stack provider-reviews-hub__composer-form" onSubmit={onSubmitPlatform}>
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
      </div>
    </section>
  );
}
