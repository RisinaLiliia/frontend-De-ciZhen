'use client';

import type { useCatalogIndex } from '@/hooks/useCatalogIndex';
import type { useWorkspaceData } from '@/features/workspace/requests';
import type {
  useWorkspaceCollections,
  useWorkspacePublicFilters,
  useWorkspacePublicRequestsState,
} from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/requests/workspace.constants';

type WorkspacePublicFiltersResult = ReturnType<typeof useWorkspacePublicFilters>;
type CatalogIndexResult = ReturnType<typeof useCatalogIndex>;
type WorkspaceDataResult = ReturnType<typeof useWorkspaceData>;
type WorkspaceContractDataResult = WorkspaceDataResult['contractData'];
type WorkspaceLegacyPublicOverviewDataResult = WorkspaceDataResult['legacyPublicOverviewData'];
type WorkspaceRequestUserStateDataResult = WorkspaceDataResult['requestUserStateData'];
type WorkspaceLegacyMyRequestsDataResult = WorkspaceDataResult['legacyMyRequestsData'];
type WorkspaceLegacyContractSupportDataResult = WorkspaceDataResult['legacyContractSupportData'];
type WorkspaceLegacyReviewSupportDataResult = WorkspaceDataResult['legacyReviewSupportData'];
type WorkspaceLegacyProviderSupportDataResult = WorkspaceDataResult['legacyProviderSupportData'];
type WorkspacePublicRequestsStateResult = ReturnType<typeof useWorkspacePublicRequestsState>;
type WorkspaceCollectionsResult = ReturnType<typeof useWorkspaceCollections>;

type BuildWorkspacePrivateCatalogLoadArgs = {
  activePublicSection?: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  requestsScope?: WorkspaceBranchProps['routeState']['requestsScope'];
};

type BuildWorkspacePrivatePublicRequestsStateLoadArgs = {
  activePublicSection?: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
};

type BuildWorkspacePrivateSourcesDataArgsParams = Pick<
  WorkspaceBranchProps,
  'locale' | 'isAuthed' | 'isWorkspaceAuthed'
> & {
  filter: WorkspacePublicFiltersResult['filter'];
  shouldLoadCatalog?: boolean;
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  activePublicSection?: WorkspaceBranchProps['routeState']['activePublicSection'];
  requestsScope?: WorkspaceBranchProps['routeState']['requestsScope'];
  activeRequestsRole?: WorkspaceBranchProps['routeState']['activeRequestsRole'];
  activeRequestsState?: WorkspaceBranchProps['routeState']['activeRequestsState'];
  activeRequestsPeriod?: WorkspaceBranchProps['routeState']['activeRequestsPeriod'];
  activeRequestsSort?: WorkspaceBranchProps['routeState']['activeRequestsSort'];
};

type BuildWorkspacePrivateSourcesRequestsStateArgsParams = {
  filters: Pick<
    WorkspacePublicFiltersResult,
    | 'limit'
    | 'page'
    | 'setPage'
    | 'hasActivePublicFilter'
    | 'cityId'
    | 'categoryKey'
    | 'subcategoryKey'
    | 'sortBy'
  >;
  contractData: Pick<WorkspaceContractDataResult, 'allRequestsSummary'>;
  legacyPublicOverviewData: Pick<WorkspaceLegacyPublicOverviewDataResult, 'overviewRequests' | 'isLoading' | 'isError'>;
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
};

type BuildWorkspacePrivateSourcesCollectionsArgsParams = {
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  requestsScope?: WorkspaceBranchProps['routeState']['requestsScope'];
  requests: WorkspacePublicRequestsStateResult['requests'];
  requestUserStateData: Pick<
    WorkspaceRequestUserStateDataResult,
    | 'favoriteRequests'
    | 'myOffers'
  >;
  legacyContractSupportData: Pick<
    WorkspaceLegacyContractSupportDataResult,
    | 'myProviderContracts'
    | 'myClientContracts'
  >;
  legacyProviderSupportData: Pick<
    WorkspaceLegacyProviderSupportDataResult,
    | 'providers'
    | 'favoriteProviders'
  >;
  catalogIndex: Pick<CatalogIndexResult, 'cityById' | 'serviceByKey'>;
  locale: WorkspaceBranchProps['locale'];
};

