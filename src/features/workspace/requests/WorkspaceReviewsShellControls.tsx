'use client';

import { IconFilter } from '@/components/ui/icons/icons';
import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import type { ProviderReviewSort } from '@/features/providers/publicProfile/useProviderReviewsModel';
import { WorkspaceMobileFiltersSheet } from '@/features/workspace/requests/WorkspaceMobileFiltersSheet';
import { WorkspaceButton } from '@/features/workspace/shared/WorkspaceButton';
import { useWorkspaceReviewControlsState } from '@/features/workspace/requests/useWorkspaceReviewControlsState';
import {
  getWorkspaceReviewRangeLabel,
  WORKSPACE_REVIEW_RANGE_OPTIONS,
} from '@/features/workspace/requests/workspaceReviewControls';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type WorkspaceReviewsShellControlsProps = {
  t: (key: I18nKey) => string;
};

export function WorkspaceReviewsShellControls({
  t,
}: WorkspaceReviewsShellControlsProps) {
  const {
    reviewSort,
    setReviewSort,
    reviewRange,
    setReviewRange,
    resetReviewControls,
  } = useWorkspaceReviewControlsState();

  const sortLabel = reviewSort === 'top'
    ? t(I18N_KEYS.workspace.reviewSortTop)
    : t(I18N_KEYS.workspace.reviewSortLatest);

  const controlsContent = (
    <div className="workspace-reviews-shell-controls">
      <div className="workspace-reviews-shell-controls__group workspace-reviews-shell-controls__group--range">
        <RangeActionToolbar
          groupLabel={t(I18N_KEYS.workspace.rangeAriaLabel)}
          options={WORKSPACE_REVIEW_RANGE_OPTIONS.map((option) => ({
            value: option,
            label: getWorkspaceReviewRangeLabel(option, t),
          }))}
          value={reviewRange}
          onChange={setReviewRange}
        />
      </div>

      <div className="workspace-reviews-shell-controls__group workspace-reviews-shell-controls__group--sort">
        <RangeActionToolbar<ProviderReviewSort>
          groupLabel={t(I18N_KEYS.requestsPage.sortLabel)}
          options={[
            { value: 'latest', label: t(I18N_KEYS.workspace.reviewSortLatest) },
            { value: 'top', label: t(I18N_KEYS.workspace.reviewSortTop) },
          ]}
          value={reviewSort}
          onChange={setReviewSort}
        />
        <WorkspaceButton
          type="button"
          variant="ghost"
          className="panel-action icon-button--hint workspace-control-shell__action workspace-reviews-shell-controls__reset"
          aria-label={t(I18N_KEYS.requestsPage.clearFilters)}
          title={t(I18N_KEYS.requestsPage.clearFilters)}
          onClick={resetReviewControls}
        >
          <IconFilter />
        </WorkspaceButton>
      </div>
    </div>
  );

  return (
    <>
      <div className="workspace-reviews-shell-controls__desktop">
        {controlsContent}
      </div>
      <WorkspaceMobileFiltersSheet
        title={t(I18N_KEYS.workspace.reviewFiltersTitle)}
        closeLabel={t(I18N_KEYS.auth.closeDialog)}
        triggerLabel={t(I18N_KEYS.requestsPage.filterRegionLabel)}
        summary={(
          <>
            <span className="workspace-mobile-filters__summary-chip">{getWorkspaceReviewRangeLabel(reviewRange, t)}</span>
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
