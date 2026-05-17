'use client';

import { useDevRenderMetric } from '@/lib/perf/useDevRenderMetric';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePrivateBranchModel } from '@/features/workspace/page/useWorkspacePrivateBranchModel';
import {
  WorkspaceMobilePrimaryAction,
  WorkspacePageLayout,
} from '@/features/workspace';

export function WorkspacePrivateBranch(props: WorkspaceBranchProps) {
  const {
    t,
    locale,
    isAuthed,
    isWorkspaceAuthed,
  } = props;
  const {
    activePublicSection,
    activeWorkspaceTab,
    pendingFavoriteProviderIds,
    onToggleProviderFavorite,
    workspaceIntroNode,
    workspaceAsideBaseProps,
    asideTopSlot,
    preferredRequestsRole,
    overviewDecisionPanelRef,
    sectionModel,
    primaryAction,
    isLoading,
    overviewRequestsCount,
  } = useWorkspacePrivateBranchModel(props);

  useDevRenderMetric('workspace.private', () => ({
    isAuthed,
    activeWorkspaceTab,
    isLoading,
    overviewRequestsCount,
  }));

  return (
    <>
      <WorkspacePageLayout
        isWorkspacePublicSection={false}
        isWorkspaceAuthed={isWorkspaceAuthed}
        activePublicSection={activePublicSection}
        activeWorkspaceTab={activeWorkspaceTab}
        preferredRequestsRole={preferredRequestsRole}
        t={t}
        locale={locale}
        intro={workspaceIntroNode}
        sectionModel={sectionModel}
        asideTopSlot={asideTopSlot}
        overviewDecisionPanelRef={overviewDecisionPanelRef}
        workspaceAsideBaseProps={workspaceAsideBaseProps}
        pendingFavoriteProviderIds={pendingFavoriteProviderIds}
        onToggleProviderFavorite={onToggleProviderFavorite}
      />
      <WorkspaceMobilePrimaryAction
        isWorkspaceAuthed={isWorkspaceAuthed}
        activeWorkspaceTab={activeWorkspaceTab}
        href={primaryAction.href}
        label={primaryAction.label}
      />
    </>
  );
}