type BuildWorkspacePrivateCatalogIndexArgsParams = Pick<
  WorkspacePublicFiltersResult,
  'services' | 'categories' | 'cities'
> & {
  enabled: boolean;
};

type ResolveWorkspacePrivateSourcesResultParams = {
  contractData: WorkspaceContractDataResult;
  legacyPublicOverviewData: WorkspaceLegacyPublicOverviewDataResult;
  requestUserStateData: WorkspaceRequestUserStateDataResult;
  legacyMyRequestsData: WorkspaceLegacyMyRequestsDataResult;
  legacyContractSupportData: WorkspaceLegacyContractSupportDataResult;
  legacyReviewSupportData: WorkspaceLegacyReviewSupportDataResult;
  legacyProviderSupportData: WorkspaceLegacyProviderSupportDataResult;
  catalogIndex: CatalogIndexResult;
  collections: WorkspaceCollectionsResult;
  publicRequestsState: WorkspacePublicRequestsStateResult;
};

export function shouldLoadWorkspacePrivateCatalog({
  activePublicSection = null,
  activeWorkspaceTab,
  requestsScope = 'market',
}: BuildWorkspacePrivateCatalogLoadArgs) {
  if (activePublicSection === 'requests' && requestsScope === 'my') return false;
  if (activePublicSection === 'actions') return false;
  if (activeWorkspaceTab === 'reviews') return false;
  if (activeWorkspaceTab === 'profile') return false;
  return true;
}

export function shouldLoadWorkspacePrivatePublicRequestsState({
  activePublicSection = null,
  activeWorkspaceTab,
}: BuildWorkspacePrivatePublicRequestsStateLoadArgs) {
  return activePublicSection === null && activeWorkspaceTab === 'my-requests';
}

export function shouldBuildWorkspacePrivateRequestCollections({
  activePublicSection = null,
  activeWorkspaceTab,
  requestsScope = 'market',
}: BuildWorkspacePrivatePublicRequestsStateLoadArgs & {
  requestsScope?: WorkspaceBranchProps['routeState']['requestsScope'];
}) {
  if (activePublicSection === 'requests' && requestsScope === 'my') return false;
  if (activePublicSection === 'actions') return false;
  if (activeWorkspaceTab === 'reviews') return false;
  if (activeWorkspaceTab === 'profile') return false;
  return true;
}

export function shouldBuildWorkspacePrivateFavoriteProviderPresentation(
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'],
) {
  return activeWorkspaceTab === 'favorites';
}

export function shouldBuildWorkspacePrivateFavoriteProviderBackfill(
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'],
) {
  return activeWorkspaceTab === 'favorites';
}

export function resolveWorkspacePrivatePublicSummaryCityActivityLimit({
  activePublicSection = null,
  activeWorkspaceTab,
}: BuildWorkspacePrivatePublicRequestsStateLoadArgs) {
  const shouldLoadFullMapSummary =
    activePublicSection === null &&
    activeWorkspaceTab === 'my-requests';

  return shouldLoadFullMapSummary
    ? WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT
    : 1;
}

export function buildWorkspacePrivateSourcesDataArgs({
  filter,
  shouldLoadCatalog = true,
  locale,
  isAuthed,
  isWorkspaceAuthed,
  activeWorkspaceTab,
  activePublicSection = null,
  requestsScope = 'market',
  activeRequestsRole = 'all',
  activeRequestsState = 'all',
  activeRequestsPeriod = '30d',
  activeRequestsSort = null,
}: BuildWorkspacePrivateSourcesDataArgsParams): Parameters<typeof useWorkspaceData>[0] {
  return {
    filter: shouldLoadCatalog ? filter : {},
    locale,
    isAuthed,
    isWorkspaceAuthed,
    isWorkspacePublicSection: false,
    shouldLoadPrivateData: true,
    activeWorkspaceTab,
    activePublicSection,
    requestsScope,
    activeRequestsRole,
    activeRequestsState,
    activeRequestsPeriod,
    activeRequestsSort,
    publicSummaryCityActivityLimit: resolveWorkspacePrivatePublicSummaryCityActivityLimit({
      activePublicSection,
      activeWorkspaceTab,
    }),
  };
}

