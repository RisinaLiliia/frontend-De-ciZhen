'use client';

import type { useCatalogIndex } from '@/hooks/useCatalogIndex';
import type { useWorkspaceData } from '@/features/workspace/data/useWorkspaceData';
import type { useWorkspaceProviderSupportData } from '@/features/workspace/providers/useWorkspaceProviderSupportData';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { WorkspaceMyRequestCardDto, WorkspaceRequestsResponseDto } from '@/lib/api/dto/workspace';
import type {
  useWorkspaceCollections,
  useWorkspacePublicFilters,
} from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/data';

type WorkspacePublicFiltersResult = ReturnType<typeof useWorkspacePublicFilters>;
type CatalogIndexResult = ReturnType<typeof useCatalogIndex>;
type WorkspaceDataResult = ReturnType<typeof useWorkspaceData>;
type WorkspaceProviderSupportDataResult = ReturnType<typeof useWorkspaceProviderSupportData>;
type WorkspaceContractDataResult = WorkspaceDataResult['contractData'];
type WorkspaceRequestUserStateDataResult = WorkspaceDataResult['requestUserStateData'];
type WorkspaceCollectionsResult = ReturnType<typeof useWorkspaceCollections>;
type WorkspaceActiveSection = WorkspaceBranchProps['routeState']['activePublicSection'];
type WorkspaceActiveTab = WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
type WorkspaceRequestsScope = WorkspaceBranchProps['routeState']['requestsScope'];

type BuildWorkspacePrivateCatalogLoadArgs = {
  activePublicSection?: WorkspaceActiveSection;
  activeWorkspaceTab: WorkspaceActiveTab;
  requestsScope?: WorkspaceRequestsScope;
};

type BuildWorkspacePrivatePublicRequestsStateLoadArgs = {
  activePublicSection?: WorkspaceActiveSection;
  activeWorkspaceTab: WorkspaceActiveTab;
};

type BuildWorkspacePrivateSourcesDataArgsParams = Pick<
  WorkspaceBranchProps,
  'locale' | 'isAuthed' | 'isWorkspaceAuthed'
> & {
  enabled?: boolean;
  filter: WorkspacePublicFiltersResult['filter'];
  page: WorkspacePublicFiltersResult['page'];
  limit: WorkspacePublicFiltersResult['limit'];
  shouldLoadCatalog?: boolean;
  activeWorkspaceTab: WorkspaceActiveTab;
  activePublicSection?: WorkspaceActiveSection;
  requestsScope?: WorkspaceRequestsScope;
  activeRequestsRole?: WorkspaceBranchProps['routeState']['activeRequestsRole'];
  activeRequestsState?: WorkspaceBranchProps['routeState']['activeRequestsState'];
  activeRequestsPeriod?: WorkspaceBranchProps['routeState']['activeRequestsPeriod'];
  activeRequestsSort?: WorkspaceBranchProps['routeState']['activeRequestsSort'];
};

type BuildWorkspacePrivateSourcesCollectionsArgsParams = {
  activePublicSection: WorkspaceActiveSection;
  activeWorkspaceTab: WorkspaceActiveTab;
  requestsScope?: WorkspaceRequestsScope;
  requests: WorkspaceCollectionsResult extends never ? never : Parameters<typeof useWorkspaceCollections>[0]['requests'];
  requestUserStateData: Pick<
    WorkspaceRequestUserStateDataResult,
    | 'favoriteRequests'
    | 'myOffers'
  >;
  providerSupportData: Pick<
    WorkspaceProviderSupportDataResult,
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
  activePublicSection: WorkspaceActiveSection;
  activeWorkspaceTab: WorkspaceActiveTab;
  requestsScope?: WorkspaceRequestsScope;
  contractData: WorkspaceContractDataResult;
  requestUserStateData: WorkspaceRequestUserStateDataResult;
  providerSupportData: WorkspaceProviderSupportDataResult;
  catalogIndex: CatalogIndexResult;
  collections: WorkspaceCollectionsResult;
  filters: Pick<
    WorkspacePublicFiltersResult,
    | 'page'
    | 'limit'
    | 'setPage'
  >;
};

