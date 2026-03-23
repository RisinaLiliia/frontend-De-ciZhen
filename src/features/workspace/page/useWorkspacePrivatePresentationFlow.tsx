'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { trackUXEvent } from '@/lib/analytics';
import {
  WorkspaceOverviewMain,
  WorkspacePublicDemandMapPanel,
  useWorkspacePrivateState,
  useWorkspacePrivateViewModel,
} from '@/features/workspace/requests';
import {
  useWorkspaceContentData,
  useWorkspacePresentation,
  WorkspaceContent,
  WorkspacePrivateIntro,
  WorkspacePublicIntro,
} from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePrivateDataFlow } from '@/features/workspace/page/useWorkspacePrivateDataFlow';
import { isWorkspaceTab } from '@/features/workspace/requests';
import { isWorkspaceOverviewMode } from '@/features/workspace/shell/workspaceModes';
import {
  buildWorkspacePrivateContentDataArgs,
  buildWorkspacePrivatePresentationArgs,
  buildWorkspacePrivateStateArgs,
  buildWorkspacePrivateViewModelInput,
  buildWorkspacePublicIntroProps,
} from '@/features/workspace/page/workspacePrivatePresentation.model';

type UseWorkspacePrivatePresentationFlowParams = {
  branch: WorkspaceBranchProps;
  data: ReturnType<typeof useWorkspacePrivateDataFlow>;
};

export function useWorkspacePrivatePresentationFlow({
  branch,
  data,
}: UseWorkspacePrivatePresentationFlowParams) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isWorkspaceAuthed } = branch;
  const { activePublicSection, activeWorkspaceTab, pendingFavoriteProviderIds, onToggleProviderFavorite, isLoading, requestsCount } = data;
  const isOverviewMode =
    isWorkspaceOverviewMode({
      activePublicSection,
      activeWorkspaceTab,
      pathname,
      sectionParam: searchParams.get('section'),
      hasExplicitWorkspaceTab: isWorkspaceTab(searchParams.get('tab')),
    });

  const { viewModelPatch, primaryAction } = useWorkspaceContentData(
    buildWorkspacePrivateContentDataArgs({ branch, data }),
  );

  const privateState = useWorkspacePrivateState(
    buildWorkspacePrivateStateArgs({ branch, data }),
  );

  const { workspaceIntroNode, workspaceAsideBaseProps } = useWorkspacePresentation(
    buildWorkspacePrivatePresentationArgs({
      branch,
      data,
      WorkspacePrivateIntroComponent: WorkspacePrivateIntro,
      showQuickAction: data.activePublicSection !== 'stats' && !isOverviewMode,
      privateState,
    }),
  );

  const resolvedWorkspaceIntroNode = isWorkspaceAuthed
    ? workspaceIntroNode
    : (
      (() => {
        const publicIntroProps = buildWorkspacePublicIntroProps({
          branch,
          data,
          personalNavItems: privateState.personalNavItems,
        });

        return (
      <WorkspacePublicIntro
            {...publicIntroProps}
            showDemandMap={isOverviewMode ? false : publicIntroProps.showDemandMap}
            showQuickAction={isOverviewMode ? false : publicIntroProps.showQuickAction}
          />
        );
      })()
    );

  const asideTopSlot = isOverviewMode ? (
    <>
      <WorkspacePublicDemandMapPanel
        t={branch.t}
        locale={branch.locale}
        cityActivity={data.publicCityActivity}
        summary={data.allRequestsSummary}
        isLoading={data.isPublicSummaryLoading}
        isError={data.isPublicSummaryError}
      />
      <section className="panel stack-sm" aria-label="Workspace quick action">
        <CreateRequestCard href={primaryAction.href} />
      </section>
    </>
  ) : null;

  const onPrimaryActionClick = React.useCallback(
    () => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab }),
    [activeWorkspaceTab],
  );

  const { workspaceContentProps } = useWorkspacePrivateViewModel(
    buildWorkspacePrivateViewModelInput({
      branch,
      data,
      viewModelPatch,
      onPrimaryActionClick,
    }),
  );

  const privateMain = isOverviewMode ? (
    <WorkspaceOverviewMain
      locale={branch.locale}
      primaryAction={primaryAction}
      onPrimaryActionClick={onPrimaryActionClick}
      insightText={privateState.insightText}
      activityProgress={privateState.activityProgress}
      providerStatsPayload={privateState.providerStatsPayload}
      clientStatsPayload={privateState.clientStatsPayload}
      myRequestsListProps={workspaceContentProps.myRequestsListProps}
      myOffersListProps={workspaceContentProps.myOffersListProps}
      topProviders={workspaceAsideBaseProps.providers}
      topProvidersTitle={workspaceAsideBaseProps.title}
      topProvidersSubtitle={workspaceAsideBaseProps.subtitle}
      topProvidersCtaLabel={workspaceAsideBaseProps.ctaLabel}
      topProvidersCtaHref="/workspace?section=providers"
      favoriteProviderIds={workspaceAsideBaseProps.favoriteProviderIds}
      pendingFavoriteProviderIds={pendingFavoriteProviderIds}
      onToggleProviderFavorite={onToggleProviderFavorite}
    />
  ) : (
    <WorkspaceContent {...workspaceContentProps} />
  );

  return {
    activePublicSection,
    activeWorkspaceTab,
    pendingFavoriteProviderIds,
    onToggleProviderFavorite,
    workspaceIntroNode: resolvedWorkspaceIntroNode,
    workspaceAsideBaseProps,
    asideTopSlot,
    privateMain,
    primaryAction,
    isLoading,
    requestsCount,
  };
}
