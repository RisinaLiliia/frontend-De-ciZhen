'use client';

import { useDevRenderMetric } from '@/lib/perf/useDevRenderMetric';
import {
  EMPTY_EXPLORE,
} from '@/features/workspace/page/workspacePage.constants';
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
    privateMain,
    primaryAction,
    isLoading,
    requestsCount,
  } = useWorkspacePrivateBranchModel(props);

  useDevRenderMetric('workspace.private', () => ({
    isAuthed,
    activeWorkspaceTab,
    isLoading,
    requestsCount,
  }));

  return (
    <>
      <WorkspacePageLayout
        isWorkspacePublicSection={false}
        isWorkspaceAuthed={isWorkspaceAuthed}
        activePublicSection={activePublicSection}
        t={t}
        locale={locale}
        intro={workspaceIntroNode}
        explore={EMPTY_EXPLORE}
        privateMain={privateMain}
        publicMain={null}
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
