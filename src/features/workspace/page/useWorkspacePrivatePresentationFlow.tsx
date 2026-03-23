'use client';

import * as React from 'react';

import { trackUXEvent } from '@/lib/analytics';
import {
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

type UseWorkspacePrivatePresentationFlowParams = {
  branch: WorkspaceBranchProps;
  data: ReturnType<typeof useWorkspacePrivateDataFlow>;
};

export function useWorkspacePrivatePresentationFlow({
  branch,
  data,
}: UseWorkspacePrivatePresentationFlowParams) {
  const { t, locale, auth, isPersonalized, isWorkspaceAuthed } = branch;

  const {
    activePublicSection,
    activeWorkspaceTab,
    activeStatusFilter,
    activeFavoritesView,
    guestLoginHref,
    onGuestLockedAction,
    platformRequestsTotal,
    allRequestsSummary,
    publicCityActivity,
    isPublicSummaryLoading,
    isPublicSummaryError,
    providers,
    isProvidersLoading,
    isProvidersError,
    workspacePrivateOverview,
    myOffers,
    myRequests,
    myOfferRequestsById,
    allMyContracts,
    favoriteRequests,
    favoriteProviders,
    favoriteProviderIds,
    myReviews,
    isFavoriteRequestsLoading,
    isFavoriteProvidersLoading,
    pendingFavoriteProviderIds,
    onToggleProviderFavorite,
    favoriteProviderLookup,
    favoriteProviderRoleLabelById,
    favoriteProviderCityLabelById,
    formatNumber,
    chartMonthLabel,
    offersByRequest,
    favoriteRequestIds,
    onToggleRequestFavorite,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
    pendingOfferRequestId,
    pendingFavoriteRequestIds,
    serviceByKey,
    categoryByKey,
    cityById,
    formatDate,
    formatPrice,
    isMyRequestsLoading,
    ownerRequestActions,
    isMyOffersLoading,
    isProviderContractsLoading,
    isClientContractsLoading,
    setFavoritesView,
    isMyReviewsLoading,
    setStatusFilter,
    setWorkspaceTab,
    markPublicRequestsSeen,
    isLoading,
    requestsCount,
  } = data;

  const {
    viewModelPatch,
    primaryAction,
  } = useWorkspaceContentData({
    derivedArgs: {
      t,
      activeStatusFilter,
      activeWorkspaceTab,
      activeFavoritesView,
      myRequests,
      myOffers,
      myOfferRequestsById,
      allMyContracts,
      favoriteRequests,
      favoriteProviders,
      isFavoriteRequestsLoading,
      isFavoriteProvidersLoading,
    },
    contractArgs: {
      isWorkspaceAuthed,
      locale,
    },
    cardsArgs: {
      t,
      favoriteProviders,
      favoriteProviderLookup,
      pendingFavoriteProviderIds,
      onToggleProviderFavorite,
      favoriteProviderRoleLabelById,
      favoriteProviderCityLabelById,
    },
  });

  const {
    topProviders,
    navTitle,
    navSubtitle,
    activityProgress,
    personalNavItems,
    insightText,
    providerStatsPayload,
    clientStatsPayload,
    statsOrder,
  } = useWorkspacePrivateState({
    t,
    locale,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName: auth.user?.name,
    myOffers,
    providers,
    publicRequestsCount: platformRequestsTotal,
    publicProvidersCount: allRequestsSummary?.totalActiveProviders ?? providers.length,
    publicStatsCount: platformRequestsTotal,
    workspacePrivateOverview,
    setWorkspaceTab,
    markPublicRequestsSeen,
    guestLoginHref,
    onGuestLockedAction,
    formatNumber,
    chartMonthLabel,
  });

  const { workspaceIntroNode, workspaceAsideBaseProps } = useWorkspacePresentation({
    t,
    WorkspacePrivateIntroComponent: WorkspacePrivateIntro,
    navTitle,
    navSubtitle,
    personalNavItems,
    hideNavBadges: activePublicSection === 'stats',
    insightText,
    activityProgress,
    statsOrder,
    providerStatsPayload,
    clientStatsPayload,
    createRequestHref: '/request/create',
    isProvidersLoading,
    isProvidersError,
    topProviders,
    favoriteProviderIds,
    showQuickAction: activePublicSection !== 'stats',
  });

  const resolvedWorkspaceIntroNode = React.useMemo(
    () =>
      isWorkspaceAuthed
        ? workspaceIntroNode
        : (
          <WorkspacePublicIntro
            t={t}
            locale={locale}
            navTitle={navTitle}
            navSubtitle={navSubtitle}
            personalNavItems={personalNavItems}
            hideNavBadges={activePublicSection === 'stats'}
            insightText=""
            activityProgress={0}
            cityActivity={publicCityActivity}
            summary={allRequestsSummary}
            isMapLoading={isPublicSummaryLoading}
            isMapError={isPublicSummaryError}
            quickActionHref="/request/create"
            showQuickAction={activePublicSection !== 'stats'}
          />
        ),
    [
      activePublicSection,
      allRequestsSummary,
      isWorkspaceAuthed,
      locale,
      navSubtitle,
      navTitle,
      personalNavItems,
      publicCityActivity,
      isPublicSummaryLoading,
      isPublicSummaryError,
      t,
      workspaceIntroNode,
    ],
  );

  const { workspaceContentProps } = useWorkspacePrivateViewModel({
    t,
    locale,
    isWorkspaceAuthed,
    activeWorkspaceTab,
    ...viewModelPatch,
    onPrimaryActionClick: () => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab }),
    activeStatusFilter,
    setStatusFilter,
    isPersonalized,
    offersByRequest,
    favoriteRequestIds,
    onToggleRequestFavorite,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
    pendingOfferRequestId,
    pendingFavoriteRequestIds,
    serviceByKey,
    categoryByKey,
    cityById,
    formatDate,
    formatPrice,
    isMyRequestsLoading,
    ownerRequestActions,
    isMyOffersLoading,
    isProviderContractsLoading,
    isClientContractsLoading,
    setFavoritesView,
    favoriteRequests,
    isFavoriteRequestsLoading,
    isMyReviewsLoading,
    myReviews,
  });

  const privateMain = <WorkspaceContent {...workspaceContentProps} />;

  return {
    activePublicSection,
    activeWorkspaceTab,
    pendingFavoriteProviderIds,
    onToggleProviderFavorite,
    workspaceIntroNode: resolvedWorkspaceIntroNode,
    workspaceAsideBaseProps,
    privateMain,
    primaryAction,
    isLoading,
    requestsCount,
  };
}
