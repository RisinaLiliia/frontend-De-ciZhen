'use client';

import type { ComponentProps } from 'react';

import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { useWorkspacePrivateDataFlow } from '@/features/workspace/page/useWorkspacePrivateDataFlow';
import type { WorkspacePublicIntro } from '@/features/workspace';
import { buildWorkspaceLocalNavItems } from '@/features/workspace/shell/WorkspaceEnvironmentChrome';
import type { useWorkspaceContentData, useWorkspacePresentation } from '@/features/workspace';
import type {
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

type BuildPresentationArgs = {
  branch: WorkspaceBranchProps;
  data: WorkspacePrivateDataFlowResult;
  WorkspacePrivateIntroComponent: WorkspacePresentationArgs['WorkspacePrivateIntroComponent'];
  showQuickAction?: boolean;
  preferredRequestsRole?: 'customer' | 'provider' | null;
  privateState: Pick<
    ReturnType<typeof useWorkspacePrivateState>,
    | 'topProviders'
    | 'activityProgress'
    | 'personalNavItems'
    | 'insightText'
    | 'providerStatsPayload'
    | 'clientStatsPayload'
    | 'statsOrder'
  >;
};

type BuildPublicIntroArgs = {
  branch: WorkspaceBranchProps;
  data: Pick<
    WorkspacePrivateDataFlowResult,
    | 'activePublicSection'
    | 'activeWorkspaceTab'
    | 'workspacePrivateOverview'
    | 'allRequestsSummary'
    | 'publicCityActivity'
    | 'isPublicSummaryLoading'
    | 'isPublicSummaryError'
  >;
  personalNavItems: ReturnType<typeof useWorkspacePrivateState>['personalNavItems'];
};

type BuildPrivateViewModelArgs = {
  branch: WorkspaceBranchProps;
  data: Pick<
    WorkspacePrivateDataFlowResult,
    | 'activeWorkspaceTab'
    | 'activeStatusFilter'
    | 'setStatusFilter'
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
    | 'isMyRequestsLoading'
    | 'ownerRequestActions'
    | 'isMyOffersLoading'
    | 'isProviderContractsLoading'
    | 'isClientContractsLoading'
    | 'setFavoritesView'
    | 'favoriteRequests'
    | 'isFavoriteRequestsLoading'
    | 'isMyReviewsLoading'
    | 'myReviews'
  >;
  viewModelPatch: ReturnType<typeof useWorkspaceContentData>['viewModelPatch'];
  onPrimaryActionClick: WorkspacePrivateViewModelInput['onPrimaryActionClick'];
};

export function buildWorkspacePrivateContentDataArgs({
  branch,
  data,
}: BuildArgs): WorkspaceContentDataArgs {
  return {
    derivedArgs: {
      t: branch.t,
      activeStatusFilter: data.activeStatusFilter,
      activeWorkspaceTab: data.activeWorkspaceTab,
      activeFavoritesView: data.activeFavoritesView,
      myRequests: data.myRequests,
      myOffers: data.myOffers,
      myOfferRequestsById: data.myOfferRequestsById,
      allMyContracts: data.allMyContracts,
      favoriteRequests: data.favoriteRequests,
      favoriteProviders: data.favoriteProviders,
      isFavoriteRequestsLoading: data.isFavoriteRequestsLoading,
      isFavoriteProvidersLoading: data.isFavoriteProvidersLoading,
    },
    contractArgs: {
      isWorkspaceAuthed: branch.isWorkspaceAuthed,
      locale: branch.locale,
    },
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
  };
}

export function buildWorkspacePrivateStateArgs({
  branch,
  data,
}: BuildArgs): WorkspacePrivateStateArgs {
  return {
    t: branch.t,
    locale: branch.locale,
    isPersonalized: branch.isPersonalized,
    activeWorkspaceTab: data.activeWorkspaceTab,
    activePublicSection: data.activePublicSection,
    userName: branch.auth.user?.name,
    providers: data.providers,
    publicRequestsCount: data.platformRequestsTotal,
    publicProvidersCount: data.allRequestsSummary?.totalActiveProviders ?? data.providers.length,
    publicStatsCount: data.platformRequestsTotal,
    workspacePrivateOverview: data.workspacePrivateOverview,
    setWorkspaceTab: data.setWorkspaceTab,
    markPublicRequestsSeen: data.markPublicRequestsSeen,
    guestLoginHref: data.guestLoginHref,
    onGuestLockedAction: data.onGuestLockedAction,
    formatNumber: data.formatNumber,
    chartMonthLabel: data.chartMonthLabel,
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
    personalNavItems: buildWorkspaceLocalNavItems(privateState.personalNavItems),
    hideNavBadges: data.activePublicSection === 'stats',
    insightText: privateState.insightText,
    activityProgress: privateState.activityProgress,
    statsOrder: privateState.statsOrder,
    providerStatsPayload: privateState.providerStatsPayload,
    clientStatsPayload: privateState.clientStatsPayload,
    createRequestHref: '/request/create',
    isProvidersLoading: data.isProvidersLoading,
    isProvidersError: data.isProvidersError,
    topProviders: privateState.topProviders,
    favoriteProviderIds: data.favoriteProviderIds,
    showQuickAction,
    preferredRequestsRole,
  };
}

export function buildWorkspacePublicIntroProps({
  branch,
  data,
  personalNavItems,
}: BuildPublicIntroArgs): ComponentProps<typeof WorkspacePublicIntro> {
  return {
    t: branch.t,
    locale: branch.locale,
    activePublicSection: data.activePublicSection,
    activeWorkspaceTab: data.activeWorkspaceTab,
    personalNavItems: buildWorkspaceLocalNavItems(personalNavItems),
    hideNavBadges: data.activePublicSection === 'stats',
    insightText: '',
    activityProgress: 0,
    cityActivity: data.publicCityActivity,
    summary: data.allRequestsSummary,
    isMapLoading: data.isPublicSummaryLoading,
    isMapError: data.isPublicSummaryError,
    hideDemandMapOnMobile: data.activePublicSection !== 'stats',
    quickActionHref: '/request/create',
    showQuickAction: data.activePublicSection !== 'stats',
    preferredRequestsRole: data.workspacePrivateOverview?.preferredRole ?? null,
  };
}

export function buildWorkspacePrivateViewModelInput({
  branch,
  data,
  viewModelPatch,
  onPrimaryActionClick,
}: BuildPrivateViewModelArgs): WorkspacePrivateViewModelInput {
  return {
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
    isMyRequestsLoading: data.isMyRequestsLoading,
    ownerRequestActions: data.ownerRequestActions,
    isMyOffersLoading: data.isMyOffersLoading,
    isProviderContractsLoading: data.isProviderContractsLoading,
    isClientContractsLoading: data.isClientContractsLoading,
    setFavoritesView: data.setFavoritesView,
    favoriteRequests: data.favoriteRequests,
    isFavoriteRequestsLoading: data.isFavoriteRequestsLoading,
    isMyReviewsLoading: data.isMyReviewsLoading,
    myReviews: data.myReviews,
  };
}