export function shouldLoadWorkspacePrivateCatalog({
  activePublicSection = null,
  requestsScope = 'market',
}: BuildWorkspacePrivateCatalogLoadArgs) {
  if (activePublicSection === 'requests' && requestsScope === 'my') return false;
  if (activePublicSection === 'actions') return false;
  if (activePublicSection === 'profile') return false;
  return true;
}

export function shouldBuildWorkspacePrivateRequestCollections({
  activePublicSection = null,
}: BuildWorkspacePrivatePublicRequestsStateLoadArgs) {
  return activePublicSection === null;
}

export function shouldBuildWorkspacePrivateFavoriteProviderPresentation() {
  return false;
}

export function shouldBuildWorkspacePrivateFavoriteProviderBackfill() {
  return true;
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
  enabled = true,
  filter,
  page,
  limit,
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
    enabled,
    filter: shouldLoadCatalog ? filter : { page, limit },
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

function resolveWorkspacePrivateRequestStatus(
  card: WorkspaceMyRequestCardDto,
): RequestResponseDto['status'] {
  if (card.visibility?.isInactive || card.lifecycleState === 'cancelled') return 'cancelled';
  if (card.lifecycleState === 'draft' || card.ownerLifecycleStage === 'draft') return 'draft';
  if (
    card.lifecycleState === 'contract_pending'
    || card.lifecycleState === 'in_progress'
    || card.lifecycleState === 'completion_pending'
  ) {
    return 'matched';
  }
  if (
    card.lifecycleState === 'completed'
    || card.lifecycleState === 'reviewed'
    || card.ownerLifecycleStage === 'completed'
    || card.ownerLifecycleStage === 'reviewed'
  ) {
    return 'closed';
  }
  return 'published';
}

export function buildWorkspacePrivateCollectionRequests(
  response: WorkspaceRequestsResponseDto | null | undefined,
): RequestResponseDto[] {
  const cards = response?.list.items ?? [];

  return cards.map((card) => ({
    id: card.requestId,
    serviceKey: card.subcategory?.trim() || card.requestPreview.imageCategoryKey?.trim() || '',
    cityId: card.city?.trim() || '',
    cityName: card.requestPreview.cityLabel ?? card.city ?? null,
    categoryName: card.requestPreview.categoryLabel || card.category || null,
    subcategoryName: card.subcategory ?? null,
    propertyType: 'apartment',
    area: 0,
    preferredDate: card.nextEventAtIso ?? card.createdAtIso ?? '',
    isRecurring: false,
    title: card.requestPreview.title || card.title || null,
    description: card.requestPreview.excerpt ?? null,
    imageUrl: card.requestPreview.imageUrl ?? null,
    priceTrend: card.requestPreview.priceTrend ?? null,
    status: resolveWorkspacePrivateRequestStatus(card),
    createdAt: card.createdAtIso ?? '',
  }));
}

export function buildWorkspacePrivateSourcesCollectionsArgs({
  activePublicSection,
  activeWorkspaceTab,
  requests,
  requestUserStateData,
  providerSupportData,
  catalogIndex,
  locale,
}: BuildWorkspacePrivateSourcesCollectionsArgsParams): Parameters<typeof useWorkspaceCollections>[0] {
  const includeRequestCollections = shouldBuildWorkspacePrivateRequestCollections({
    activePublicSection,
    activeWorkspaceTab,
  });
  const includeFavoriteProviderBackfill = shouldBuildWorkspacePrivateFavoriteProviderBackfill();
  const includeFavoriteProviderPresentation = shouldBuildWorkspacePrivateFavoriteProviderPresentation();

  return {
    includeRequestCollections,
    includeFavoriteProviderBackfill,
    includeFavoriteProviderPresentation,
    requests: includeRequestCollections ? requests : [],
    favoriteRequests: includeRequestCollections ? requestUserStateData.favoriteRequests : [],
    providers: providerSupportData.providers,
    favoriteProviders: providerSupportData.favoriteProviders,
    myOffers: includeRequestCollections ? requestUserStateData.myOffers : [],
    myProviderContracts: [],
    myClientContracts: [],
    cityById: catalogIndex.cityById,
    serviceByKey: catalogIndex.serviceByKey,
    locale,
  };
}

export function resolveWorkspacePrivateSourcesResult({
  activePublicSection,
  activeWorkspaceTab,
  requestsScope = 'market',
  contractData,
  requestUserStateData,
  providerSupportData,
  catalogIndex,
  collections,
  filters,
}: ResolveWorkspacePrivateSourcesResultParams) {
  const isOverviewMarketRequestsContext =
    activePublicSection === null &&
    activeWorkspaceTab === 'my-requests';
  const isUnifiedPrivateRequestsContext =
    activePublicSection === 'requests' &&
    requestsScope === 'my';
  const overviewMarketRequests = isOverviewMarketRequestsContext
    ? contractData.workspaceRequests
    : null;
  const workspaceRequests = isUnifiedPrivateRequestsContext
    ? contractData.workspaceRequests
    : null;
  const isOverviewMarketRequestsLoading = isOverviewMarketRequestsContext
    ? contractData.isWorkspaceRequestsLoading
    : false;
  const isOverviewMarketRequestsError = isOverviewMarketRequestsContext
    ? contractData.isWorkspaceRequestsError
    : false;

  return {
    allRequestsSummary: contractData.allRequestsSummary,
    overviewMarketRequestsState: {
      response: overviewMarketRequests,
      isLoading: isOverviewMarketRequestsLoading,
      isError: isOverviewMarketRequestsError,
    },
    publicCityActivity: contractData.publicCityActivity,
    isPublicSummaryLoading: contractData.isPublicSummaryLoading,
    isPublicSummaryError: contractData.isPublicSummaryError,
    providerDirectoryState: {
      items: providerSupportData.providers,
      isLoading: providerSupportData.isProvidersLoading,
      isError: providerSupportData.isProvidersError,
      byId: collections.providerById,
    },
    privateOverviewState: contractData.privateOverviewState,
    myOffers: requestUserStateData.myOffers,
    myOfferRequestsById: requestUserStateData.myOfferRequestsById,
    isMyOfferRequestsLoading: requestUserStateData.isMyOfferRequestsLoading,
    favoriteRequests: requestUserStateData.favoriteRequests,
    favoriteProvidersState: {
      items: providerSupportData.favoriteProviders,
      isLoading: providerSupportData.isFavoriteProvidersLoading,
      ids: collections.favoriteProviderIds,
      lookup: collections.favoriteProviderLookup,
      roleLabelsById: collections.favoriteProviderRoleLabelById,
      cityLabelsById: collections.favoriteProviderCityLabelById,
    },
    isFavoriteRequestsLoading: requestUserStateData.isFavoriteRequestsLoading,
    offersByRequest: collections.offersByRequest,
    favoriteRequestIds: collections.favoriteRequestIds,
    requestById: collections.requestById,
    serviceByKey: catalogIndex.serviceByKey,
    categoryByKey: catalogIndex.categoryByKey,
    cityById: catalogIndex.cityById,
    isMyOffersLoading: requestUserStateData.isMyOffersLoading,
    platformRequestsTotal: contractData.allRequestsSummary?.totalPublishedRequests ?? 0,
    overviewRequestsCount: overviewMarketRequests?.list.items.length ?? 0,
    requestsPage: filters.page,
    requestsLimit: filters.limit,
    setRequestsPage: filters.setPage,
    workspaceRequests,
    isWorkspaceRequestsLoading: isUnifiedPrivateRequestsContext
      ? contractData.isWorkspaceRequestsLoading
      : false,
    isWorkspaceRequestsError: isUnifiedPrivateRequestsContext
      ? contractData.isWorkspaceRequestsError
      : false,
  };
}
