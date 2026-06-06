'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { useDevRenderMetric } from '@/lib/perf/useDevRenderMetric';
import {
  WorkspaceMobilePrimaryAction,
  WorkspacePageLayout,
  useWorkspaceRouteState,
  type PublicWorkspaceSection,
  type WorkspaceTab,
} from '@/features/workspace';
import { WORKSPACE_PATH } from '@/features/workspace/orchestration/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import { useWorkspacePrivateBranchModel } from '@/features/workspace/orchestration/useWorkspacePrivateBranchModel';
import { useWorkspacePublicBranchModel } from '@/features/workspace/orchestration/useWorkspacePublicBranchModel';

type WorkspacePageClientProps = {
  activePublicSection?: PublicWorkspaceSection | null;
  activeWorkspaceTab?: WorkspaceTab | null;
};

function WorkspacePageShellContent({
  branch,
}: {
  branch: WorkspaceBranchProps;
}) {
  const isWorkspacePublicSection = branch.routeState.isWorkspacePublicSection;
  const publicModel = useWorkspacePublicBranchModel(branch, { enabled: isWorkspacePublicSection });
  const privateModel = useWorkspacePrivateBranchModel(branch, { enabled: !isWorkspacePublicSection });

  const privateRenderMetricPayload = React.useMemo(
    () => ({
      isAuthed: branch.isAuthed,
      activeWorkspaceTab: privateModel.activeWorkspaceTab,
      isLoading: privateModel.isLoading,
      overviewRequestsCount: privateModel.overviewRequestsCount,
    }),
    [
      branch.isAuthed,
      privateModel.activeWorkspaceTab,
      privateModel.isLoading,
      privateModel.overviewRequestsCount,
    ],
  );

  const renderMetric = isWorkspacePublicSection
    ? {
      scope: 'workspace.public',
      payload: publicModel.renderMetricPayload,
    }
    : {
      scope: 'workspace.private',
      payload: privateRenderMetricPayload,
    };

  useDevRenderMetric(renderMetric.scope, () => renderMetric.payload);

  const privateLayoutProps = React.useMemo(
    () => ({
      isWorkspacePublicSection: false,
      isWorkspaceAuthed: branch.isWorkspaceAuthed,
      activePublicSection: privateModel.activePublicSection,
      activeWorkspaceTab: privateModel.activeWorkspaceTab,
      preferredRequestsRole: privateModel.preferredRequestsRole,
      t: branch.t,
      locale: branch.locale,
      intro: privateModel.workspaceIntroNode,
      sectionModel: privateModel.sectionModel,
      asideTopSlot: privateModel.asideTopSlot,
      overviewDecisionPanelRef: privateModel.overviewDecisionPanelRef,
      workspaceAsideBaseProps: privateModel.workspaceAsideBaseProps,
      pendingFavoriteProviderIds: privateModel.pendingFavoriteProviderIds,
      onToggleProviderFavorite: privateModel.onToggleProviderFavorite,
    }),
    [
      branch.isWorkspaceAuthed,
      branch.locale,
      branch.t,
      privateModel.activePublicSection,
      privateModel.activeWorkspaceTab,
      privateModel.asideTopSlot,
      privateModel.onToggleProviderFavorite,
      privateModel.overviewDecisionPanelRef,
      privateModel.pendingFavoriteProviderIds,
      privateModel.preferredRequestsRole,
      privateModel.sectionModel,
      privateModel.workspaceAsideBaseProps,
      privateModel.workspaceIntroNode,
    ],
  );

  const activeLayoutProps = isWorkspacePublicSection
    ? publicModel.workspaceLayoutProps
    : privateLayoutProps;

  const shouldRenderPrivatePrimaryAction =
    !isWorkspacePublicSection &&
    privateModel.activePublicSection !== 'chat' &&
    privateModel.activePublicSection !== 'settings' &&
    privateModel.activePublicSection !== 'help';

  return (
    <>
      <WorkspacePageLayout {...activeLayoutProps} />
      {shouldRenderPrivatePrimaryAction ? (
        <WorkspaceMobilePrimaryAction
          isWorkspaceAuthed={branch.isWorkspaceAuthed}
          activeWorkspaceTab={privateModel.activeWorkspaceTab}
          href={privateModel.primaryAction.href}
          label={privateModel.primaryAction.label}
        />
      ) : null}
    </>
  );
}

function WorkspacePageView({
  activePublicSection: forcedPublicSection,
  activeWorkspaceTab: forcedWorkspaceTab,
}: WorkspacePageClientProps) {
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useI18n();
  const auth = useAuthSnapshot();
  const isAuthed = auth.status === 'authenticated';
  const isWorkspaceAuthed = isAuthed;
  const isPersonalized = isAuthed;

  const routeState = useWorkspaceRouteState({
    forcedPublicSection,
    forcedWorkspaceTab,
    isAuthed,
    searchParams,
    workspacePath: WORKSPACE_PATH,
    t,
  });

  return (
    <WorkspacePageShellContent
      branch={{
        t,
        locale,
        auth,
        isAuthed,
        isWorkspaceAuthed,
        isPersonalized,
        routeState,
      }}
    />
  );
}

export default function WorkspacePageClient(props: WorkspacePageClientProps) {
  return (
    <React.Suspense fallback={null}>
      <WorkspacePageView {...props} />
    </React.Suspense>
  );
}
