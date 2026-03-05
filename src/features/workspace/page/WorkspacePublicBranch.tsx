'use client';

import { useDevRenderMetric } from '@/lib/perf/useDevRenderMetric';
import { WorkspacePageLayout } from '@/features/workspace';
import {
  EMPTY_ASIDE_BASE_PROPS,
  EMPTY_PROVIDER_IDS,
  NOOP_PROVIDER_TOGGLE,
} from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePublicBranchModel } from '@/features/workspace/page/useWorkspacePublicBranchModel';

export function WorkspacePublicBranch(props: WorkspaceBranchProps) {
  const {
    t,
    locale,
    isAuthed,
    isWorkspaceAuthed,
  } = props;
  const {
    activePublicSection,
    activeWorkspaceTab,
    platformRequestsTotal,
    localeTag,
    exploreWithSeed,
    workspaceIntroNode,
  } = useWorkspacePublicBranchModel(props);

  useDevRenderMetric('workspace.public', () => ({
    isAuthed,
    activeWorkspaceTab,
    activePublicSection,
    platformRequestsTotal,
    localeTag,
  }));

  return (
    <WorkspacePageLayout
      isWorkspacePublicSection={true}
      isWorkspaceAuthed={isWorkspaceAuthed}
      activePublicSection={activePublicSection}
      t={t}
      locale={locale}
      intro={workspaceIntroNode}
      explore={exploreWithSeed}
      privateMain={null}
      publicMain={null}
      workspaceAsideBaseProps={EMPTY_ASIDE_BASE_PROPS}
      pendingFavoriteProviderIds={EMPTY_PROVIDER_IDS}
      onToggleProviderFavorite={NOOP_PROVIDER_TOGGLE}
    />
  );
}
