import type { OfferDto } from '@/lib/api/dto/offers';
import type {
  RequestsExplorerCatalogIndex,
  RequestsExplorerProvidersContentProps,
  RequestsExplorerRequestsContentProps,
  RequestsExplorerSharedFilters,
} from '@/components/requests/requestsExplorer.types';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type PublicFilter = {
  cityId?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export function hasDefaultPublicFilter(filter: PublicFilter) {
  return (
    !filter.cityId &&
    !filter.categoryKey &&
    !filter.subcategoryKey &&
    (filter.sort ?? 'date_desc') === 'date_desc' &&
    (filter.page ?? 1) === 1 &&
    (filter.limit ?? 20) === 20
  );
}

export function buildOffersByRequestMap(myOffers: OfferDto[]) {
  const map = new Map<string, OfferDto>();
  myOffers.forEach((offer) => {
    if (!map.has(offer.requestId) || offer.updatedAt > (map.get(offer.requestId)?.updatedAt ?? '')) {
      map.set(offer.requestId, offer);
    }
  });
  return map;
}

export function resolveTotalPages(totalResults: number, limit: number) {
  return Math.max(1, Math.ceil(totalResults / Math.max(1, limit)));
}

type SearchParamsLike = { toString: () => string } | null | undefined;

type BuildProvidersContentArgs = {
  t: (key: I18nKey) => string;
  locale: Locale;
  sharedFilters: RequestsExplorerSharedFilters;
  providersData: {
    totalProvidersLabel: string;
    totalProviderPages: number;
    providersListDensity: 'single' | 'double';
    setProvidersListDensity: (value: 'single' | 'double') => void;
    isProvidersLoading: boolean;
    isProvidersError: boolean;
    filteredProvidersCount: number;
    pagedProviders: RequestsExplorerProvidersContentProps['pagedProviders'];
    favoriteProviderIds: Set<string>;
    pendingFavoriteProviderIds: Set<string>;
    toggleProviderFavorite: (providerId: string) => void | Promise<void>;
  };
  showFilterControls: boolean;
};

type BuildRequestsContentArgs = {
  t: (key: I18nKey) => string;
  locale: Locale;
  emptyCtaHref: string;
  sharedFilters: RequestsExplorerSharedFilters;
  requestsData: {
    totalResultsLabel: string;
    requests: RequestsExplorerRequestsContentProps['requests'];
    isLoading: boolean;
    isError: boolean;
    offersByRequest?: RequestsExplorerRequestsContentProps['offersByRequest'];
    favoriteRequestIds?: RequestsExplorerRequestsContentProps['favoriteRequestIds'];
    pendingFavoriteRequestIds?: RequestsExplorerRequestsContentProps['pendingFavoriteRequestIds'];
    pendingOfferRequestId: string | null;
    totalPages: number;
    openOfferSheet: (requestId: string) => void;
    onWithdrawOffer?: (offerId: string) => void;
    toggleRequestFavorite: (requestId: string) => Promise<void> | void;
  };
  catalogIndex: RequestsExplorerCatalogIndex;
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;
  onListDensityChange?: (value: 'single' | 'double') => void;
  showTopFilters: boolean;
};

export function buildRequestsExplorerNextPath(pathname: string, searchParams: SearchParamsLike) {
  const qs = searchParams?.toString();
  return `${pathname}${qs ? `?${qs}` : ''}`;
}

export function pickRequestsExplorerSharedFilters(
  filters: RequestsExplorerSharedFilters,
): RequestsExplorerSharedFilters {
  return {
    categoryOptions: filters.categoryOptions,
    serviceOptions: filters.serviceOptions,
    cityOptions: filters.cityOptions,
    sortOptions: filters.sortOptions,
    categoryKey: filters.categoryKey,
    subcategoryKey: filters.subcategoryKey,
    cityId: filters.cityId,
    sortBy: filters.sortBy,
    page: filters.page,
    isCategoriesLoading: filters.isCategoriesLoading,
    isServicesLoading: filters.isServicesLoading,
    isPending: filters.isPending,
    appliedFilterChips: filters.appliedFilterChips,
    onCategoryChange: filters.onCategoryChange,
    onSubcategoryChange: filters.onSubcategoryChange,
    onCityChange: filters.onCityChange,
    onSortChange: filters.onSortChange,
    onReset: filters.onReset,
    setPage: filters.setPage,
  };
}

export function buildRequestsExplorerProvidersContentProps({
  t,
  locale,
  sharedFilters,
  providersData,
  showFilterControls,
}: BuildProvidersContentArgs): RequestsExplorerProvidersContentProps {
  return {
    t,
    locale,
    ...sharedFilters,
    totalProvidersLabel: providersData.totalProvidersLabel,
    totalProviderPages: providersData.totalProviderPages,
    onSetPage: sharedFilters.setPage,
    providersListDensity: providersData.providersListDensity,
    onListDensityChange: providersData.setProvidersListDensity,
    isProvidersLoading: providersData.isProvidersLoading,
    isProvidersError: providersData.isProvidersError,
    filteredProvidersCount: providersData.filteredProvidersCount,
    pagedProviders: providersData.pagedProviders,
    favoriteProviderIds: providersData.favoriteProviderIds,
    pendingFavoriteProviderIds: providersData.pendingFavoriteProviderIds,
    onToggleProviderFavorite: providersData.toggleProviderFavorite,
    showFilterControls,
  };
}

export function buildRequestsExplorerRequestsContentProps({
  t,
  locale,
  emptyCtaHref,
  sharedFilters,
  requestsData,
  catalogIndex,
  formatDate,
  formatPrice,
  onListDensityChange,
  showTopFilters,
}: BuildRequestsContentArgs): RequestsExplorerRequestsContentProps {
  return {
    t,
    locale,
    emptyCtaHref,
    showTopFilters,
    ...sharedFilters,
    totalResultsLabel: requestsData.totalResultsLabel,
    requests: requestsData.requests,
    isLoading: requestsData.isLoading,
    isError: requestsData.isError,
    offersByRequest: requestsData.offersByRequest,
    favoriteRequestIds: requestsData.favoriteRequestIds,
    pendingFavoriteRequestIds: requestsData.pendingFavoriteRequestIds,
    pendingOfferRequestId: requestsData.pendingOfferRequestId,
    totalPages: requestsData.totalPages,
    openOfferSheet: requestsData.openOfferSheet,
    onWithdrawOffer: requestsData.onWithdrawOffer,
    toggleRequestFavorite: requestsData.toggleRequestFavorite,
    ...catalogIndex,
    formatDate,
    formatPrice,
    onListDensityChange,
  };
}
