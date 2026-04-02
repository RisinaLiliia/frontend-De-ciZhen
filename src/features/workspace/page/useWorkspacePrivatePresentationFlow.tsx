'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { buildRequestsListProps } from '@/components/requests/requestsListProps';
import { trackUXEvent } from '@/lib/analytics';
import { useSyncedPanelMinHeight } from '@/hooks/useSyncedPanelMinHeight';
import {
  WorkspaceOverviewMain,
  WorkspaceOverviewInsightsPanel,
  WorkspacePublicDemandMapPanel,
  useWorkspaceStatisticsModel,
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
  const currentSearch = searchParams.toString();
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

  const overviewHeroRef = React.useRef<HTMLDivElement | null>(null);
  const overviewGridRef = React.useRef<HTMLDivElement | null>(null);
  const overviewMapMinHeight = useSyncedPanelMinHeight({
    sourceRef: overviewHeroRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const overviewInsightsMinHeight = useSyncedPanelMinHeight({
    sourceRef: overviewGridRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const overviewStatisticsModel = useWorkspaceStatisticsModel({ locale: branch.locale });

  const asideTopSlot = isOverviewMode ? (
    <>
      <WorkspacePublicDemandMapPanel
        t={branch.t}
        locale={branch.locale}
        cityActivity={data.publicCityActivity}
        summary={data.allRequestsSummary}
        isLoading={data.isPublicSummaryLoading}
        isError={data.isPublicSummaryError}
        onSelectCity={overviewStatisticsModel.setCityId}
        style={overviewMapMinHeight ? { minHeight: `${overviewMapMinHeight}px` } : undefined}
      />
      <WorkspaceOverviewInsightsPanel
        locale={branch.locale}
        currentSearch={currentSearch}
        statisticsModel={overviewStatisticsModel}
        style={overviewInsightsMinHeight ? { minHeight: `${overviewInsightsMinHeight}px` } : undefined}
      />
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

  const activeOffersListProps = React.useMemo(
    () =>
      buildRequestsListProps({
        t: branch.t,
        locale: branch.locale,
        requests: data.publicRequests,
        isLoading: data.isLoading,
        isError: data.isPublicRequestsError,
        serviceByKey: data.serviceByKey,
        categoryByKey: data.categoryByKey,
        cityById: data.cityById,
        formatDate: data.formatDate,
        formatPrice: data.formatPrice,
        enableOfferActions: true,
        hideRecurringBadge: branch.isPersonalized,
        showFavoriteButton: true,
        offersByRequest: data.offersByRequest,
        favoriteRequestIds: data.favoriteRequestIds,
        onToggleFavorite: data.onToggleRequestFavorite,
        onSendOffer: data.onOpenOfferSheet,
        onEditOffer: data.onOpenOfferSheet,
        onWithdrawOffer: data.onWithdrawOffer,
        onOpenChatThread: data.onOpenChatThread,
        pendingOfferRequestId: data.pendingOfferRequestId,
        pendingFavoriteRequestIds: data.pendingFavoriteRequestIds,
      }),
    [
      branch.isPersonalized,
      branch.locale,
      branch.t,
      data.categoryByKey,
      data.cityById,
      data.favoriteRequestIds,
      data.formatDate,
      data.formatPrice,
      data.isLoading,
      data.isPublicRequestsError,
      data.offersByRequest,
      data.onOpenChatThread,
      data.onOpenOfferSheet,
      data.onToggleRequestFavorite,
      data.onWithdrawOffer,
      data.pendingFavoriteRequestIds,
      data.pendingOfferRequestId,
      data.publicRequests,
      data.serviceByKey,
    ],
  );

  const privateMain = isOverviewMode ? (
    <WorkspaceOverviewMain
      locale={branch.locale}
      t={branch.t}
      currentSearch={currentSearch}
      statisticsModel={overviewStatisticsModel}
      heroRef={overviewHeroRef}
      gridRef={overviewGridRef}
      primaryAction={primaryAction}
      onPrimaryActionClick={onPrimaryActionClick}
      activeOffersListProps={activeOffersListProps}
      topProviders={workspaceAsideBaseProps.providers}
      topProvidersTitle={workspaceAsideBaseProps.title}
      topProvidersSubtitle={workspaceAsideBaseProps.subtitle}
      topProvidersCtaLabel={workspaceAsideBaseProps.ctaLabel}
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
