'use client';

import type { ComponentProps } from 'react';

import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { useWorkspacePrivateDataFlow } from '@/features/workspace/page/useWorkspacePrivateDataFlow';
import type { WorkspacePublicIntro } from '@/features/workspace';
import type { useWorkspaceContentData, useWorkspacePresentation } from '@/features/workspace';
import type {
  WorkspacePrivateOverviewState,
  useWorkspacePrivateState,
  useWorkspacePrivateViewModel,
} from '@/features/workspace/requests';

type WorkspacePrivateDataFlowResult = ReturnType<typeof useWorkspacePrivateDataFlow>;
type WorkspaceContentDataArgs = Parameters<typeof useWorkspaceContentData>[0];
type WorkspacePrivateStateArgs = Parameters<typeof useWorkspacePrivateState>[0];
type WorkspacePresentationArgs = Parameters<typeof useWorkspacePresentation>[0];
type WorkspacePrivateViewModelInput = Parameters<typeof useWorkspacePrivateViewModel>[0];

type BuildArgs = {
  branch: WorkspaceBranchProps;
  data: WorkspacePrivateDataFlowResult;
};

type BuildContentDataArgs = BuildArgs & {
  enabled?: boolean;
};

type BuildPresentationArgs = {
  branch: WorkspaceBranchProps;
  data: WorkspacePrivateDataFlowResult;
  WorkspacePrivateIntroComponent: WorkspacePresentationArgs['WorkspacePrivateIntroComponent'];
  showQuickAction?: boolean;
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

type BuildPrivateViewModelArgs = {
  branch: WorkspaceBranchProps;
  data: Pick<
    WorkspacePrivateDataFlowResult,
    | 'activeWorkspaceTab'
    | 'activeStatusFilter'
    | 'setStatusFilter'
    | 'myRequestsState'
    | 'offersByRequest'
    | 'favoriteRequestIds'
    | 'onToggleRequestFavorite'
    | 'onOpenOfferSheet'
    | 'onWithdrawOffer'
    | 'onOpenChatThread'
    | 'pendingOfferRequestId'
    | 'pendingFavoriteRequestIds'
    | 'serviceByKey'
    | 'categoryByKey'
    | 'cityById'
    | 'formatDate'
    | 'formatPrice'
    | 'ownerRequestActions'
    | 'isMyOffersLoading'
    | 'contractsState'
    | 'setFavoritesView'
    | 'favoriteRequests'
    | 'isFavoriteRequestsLoading'
    | 'reviewsState'
  >;
  viewModelPatch: ReturnType<typeof useWorkspaceContentData>['viewModelPatch'];
  onPrimaryActionClick: WorkspacePrivateViewModelInput['onPrimaryActionClick'];
  enabled?: WorkspacePrivateViewModelInput['enabled'];
};

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

export function shouldBuildWorkspacePrivateContractRequests(
  activeWorkspaceTab: WorkspacePrivateDataFlowResult['activeWorkspaceTab'],
) {
  return activeWorkspaceTab === 'completed-jobs';
}

export function shouldBuildWorkspacePrivateFavoriteProviderCards(
  activeWorkspaceTab: WorkspacePrivateDataFlowResult['activeWorkspaceTab'],
) {
  return activeWorkspaceTab === 'favorites';
}

export function buildWorkspacePrivateContentDataArgs({
  branch,
  data,
  enabled,
}: BuildContentDataArgs): WorkspaceContentDataArgs {
  return {
    enabled,
    derivedArgs: {
      t: branch.t,
      activeStatusFilter: data.activeStatusFilter,
      activeWorkspaceTab: data.activeWorkspaceTab,
      activeFavoritesView: data.activeFavoritesView,
      myRequests: data.myRequestsState.items,
      myOffers: data.myOffers,
      myOfferRequestsById: data.myOfferRequestsById,
      allMyContracts: data.contractsState.allContracts,
      favoriteRequests: data.favoriteRequests,
      favoriteProviders: data.favoriteProviders,
      isFavoriteRequestsLoading: data.isFavoriteRequestsLoading,
      isFavoriteProvidersLoading: data.isFavoriteProvidersLoading,
    },
    contractArgs: {
      isWorkspaceAuthed: branch.isWorkspaceAuthed,
      locale: branch.locale,
    },
    contractRequestsEnabled: shouldBuildWorkspacePrivateContractRequests(
      data.activeWorkspaceTab,
    ),
    cardsArgs: {
      t: branch.t,
      locale: branch.locale,
      favoriteProviders: data.favoriteProviders,
      favoriteProviderLookup: data.favoriteProviderLookup,
      pendingFavoriteProviderIds: data.pendingFavoriteProviderIds,
      onToggleProviderFavorite: data.onToggleProviderFavorite,
      favoriteProviderRoleLabelById: data.favoriteProviderRoleLabelById,
      favoriteProviderCityLabelById: data.favoriteProviderCityLabelById,
    },
    favoriteProviderCardsEnabled: shouldBuildWorkspacePrivateFavoriteProviderCards(
      data.activeWorkspaceTab,
    ),
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
    providers: data.providers,
    publicRequestsCount: data.platformRequestsTotal,
    publicProvidersCount: data.allRequestsSummary?.totalActiveProviders ?? data.providers.length,
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
  showQuickAction = data.activePublicSection !== 'stats',
  preferredRequestsRole = null,
  privateState,
}: BuildPresentationArgs): WorkspacePresentationArgs {
  return {
    t: branch.t,
    locale: branch.locale,
    activePublicSection: data.activePublicSection,
    activeWorkspaceTab: data.activeWorkspaceTab,
    WorkspacePrivateIntroComponent,
    createRequestHref: '/request/create',
    isProvidersLoading: data.isProvidersLoading,
    isProvidersError: data.isProvidersError,
    topProviders: privateState.topProviders,
    favoriteProviderIds: data.favoriteProviderIds,
    showQuickAction,
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

export function buildWorkspacePrivateViewModelInput({
  branch,
  data,
  viewModelPatch,
  onPrimaryActionClick,
  enabled,
}: BuildPrivateViewModelArgs): WorkspacePrivateViewModelInput {
  return {
    enabled,
    t: branch.t,
    locale: branch.locale,
    isWorkspaceAuthed: branch.isWorkspaceAuthed,
    activeWorkspaceTab: data.activeWorkspaceTab,
    ...viewModelPatch,
    onPrimaryActionClick,
    activeStatusFilter: data.activeStatusFilter,
    setStatusFilter: data.setStatusFilter,
    isPersonalized: branch.isPersonalized,
    offersByRequest: data.offersByRequest,
    favoriteRequestIds: data.favoriteRequestIds,
    onToggleRequestFavorite: data.onToggleRequestFavorite,
    onOpenOfferSheet: data.onOpenOfferSheet,
    onWithdrawOffer: data.onWithdrawOffer,
    onOpenChatThread: data.onOpenChatThread,
    pendingOfferRequestId: data.pendingOfferRequestId,
    pendingFavoriteRequestIds: data.pendingFavoriteRequestIds,
    serviceByKey: data.serviceByKey,
    categoryByKey: data.categoryByKey,
    cityById: data.cityById,
    formatDate: data.formatDate,
    formatPrice: data.formatPrice,
    isMyRequestsLoading: data.myRequestsState.isLoading,
    ownerRequestActions: data.ownerRequestActions,
    isMyOffersLoading: data.isMyOffersLoading,
    isProviderContractsLoading: data.contractsState.isProviderLoading,
    isClientContractsLoading: data.contractsState.isClientLoading,
    setFavoritesView: data.setFavoritesView,
    favoriteRequests: data.favoriteRequests,
    isFavoriteRequestsLoading: data.isFavoriteRequestsLoading,
    isMyReviewsLoading: data.reviewsState.isLoading,
    myReviews: data.reviewsState.items,
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
