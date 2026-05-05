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
type WorkspacePublicRequestsStateResult = ReturnType<typeof useWorkspacePublicRequestsState>;
type WorkspaceCollectionsResult = ReturnType<typeof useWorkspaceCollections>;

type BuildWorkspacePrivateCatalogLoadArgs = {
  activePublicSection?: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
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
  data: Pick<WorkspaceDataResult, 'publicRequests' | 'allRequestsSummary' | 'isLoading' | 'isError'>;
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
};

type BuildWorkspacePrivateSourcesCollectionsArgsParams = {
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  requestsScope?: WorkspaceBranchProps['routeState']['requestsScope'];
  requests: WorkspacePublicRequestsStateResult['requests'];
  data: Pick<
    WorkspaceDataResult,
    | 'favoriteRequests'
    | 'providers'
    | 'favoriteProviders'
    | 'myOffers'
    | 'myProviderContracts'
    | 'myClientContracts'
  >;
  catalogIndex: Pick<CatalogIndexResult, 'cityById' | 'serviceByKey'>;
  locale: WorkspaceBranchProps['locale'];
};

type ResolveWorkspacePrivateSourcesResultParams = {
  data: WorkspaceDataResult;
  catalogIndex: CatalogIndexResult;
  collections: WorkspaceCollectionsResult;
  publicRequestsState: WorkspacePublicRequestsStateResult;
};

export function shouldLoadWorkspacePrivateCatalog({
  activePublicSection = null,
  activeWorkspaceTab,
}: BuildWorkspacePrivateCatalogLoadArgs) {
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
    filter,
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
  data,
  activePublicSection,
}: BuildWorkspacePrivateSourcesRequestsStateArgsParams): Parameters<typeof useWorkspacePublicRequestsState>[0] {
  return {
    publicRequests: data.publicRequests,
    allRequestsSummary: data.allRequestsSummary,
    limit: filters.limit,
    page: filters.page,
    setPage: filters.setPage,
    isWorkspacePublicSection: false,
    activePublicSection,
    isLoading: data.isLoading,
    isError: data.isError,
    hasActivePublicFilter: filters.hasActivePublicFilter,
    cityId: filters.cityId,
    categoryKey: filters.categoryKey,
    subcategoryKey: filters.subcategoryKey,
    sortBy: filters.sortBy,
  };
}

export function buildWorkspacePrivateSourcesIdleRequestsStateArgs(params: {
  allRequestsSummary: BuildWorkspacePrivateSourcesRequestsStateArgsParams['data']['allRequestsSummary'];
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
  data,
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
    favoriteRequests: includeRequestCollections ? data.favoriteRequests : [],
    providers: data.providers,
    favoriteProviders: data.favoriteProviders,
    myOffers: includeRequestCollections ? data.myOffers : [],
    myProviderContracts: includeRequestCollections ? data.myProviderContracts : [],
    myClientContracts: includeRequestCollections ? data.myClientContracts : [],
    cityById: catalogIndex.cityById,
    serviceByKey: catalogIndex.serviceByKey,
    locale,
  };
}

export function resolveWorkspacePrivateSourcesResult({
  data,
  catalogIndex,
  collections,
  publicRequestsState,
}: ResolveWorkspacePrivateSourcesResultParams) {
  return {
    allRequestsSummary: data.allRequestsSummary,
    publicRequests: publicRequestsState.requests,
    publicCityActivity: data.publicCityActivity,
    isPublicSummaryLoading: data.isPublicSummaryLoading,
    isPublicSummaryError: data.isPublicSummaryError,
    providers: data.providers,
    isProvidersLoading: data.isProvidersLoading,
    isProvidersError: data.isProvidersError,
    workspacePrivateOverview: data.workspacePrivateOverview,
    isWorkspacePrivateOverviewLoading: data.isWorkspacePrivateOverviewLoading,
    workspaceRequests: data.workspaceRequests,
    isWorkspaceRequestsLoading: data.isWorkspaceRequestsLoading,
    isWorkspaceRequestsError: data.isWorkspaceRequestsError,
    myOffers: data.myOffers,
    myRequests: data.myRequests,
    myOfferRequestsById: data.myOfferRequestsById,
    isMyOfferRequestsLoading: data.isMyOfferRequestsLoading,
    myProviderContracts: data.myProviderContracts,
    myClientContracts: data.myClientContracts,
    allMyContracts: collections.allMyContracts,
    favoriteRequests: data.favoriteRequests,
    favoriteProviders: data.favoriteProviders,
    favoriteProviderIds: collections.favoriteProviderIds,
    myReviews: data.myReviews,
    isFavoriteRequestsLoading: data.isFavoriteRequestsLoading,
    isFavoriteProvidersLoading: data.isFavoriteProvidersLoading,
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
    isMyRequestsLoading: data.isMyRequestsLoading,
    isMyOffersLoading: data.isMyOffersLoading,
    isProviderContractsLoading: data.isProviderContractsLoading,
    isClientContractsLoading: data.isClientContractsLoading,
    isMyReviewsLoading: data.isMyReviewsLoading,
    platformRequestsTotal: publicRequestsState.platformRequestsTotal,
    isPublicRequestsError: data.isError,
    isLoading: data.isLoading,
    requestsCount: publicRequestsState.requests.length,
  };
}
