'use client';

import type { ComponentProps } from 'react';

import { buildRequestsListProps } from '@/components/requests/requestsListProps';
import type { WorkspacePublicIntro } from '@/features/workspace/intro';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { useWorkspacePrivateDataFlow } from '@/features/workspace/page/useWorkspacePrivateDataFlow';
import type { useWorkspacePresentation } from '@/features/workspace';
import type {
  WorkspacePrivateOverviewState,
  useWorkspacePrivateState,
} from '@/features/workspace/requests';
import { isWorkspaceOverviewMode } from '@/features/workspace/shell/workspaceModes';

type WorkspacePrivateDataFlowResult = ReturnType<typeof useWorkspacePrivateDataFlow>;
type WorkspacePrivateStateArgs = Parameters<typeof useWorkspacePrivateState>[0];
type WorkspacePresentationArgs = Parameters<typeof useWorkspacePresentation>[0];

type BuildArgs = {
  branch: WorkspaceBranchProps;
  data: WorkspacePrivateDataFlowResult;
};

type BuildPresentationArgs = {
  branch: WorkspaceBranchProps;
  data: WorkspacePrivateDataFlowResult;
  WorkspacePrivateIntroComponent: WorkspacePresentationArgs['WorkspacePrivateIntroComponent'];
  preferredRequestsRole?: 'customer' | 'provider' | null;
  privateState: Pick<
    ReturnType<typeof useWorkspacePrivateState>,
    | 'topProviders'
    | 'preferredRequestsRole'
  >;
};

type BuildPublicIntroArgs = {
  branch: WorkspaceBranchProps;
  data: Pick<
    WorkspacePrivateDataFlowResult,
    | 'activePublicSection'
    | 'activeWorkspaceTab'
    | 'allRequestsSummary'
    | 'publicCityActivity'
    | 'isPublicSummaryLoading'
    | 'isPublicSummaryError'
  > & {
    preferredRequestsRole?: 'customer' | 'provider' | null;
  };
};

type BuildWorkspacePublicSummaryViewArgs = Pick<
  WorkspacePrivateDataFlowResult,
  'allRequestsSummary' | 'publicCityActivity' | 'isPublicSummaryLoading' | 'isPublicSummaryError'
>;

type ResolveWorkspaceEffectiveRequestsRoleArgs = {
  activeRequestsRole: WorkspacePrivateDataFlowResult['activeRequestsRole'];
  preferredRequestsRole: 'customer' | 'provider' | null;
};

type ResolveWorkspacePrivateRequestsLoadingArgs = {
  workspaceRequests: WorkspacePrivateDataFlowResult['workspaceRequests'];
  isWorkspaceRequestsLoading: WorkspacePrivateDataFlowResult['isWorkspaceRequestsLoading'];
  activeRequestsRole: WorkspacePrivateDataFlowResult['activeRequestsRole'];
  isWorkspacePrivateRequestsFallbackLoading: WorkspacePrivateDataFlowResult['isWorkspacePrivateRequestsFallbackLoading'];
};

type ResolveWorkspacePrivateRenderModesArgs = {
  activePublicSection: WorkspacePrivateDataFlowResult['activePublicSection'];
  activeWorkspaceTab: WorkspacePrivateDataFlowResult['activeWorkspaceTab'];
  pathname: string;
  sectionParam: string | null;
  hasExplicitWorkspaceTab: boolean;
  requestsScope: WorkspacePrivateDataFlowResult['requestsScope'];
};

type BuildWorkspacePrivateOverviewListPropsArgs = {
  branch: WorkspaceBranchProps;
  data: Pick<
    WorkspacePrivateDataFlowResult,
    | 'overviewRequestsListState'
    | 'serviceByKey'
    | 'categoryByKey'
    | 'cityById'
    | 'formatDate'
    | 'formatPrice'
    | 'offersByRequest'
    | 'favoriteRequestIds'
    | 'onToggleRequestFavorite'
    | 'onOpenOfferSheet'
    | 'onWithdrawOffer'
    | 'onOpenChatThread'
    | 'pendingOfferRequestId'
    | 'pendingFavoriteRequestIds'
  >;
  isOverviewMode: boolean;
};

export function resolveWorkspacePrivateRenderModes({
  activePublicSection,
  activeWorkspaceTab,
  pathname,
  sectionParam,
  hasExplicitWorkspaceTab,
  requestsScope,
}: ResolveWorkspacePrivateRenderModesArgs) {
  const isOverviewMode = isWorkspaceOverviewMode({
    activePublicSection,
    activeWorkspaceTab,
    pathname,
    sectionParam,
    hasExplicitWorkspaceTab,
  });
  const isUnifiedPrivateRequests =
    activePublicSection === 'requests' &&
    requestsScope === 'my';

  return {
    isOverviewMode,
    isUnifiedPrivateRequests,
  };
}

