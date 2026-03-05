'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import {
  useWorkspaceData,
} from '@/features/workspace/requests';
import {
  usePublicRequestsSeenTotal,
  useWorkspaceActions,
  useWorkspaceCollections,
  useWorkspaceFavoriteToggles,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  useWorkspacePublicFilters,
  useWorkspacePublicRequestsState,
  useWorkspaceTabPersistence,
} from '@/features/workspace';
import { WORKSPACE_PATH } from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

export function useWorkspacePrivateDataFlow({
  t,
  locale,
  auth,
  isAuthed,
  isWorkspaceAuthed,
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

  return {
    activePublicSection,
    activeWorkspaceTab,
    activeStatusFilter,
    activeFavoritesView,
    activeReviewsView,
    guestLoginHref,
    onGuestLockedAction,
    platformRequestsTotal,
    allRequestsSummary,
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
    localeTag,
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
    setReviewsView,
    setStatusFilter,
    setWorkspaceTab,
    markPublicRequestsSeen,
    isLoading,
    requestsCount: requests.length,
  };
}
