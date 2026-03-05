'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { trackUXEvent } from '@/lib/analytics';
import { useDevRenderMetric } from '@/lib/perf/useDevRenderMetric';
import {
  useWorkspaceData,
  useWorkspacePrivateState,
  useWorkspacePrivateViewModel,
} from '@/features/workspace/requests';
import {
  ProofReviewCard,
  usePublicRequestsSeenTotal,
  useWorkspaceActions,
  useWorkspaceCollections,
  useWorkspaceContentData,
  useWorkspaceFavoriteToggles,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  useWorkspacePresentation,
  useWorkspacePublicFilters,
  useWorkspacePublicRequestsState,
  useWorkspaceTabPersistence,
  WorkspaceContent,
  WorkspaceMobilePrimaryAction,
  WorkspacePageLayout,
  WorkspacePrivateIntro,
} from '@/features/workspace';
import { EMPTY_EXPLORE, WORKSPACE_PATH } from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

export function WorkspacePrivateBranch({
  t,
  locale,
  auth,
  isAuthed,
  isWorkspaceAuthed,
  isPersonalized,
  routeState,
}: WorkspaceBranchProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const {
    activePublicSection,
    activeWorkspaceTab,
    activeStatusFilter,
    activeFavoritesView,
    activeReviewsView,
    nextPath,
    guestLoginHref,
    onGuestLockedAction,
  } = routeState;

  const {
    cities,
    categories,
    services,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    setPage,
    hasActivePublicFilter,
  } = useWorkspacePublicFilters({
    t,
    locale,
    shouldLoadCatalog: true,
  });

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });

  const {
    publicRequests,
    isLoading,
    isError,
    allRequestsSummary,
    myOffers,
    isMyOffersLoading,
    myOfferRequestsById,
    favoriteRequests,
    isFavoriteRequestsLoading,
    favoriteProviders,
    isFavoriteProvidersLoading,
    myReviews,
    isMyReviewsLoading,
    myRequests,
    isMyRequestsLoading,
    myProviderContracts,
    isProviderContractsLoading,
    myClientContracts,
    isClientContractsLoading,
    providers,
    workspacePrivateOverview,
    isProvidersLoading,
    isProvidersError,
  } = useWorkspaceData({
    filter,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    isWorkspacePublicSection: false,
    shouldLoadPrivateData: true,
    activeWorkspaceTab,
    activeReviewsView,
  });

  const { requests, platformRequestsTotal } = useWorkspacePublicRequestsState({
    publicRequests,
    allRequestsSummary,
    limit,
    page,
    setPage,
    isWorkspacePublicSection: false,
    activePublicSection,
    isLoading,
    isError,
    hasActivePublicFilter,
    cityId,
    categoryKey,
    subcategoryKey,
    sortBy,
  });

  const {
    favoriteRequestIds,
    requestById,
    providerById,
    favoriteProviderLookup,
    favoriteProviderIds,
    offersByRequest,
    allMyContracts,
    favoriteProviderCityLabelById,
    favoriteProviderRoleLabelById,
  } = useWorkspaceCollections({
    requests,
    favoriteRequests,
    providers,
    favoriteProviders,
    myOffers,
    myProviderContracts,
    myClientContracts,
    cityById,
    serviceByKey,
    locale,
  });

  const {
    pendingFavoriteRequestIds,
    pendingFavoriteProviderIds,
    onToggleRequestFavorite,
    onToggleProviderFavorite,
  } = useWorkspaceFavoriteToggles({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteRequestIds,
    requestById,
    favoriteProviderLookup,
    providerById,
  });

  const {
    pendingOfferRequestId,
    ownerRequestActions,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
  } = useWorkspaceActions({
    isAuthed,
    myOffers,
    t,
    qc,
    router,
  });

  const { localeTag, formatNumber, formatDate, formatPrice, chartMonthLabel } =
    useWorkspaceFormatters(locale);

  const { markPublicRequestsSeen } = usePublicRequestsSeenTotal({
    isAuthed,
    userId: auth.user?.id,
    platformRequestsTotal,
    autoMarkSeen: false,
  });

  useWorkspaceTabPersistence({
    isWorkspaceAuthed,
    isWorkspacePublicSection: false,
    activeWorkspaceTab,
  });

  const {
    setWorkspaceTab,
    setStatusFilter,
    setFavoritesView,
    setReviewsView,
  } = useWorkspaceNavigation({
    activeWorkspaceTab,
    workspacePath: WORKSPACE_PATH,
  });

  const {
    viewModelPatch,
    primaryAction,
  } = useWorkspaceContentData({
    derivedArgs: {
      t,
      activeStatusFilter,
      activeWorkspaceTab,
      activeFavoritesView,
      activeReviewsView,
      myRequests,
      myOffers,
      myOfferRequestsById,
      allMyContracts,
      favoriteRequests,
      favoriteProviders,
      isFavoriteRequestsLoading,
      isFavoriteProvidersLoading,
      myReviews,
      localeTag,
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
      ProofReviewCardComponent: ProofReviewCard,
    },
  });

  const {
    topProviders,
    navTitle,
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
    personalNavItems,
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
  });

  const { workspaceContentProps } = useWorkspacePrivateViewModel({
    t,
    locale,
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
    activeReviewsView,
    setReviewsView,
  });

  const privateMain = <WorkspaceContent {...workspaceContentProps} />;

  useDevRenderMetric('workspace.private', () => ({
    isAuthed,
    activeWorkspaceTab,
    isLoading,
    requestsCount: requests.length,
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
