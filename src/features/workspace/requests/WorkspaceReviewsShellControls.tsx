'use client';

import { IconFilter } from '@/components/ui/icons/icons';
import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import type { ProviderReviewSort } from '@/features/providers/publicProfile/useProviderReviewsModel';
import { WorkspaceMobileFiltersSheet } from '@/features/workspace/requests/WorkspaceMobileFiltersSheet';
import { useWorkspaceReviewControlsState } from '@/features/workspace/requests/useWorkspaceReviewControlsState';
import {
  getWorkspaceReviewRangeLabel,
  WORKSPACE_REVIEW_RANGE_OPTIONS,
} from '@/features/workspace/requests/workspaceReviewControls';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspaceReviewsShellControlsProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
};

export function WorkspaceReviewsShellControls({
  t,
  locale,
}: WorkspaceReviewsShellControlsProps) {
  const {
    reviewSort,
    setReviewSort,
    reviewRange,
    setReviewRange,
    resetReviewControls,
  } = useWorkspaceReviewControlsState();

  const sortLabel = reviewSort === 'top'
    ? (locale === 'de' ? 'Top bewertet' : 'Top rated')
    : (locale === 'de' ? 'Neueste' : 'Latest');

  const controlsContent = (
    <div className="workspace-reviews-shell-controls">
      <div className="workspace-reviews-shell-controls__group workspace-reviews-shell-controls__group--range">
        <RangeActionToolbar
          groupLabel={locale === 'de' ? 'Zeitraum' : 'Time range'}
          options={WORKSPACE_REVIEW_RANGE_OPTIONS.map((option) => ({
            value: option,
            label: getWorkspaceReviewRangeLabel(option, locale),
          }))}
          value={reviewRange}
          onChange={setReviewRange}
        />
      </div>

      <div className="workspace-reviews-shell-controls__group workspace-reviews-shell-controls__group--sort">
        <RangeActionToolbar<ProviderReviewSort>
          groupLabel={t(I18N_KEYS.requestsPage.sortLabel)}
          options={[
            { value: 'latest', label: locale === 'de' ? 'Neueste' : 'Latest' },
            { value: 'top', label: locale === 'de' ? 'Top bewertet' : 'Top rated' },
          ]}
          value={reviewSort}
          onChange={setReviewSort}
        />
        <button
          type="button"
          className="panel-action icon-button--hint workspace-control-shell__action workspace-reviews-shell-controls__reset"
          aria-label={locale === 'de' ? 'Filter zurücksetzen' : 'Reset filters'}
          title={locale === 'de' ? 'Filter zurücksetzen' : 'Reset filters'}
          onClick={resetReviewControls}
        >
          <IconFilter />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="workspace-reviews-shell-controls__desktop">
        {controlsContent}
      </div>
      <WorkspaceMobileFiltersSheet
        title={locale === 'de' ? 'Bewertungsfilter' : 'Review filters'}
        closeLabel={t(I18N_KEYS.auth.closeDialog)}
        triggerLabel={locale === 'de' ? 'Filter' : 'Filters'}
        summary={(
          <>
            <span className="workspace-mobile-filters__summary-chip">{getWorkspaceReviewRangeLabel(reviewRange, locale)}</span>
            <span className="workspace-mobile-filters__summary-chip">{sortLabel}</span>
          </>
        )}
        className="workspace-reviews-shell-controls__mobile"
      >
        {controlsContent}
      </WorkspaceMobileFiltersSheet>
    </>
  );
}