export function buildWorkspacePrivateSourcesRequestsStateArgs({
  filters,
  contractData,
  legacyPublicOverviewData,
  activePublicSection,
}: BuildWorkspacePrivateSourcesRequestsStateArgsParams): Parameters<typeof useWorkspacePublicRequestsState>[0] {
  return {
    publicRequests: legacyPublicOverviewData.overviewRequests,
    allRequestsSummary: contractData.allRequestsSummary,
    limit: filters.limit,
    page: filters.page,
    setPage: filters.setPage,
    enablePageClamp: true,
    enableEmptyStateTracking: true,
    isWorkspacePublicSection: false,
    activePublicSection,
    isLoading: legacyPublicOverviewData.isLoading,
    isError: legacyPublicOverviewData.isError,
    hasActivePublicFilter: filters.hasActivePublicFilter,
    cityId: filters.cityId,
    categoryKey: filters.categoryKey,
    subcategoryKey: filters.subcategoryKey,
    sortBy: filters.sortBy,
  };
}

export function buildWorkspacePrivateCatalogIndexArgs({
  enabled,
  services,
  categories,
  cities,
}: BuildWorkspacePrivateCatalogIndexArgsParams): Parameters<typeof useCatalogIndex>[0] {
  return {
    enabled,
    services,
    categories,
    cities,
  };
}

export function buildWorkspacePrivateSourcesIdleRequestsStateArgs(params: {
  allRequestsSummary: BuildWorkspacePrivateSourcesRequestsStateArgsParams['contractData']['allRequestsSummary'];
  limit: number;
  page: number;
  setPage: (page: number) => void;
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
}) : Parameters<typeof useWorkspacePublicRequestsState>[0] {
  return {
    publicRequests: undefined,
    allRequestsSummary: params.allRequestsSummary,
    limit: params.limit,
    page: params.page,
    setPage: params.setPage,
    enablePageClamp: false,
    enableEmptyStateTracking: false,
    isWorkspacePublicSection: false,
    activePublicSection: params.activePublicSection,
    isLoading: false,
    isError: false,
    hasActivePublicFilter: false,
    cityId: 'all',
    categoryKey: 'all',
    subcategoryKey: 'all',
    sortBy: 'date_desc',
  };
}

export function buildWorkspacePrivateSourcesCollectionsArgs({
  activePublicSection,
  activeWorkspaceTab,
  requestsScope = 'market',
  requests,
  requestUserStateData,
  legacyContractSupportData,
  legacyProviderSupportData,
  catalogIndex,
  locale,
}: BuildWorkspacePrivateSourcesCollectionsArgsParams): Parameters<typeof useWorkspaceCollections>[0] {
  const includeRequestCollections = shouldBuildWorkspacePrivateRequestCollections({
    activePublicSection,
    activeWorkspaceTab,
    requestsScope,
  });
  const includeFavoriteProviderBackfill = shouldBuildWorkspacePrivateFavoriteProviderBackfill(
    activeWorkspaceTab,
  );
  const includeFavoriteProviderPresentation = shouldBuildWorkspacePrivateFavoriteProviderPresentation(
    activeWorkspaceTab,
  );

  return {
    includeRequestCollections,
    includeFavoriteProviderBackfill,
    includeFavoriteProviderPresentation,
    requests: includeRequestCollections ? requests : [],
    favoriteRequests: includeRequestCollections ? requestUserStateData.favoriteRequests : [],
    providers: legacyProviderSupportData.providers,
    favoriteProviders: legacyProviderSupportData.favoriteProviders,
    myOffers: includeRequestCollections ? requestUserStateData.myOffers : [],
    myProviderContracts: includeRequestCollections ? legacyContractSupportData.myProviderContracts : [],
    myClientContracts: includeRequestCollections ? legacyContractSupportData.myClientContracts : [],
    cityById: catalogIndex.cityById,
    serviceByKey: catalogIndex.serviceByKey,
    locale,
  };
}

