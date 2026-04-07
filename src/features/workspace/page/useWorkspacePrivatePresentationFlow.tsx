'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { buildRequestsListProps } from '@/components/requests/requestsListProps';
import { ActivityInsight } from '@/components/ui/ActivityInsight';
import { trackUXEvent } from '@/lib/analytics';
import { useSyncedPanelMinHeight } from '@/hooks/useSyncedPanelMinHeight';
import {
  RequestsPrivateActionRail,
  RequestsPrivateView,
  WorkspaceOverviewMain,
  WorkspaceOverviewInsightsPanel,
  WorkspacePublicDemandMapPanel,
  useWorkspaceStatisticsModel,
  useWorkspacePrivateState,
  useWorkspacePrivateViewModel,
} from '@/features/workspace/requests';
import {
  buildMyRequestsViewModel,
  buildMyRequestsViewModelFromResponse,
} from '@/features/workspace/requests/myRequestsView.model';
import {
  useWorkspaceContentData,
  useWorkspacePresentation,
  WorkspaceContent,
  WorkspacePrivateIntro,
  WorkspacePublicIntro,
} from '@/features/workspace';
import { WorkspaceContextFocusPanel } from '@/features/workspace/shell/WorkspaceEnvironmentChrome';
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
      preferredRequestsRole: data.workspacePrivateOverview?.preferredRole ?? null,
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
  const overviewOffersPanelRef = React.useRef<HTMLElement | null>(null);
  const overviewFocusPanelRef = React.useRef<HTMLElement | null>(null);
  const overviewMapMinHeight = useSyncedPanelMinHeight({
    sourceRef: overviewHeroRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const overviewInsightsMinHeight = useSyncedPanelMinHeight({
    sourceRef: overviewOffersPanelRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const overviewActionsMinHeight = useSyncedPanelMinHeight({
    sourceRef: overviewFocusPanelRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const overviewStatisticsModel = useWorkspaceStatisticsModel({ locale: branch.locale });

  const privateInsightTopSlot = !isOverviewMode && isWorkspaceAuthed && privateState.insightText ? (
    <section className="panel workspace-context-rail__panel workspace-context-rail__panel--insight">
      <span className="workspace-environment__eyebrow">
        {branch.locale === 'de' ? 'Arbeitslage' : 'Work snapshot'}
      </span>
      <ActivityInsight
        text={privateState.insightText}
        progressPercent={privateState.activityProgress}
      />
    </section>
  ) : null;

  const overviewRailTopSlot = isOverviewMode ? (
    <>
      <WorkspacePublicDemandMapPanel
        t={branch.t}
        locale={branch.locale}
        cityActivity={data.publicCityActivity}
        summary={data.allRequestsSummary}
        isLoading={data.isPublicSummaryLoading}
        isError={data.isPublicSummaryError}
        className="workspace-overview__rail-panel--map"
        onSelectCity={overviewStatisticsModel.setCityId}
        style={
          overviewMapMinHeight
            ? { minHeight: `${overviewMapMinHeight}px`, height: `${overviewMapMinHeight}px` }
            : undefined
        }
      />
      <WorkspaceOverviewInsightsPanel
        locale={branch.locale}
        currentSearch={currentSearch}
        statisticsModel={overviewStatisticsModel}
        style={
          overviewInsightsMinHeight
            ? { minHeight: `${overviewInsightsMinHeight}px`, height: `${overviewInsightsMinHeight}px` }
            : undefined
        }
      />
    </>
  ) : null;
  const overviewRailBottomSlot = isOverviewMode ? (
    <WorkspaceContextFocusPanel
      t={branch.t}
      locale={branch.locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
    />
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

  const isUnifiedPrivateRequests =
    data.activePublicSection === 'requests' &&
    data.requestsScope === 'my';
  const privateRequestsLoading = data.workspaceRequests
    ? data.isWorkspaceRequestsLoading || data.isMyRequestsLoading || data.isMyOfferRequestsLoading
    : data.isWorkspaceRequestsLoading
      || data.isMyRequestsLoading
      || data.isMyOffersLoading
      || data.isMyClientOffersLoading
      || data.isProviderContractsLoading
      || data.isClientContractsLoading
      || (data.activeRequestsRole === 'all' && data.isWorkspacePrivateOverviewLoading);
  const preferredRequestsRole = data.workspacePrivateOverview?.preferredRole ?? null;
  const effectiveRequestsRole = data.activeRequestsRole === 'all'
    ? preferredRequestsRole
    : data.activeRequestsRole;
  const privateRequestsModel = React.useMemo(
    () => {
      const serverModel = data.workspaceRequests
        ? buildMyRequestsViewModelFromResponse({
          response: data.workspaceRequests,
          myRequests: data.myRequests,
          myOfferRequestsById: data.myOfferRequestsById,
        })
        : null;

      if (serverModel) {
        return serverModel;
      }

      return buildMyRequestsViewModel({
        locale: branch.locale,
        role: effectiveRequestsRole ?? 'all',
        state: data.activeRequestsState,
        period: data.activeRequestsPeriod,
        sort: data.activeRequestsSort,
        myRequests: data.myRequests,
        myOffers: data.myOffers,
        myClientOffers: data.myClientOffers,
        myOfferRequestsById: data.myOfferRequestsById,
        myProviderContracts: data.myProviderContracts,
        myClientContracts: data.myClientContracts,
        cityById: data.cityById,
        categoryByKey: data.categoryByKey,
        serviceByKey: data.serviceByKey,
        formatDate: (value) => data.formatDate.format(new Date(value)),
      });
    },
    [
      data.activeRequestsSort,
      branch.locale,
      data.activeRequestsPeriod,
      data.activeRequestsState,
      data.categoryByKey,
      data.cityById,
      effectiveRequestsRole,
      data.formatDate,
      data.myClientContracts,
      data.myClientOffers,
      data.myOfferRequestsById,
      data.myOffers,
      data.myProviderContracts,
      data.myRequests,
      data.workspaceRequests,
      data.serviceByKey,
    ],
  );
  const privateAside = isUnifiedPrivateRequests ? (
    <div className="stack-md">
      {privateInsightTopSlot}
      {privateRequestsModel.response.sidePanel ? (
        <RequestsPrivateActionRail locale={branch.locale} rail={privateRequestsModel.response.sidePanel} />
      ) : null}
    </div>
  ) : undefined;

  const privateMain = isOverviewMode ? (
    <WorkspaceOverviewMain
      locale={branch.locale}
      t={branch.t}
      currentSearch={currentSearch}
      statisticsModel={overviewStatisticsModel}
      heroRef={overviewHeroRef}
      offersPanelRef={overviewOffersPanelRef}
      actionsStyle={overviewActionsMinHeight ? { minHeight: `${overviewActionsMinHeight}px` } : undefined}
      mobileRailTopSlot={overviewRailTopSlot}
      mobileRailBottomSlot={overviewRailBottomSlot}
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
  ) : isUnifiedPrivateRequests ? (
    <RequestsPrivateView
      t={branch.t}
      locale={branch.locale}
      isWorkspaceAuthed={branch.isWorkspaceAuthed}
      guestLoginHref={data.guestLoginHref}
      model={privateRequestsModel}
      isLoading={privateRequestsLoading}
      isError={false}
      listContext={{
        serviceByKey: data.serviceByKey,
        categoryByKey: data.categoryByKey,
        cityById: data.cityById,
        formatDate: data.formatDate,
        formatPrice: data.formatPrice,
        offersByRequest: data.offersByRequest,
        onSendOffer: data.onOpenOfferSheet,
        onEditOffer: data.onOpenOfferSheet,
        onWithdrawOffer: data.onWithdrawOffer,
        onOpenChatThread: data.onOpenChatThread,
        pendingOfferRequestId: data.pendingOfferRequestId,
        ownerRequestActions: data.ownerRequestActions,
      }}
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
    asideTopSlot: overviewRailTopSlot ?? privateInsightTopSlot,
    privateAside,
    preferredRequestsRole,
    overviewDecisionPanelRef: overviewFocusPanelRef,
    privateMain,
    primaryAction,
    isLoading,
    requestsCount,
  };
}
