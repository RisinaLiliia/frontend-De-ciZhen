'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Textarea } from '@/components/ui/Textarea';
import { createPlatformReview } from '@/lib/api/reviews';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { workspaceQK } from '@/features/workspace/data';
import { workspaceRequestsPanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';

type Props = {
  t: (key: I18nKey) => string;
  requiresAuthorName: boolean;
};

export function WorkspaceReviewsComposer({
  t,
  requiresAuthorName,
}: Props) {
  const queryClient = useQueryClient();
  const [draftRating, setDraftRating] = React.useState(5);
  const [draftText, setDraftText] = React.useState('');
  const [draftAuthorName, setDraftAuthorName] = React.useState('');

  const createReviewMutation = useMutation({
    mutationFn: () =>
      createPlatformReview({
        rating: draftRating,
        text: draftText.trim() || undefined,
        authorName: requiresAuthorName ? draftAuthorName.trim() || undefined : undefined,
      }),
    onSuccess: async () => {
      setDraftRating(5);
      setDraftText('');
      setDraftAuthorName('');
      toast.success(t(I18N_KEYS.requestsPage.platformReviewFormSuccess));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workspace-reviews-rail'] }),
        queryClient.invalidateQueries({ queryKey: workspaceQK.platformReviewsOverviewPrefix() }),
      ]);
    },
    onError: () => {
      toast.error(t(I18N_KEYS.requestsPage.platformReviewFormError));
    },
  });

  return (
    <section className={workspaceRequestsPanelShell('workspace-platform-reviews')}>
      <SectionHeader
        title={t(I18N_KEYS.requestsPage.platformReviewFormTitle)}
        subtitle={t(I18N_KEYS.requestsPage.platformReviewFormHint)}
        titleAs="h3"
        className="workspace-platform-reviews__header workspace-platform-reviews__subheader"
      />
      <form
        className="form-stack public-profile-reviews__composer-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (createReviewMutation.isPending) return;
          createReviewMutation.mutate();
        }}
      >
        {requiresAuthorName ? (
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
          <div className="public-profile-reviews__star-line">
            <div className="chip-row public-profile-reviews__star-picker" role="group" aria-label={t(I18N_KEYS.requestsPage.platformReviewFormRatingLabel)}>
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`icon-button icon-button--md public-profile-reviews__star-btn ${score <= draftRating ? '' : 'typo-muted'}`.trim()}
                  aria-pressed={draftRating === score}
                  onClick={() => setDraftRating(score)}
                  aria-label={`${score}`}
                >
                  {score <= draftRating ? '★' : '☆'}
                </button>
              ))}
            </div>
            <span className="typo-body public-profile-reviews__star-value" aria-live="polite">
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
        <div className="auth-social__row public-profile-reviews__composer-actions">
          <button
            type="submit"
            className="auth-social__btn auth-social__btn--google public-profile-reviews__composer-submit"
            disabled={createReviewMutation.isPending}
          >
            {t(I18N_KEYS.requestsPage.platformReviewFormSubmit)}
          </button>
        </div>
      </form>
    </section>
  );
}