export function resolveWorkspacePrivateSourcesResult({
  contractData,
  legacyPublicOverviewData,
  requestUserStateData,
  legacyMyRequestsData,
  legacyContractSupportData,
  legacyReviewSupportData,
  legacyProviderSupportData,
  catalogIndex,
  collections,
  publicRequestsState,
}: ResolveWorkspacePrivateSourcesResultParams) {
  return {
    allRequestsSummary: contractData.allRequestsSummary,
    overviewRequestsListState: {
      requests: publicRequestsState.requests,
      isLoading: legacyPublicOverviewData.isLoading,
      isError: legacyPublicOverviewData.isError,
    },
    publicCityActivity: contractData.publicCityActivity,
    isPublicSummaryLoading: contractData.isPublicSummaryLoading,
    isPublicSummaryError: contractData.isPublicSummaryError,
    providers: legacyProviderSupportData.providers,
    isProvidersLoading: legacyProviderSupportData.isProvidersLoading,
    isProvidersError: legacyProviderSupportData.isProvidersError,
    privateOverviewState: contractData.privateOverviewState,
    isWorkspacePrivateRequestsFallbackLoading: contractData.isWorkspacePrivateRequestsFallbackLoading,
    workspaceRequests: contractData.workspaceRequests,
    isWorkspaceRequestsLoading: contractData.isWorkspaceRequestsLoading,
    isWorkspaceRequestsError: contractData.isWorkspaceRequestsError,
    myOffers: requestUserStateData.myOffers,
    myRequestsState: {
      items: legacyMyRequestsData.myRequests,
      isLoading: legacyMyRequestsData.isMyRequestsLoading,
    },
    myOfferRequestsById: requestUserStateData.myOfferRequestsById,
    isMyOfferRequestsLoading: requestUserStateData.isMyOfferRequestsLoading,
    contractsState: {
      providerContracts: legacyContractSupportData.myProviderContracts,
      clientContracts: legacyContractSupportData.myClientContracts,
      allContracts: collections.allMyContracts,
      isProviderLoading: legacyContractSupportData.isProviderContractsLoading,
      isClientLoading: legacyContractSupportData.isClientContractsLoading,
    },
    favoriteRequests: requestUserStateData.favoriteRequests,
    favoriteProviders: legacyProviderSupportData.favoriteProviders,
    favoriteProviderIds: collections.favoriteProviderIds,
    reviewsState: {
      items: legacyReviewSupportData.myReviews,
      isLoading: legacyReviewSupportData.isMyReviewsLoading,
    },
    isFavoriteRequestsLoading: requestUserStateData.isFavoriteRequestsLoading,
    isFavoriteProvidersLoading: legacyProviderSupportData.isFavoriteProvidersLoading,
    offersByRequest: collections.offersByRequest,
    favoriteRequestIds: collections.favoriteRequestIds,
    favoriteProviderLookup: collections.favoriteProviderLookup,
    requestById: collections.requestById,
    providerById: collections.providerById,
    favoriteProviderRoleLabelById: collections.favoriteProviderRoleLabelById,
    favoriteProviderCityLabelById: collections.favoriteProviderCityLabelById,
    serviceByKey: catalogIndex.serviceByKey,
    categoryByKey: catalogIndex.categoryByKey,
    cityById: catalogIndex.cityById,
    isMyOffersLoading: requestUserStateData.isMyOffersLoading,
    platformRequestsTotal: contractData.allRequestsSummary?.totalPublishedRequests ?? 0,
    overviewRequestsCount: publicRequestsState.requests.length,
  };
}