export function buildWorkspacePrivateOverviewListPropsArgs({
  branch,
  data,
  isOverviewMode,
}: BuildWorkspacePrivateOverviewListPropsArgs): Parameters<typeof buildRequestsListProps>[0] {
  if (!isOverviewMode) {
    return {
      t: branch.t,
      locale: branch.locale,
      requests: [],
      isLoading: false,
      isError: false,
      serviceByKey: data.serviceByKey,
      categoryByKey: data.categoryByKey,
      cityById: data.cityById,
      formatDate: data.formatDate,
      formatPrice: data.formatPrice,
    };
  }

  return {
    t: branch.t,
    locale: branch.locale,
    requests: data.overviewRequestsListState.requests,
    isLoading: data.overviewRequestsListState.isLoading,
    isError: data.overviewRequestsListState.isError,
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
  };
}

export function buildWorkspacePrivateStateArgs({
  branch,
  data,
}: BuildArgs): WorkspacePrivateStateArgs {
  const privateOverviewState: WorkspacePrivateOverviewState | null =
    data.privateOverviewState
      ? {
        ...data.privateOverviewState,
        preferredRequestsRole:
          data.activePublicSection === 'requests' &&
          data.requestsScope === 'my' &&
          data.activeRequestsRole !== 'all'
            ? data.activeRequestsRole
            : data.privateOverviewState.preferredRequestsRole,
      }
      : null;

  return {
    t: branch.t,
    locale: branch.locale,
    isPersonalized: branch.isPersonalized,
    activeWorkspaceTab: data.activeWorkspaceTab,
    activePublicSection: data.activePublicSection,
    requestsScope: data.requestsScope,
    userName: branch.auth.user?.name,
    providers: data.providerDirectoryState.items,
    publicRequestsCount: data.platformRequestsTotal,
    publicProvidersCount: data.allRequestsSummary?.totalActiveProviders ?? data.providerDirectoryState.items.length,
    publicStatsCount: data.platformRequestsTotal,
    privateOverviewState,
    setWorkspaceTab: data.setWorkspaceTab,
    markPublicRequestsSeen: data.markPublicRequestsSeen,
    guestLoginHref: data.guestLoginHref,
    onGuestLockedAction: data.onGuestLockedAction,
    formatNumber: data.formatNumber,
  };
}

export function buildWorkspacePrivatePresentationArgs({
  branch,
  data,
  WorkspacePrivateIntroComponent,
  preferredRequestsRole = null,
  privateState,
}: BuildPresentationArgs): WorkspacePresentationArgs {
  return {
    t: branch.t,
    locale: branch.locale,
    activePublicSection: data.activePublicSection,
    activeWorkspaceTab: data.activeWorkspaceTab,
    WorkspacePrivateIntroComponent,
    isProvidersLoading: data.providerDirectoryState.isLoading,
    isProvidersError: data.providerDirectoryState.isError,
    topProviders: privateState.topProviders,
    favoriteProviderIds: data.favoriteProvidersState.ids,
    preferredRequestsRole: preferredRequestsRole ?? privateState.preferredRequestsRole,
  };
}

export function buildWorkspacePublicIntroProps({
  branch,
  data,
}: BuildPublicIntroArgs): ComponentProps<typeof WorkspacePublicIntro> {
  const publicSummaryView = buildWorkspacePublicSummaryView(data);

  return {
    t: branch.t,
    locale: branch.locale,
    activePublicSection: data.activePublicSection,
    activeWorkspaceTab: data.activeWorkspaceTab,
    ...publicSummaryView,
    hideDemandMapOnMobile: data.activePublicSection !== 'stats',
    quickActionHref: '/request/create',
    showQuickAction: data.activePublicSection !== 'stats' && data.activePublicSection !== 'requests',
    preferredRequestsRole: data.preferredRequestsRole ?? null,
  };
}

export function buildWorkspacePublicSummaryView(
  data: BuildWorkspacePublicSummaryViewArgs,
) {
  return {
    cityActivity: data.publicCityActivity,
    summary: data.allRequestsSummary,
    isMapLoading: data.isPublicSummaryLoading,
    isMapError: data.isPublicSummaryError,
  };
}

export function resolveWorkspaceEffectiveRequestsRole({
  activeRequestsRole,
  preferredRequestsRole,
}: ResolveWorkspaceEffectiveRequestsRoleArgs) {
  return activeRequestsRole === 'all'
    ? preferredRequestsRole
    : activeRequestsRole;
}

export function resolveWorkspacePrivateRequestsLoading({
  workspaceRequests,
  isWorkspaceRequestsLoading,
  activeRequestsRole,
  isWorkspacePrivateRequestsFallbackLoading,
}: ResolveWorkspacePrivateRequestsLoadingArgs) {
  if (workspaceRequests) {
    return isWorkspaceRequestsLoading;
  }

  return isWorkspaceRequestsLoading || (
    activeRequestsRole === 'all' &&
    isWorkspacePrivateRequestsFallbackLoading
  );
}
