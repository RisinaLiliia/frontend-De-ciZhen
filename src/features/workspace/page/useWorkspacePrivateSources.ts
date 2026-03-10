'use client';

import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useWorkspaceData } from '@/features/workspace/requests';
import {
  useWorkspaceCollections,
  useWorkspacePublicFilters,
  useWorkspacePublicRequestsState,
} from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

type SourcesParams = Pick<WorkspaceBranchProps, 't' | 'locale' | 'isAuthed' | 'isWorkspaceAuthed'> & {
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
};

export function useWorkspacePrivateSources({
  t,
  locale,
  isAuthed,
  isWorkspaceAuthed,
  activePublicSection,
  activeWorkspaceTab,
}: SourcesParams) {
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
    publicCityActivity,
    isPublicSummaryLoading,
    isPublicSummaryError,
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

  return {
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
    offersByRequest,
    favoriteRequestIds,
    favoriteProviderLookup,
    requestById,
    providerById,
    favoriteProviderRoleLabelById,
    favoriteProviderCityLabelById,
    serviceByKey,
    categoryByKey,
    cityById,
    isMyRequestsLoading,
    isMyOffersLoading,
    isProviderContractsLoading,
    isClientContractsLoading,
    isMyReviewsLoading,
    platformRequestsTotal,
    isLoading,
    requestsCount: requests.length,
  };
}
