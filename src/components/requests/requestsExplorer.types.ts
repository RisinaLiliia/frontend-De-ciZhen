import type { FilterOption } from '@/components/requests/requestsFilters.types';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

export type RequestsExplorerProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  contentType?: 'requests' | 'providers';
  backHref?: string;
  emptyCtaHref?: string;
  showBack?: boolean;
  onListDensityChange?: (value: 'single' | 'double') => void;
  showTopFilters?: boolean;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

export type RequestsExplorerAppliedFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

export type RequestsExplorerSharedFilters = {
  categoryOptions: FilterOption[];
  serviceOptions: FilterOption[];
  cityOptions: FilterOption[];
  sortOptions: FilterOption[];
  categoryKey: string;
  subcategoryKey: string;
  cityId: string;
  sortBy: string;
  page: number;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  isPending: boolean;
  appliedFilterChips: RequestsExplorerAppliedFilterChip[];
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
  setPage: (page: number) => void;
};

export type RequestsExplorerCatalogIndex = {
  serviceByKey: Map<string, { categoryKey: string; i18n: Record<string, string> }>;
  categoryByKey: Map<string, { i18n: Record<string, string> }>;
  cityById: Map<string, { i18n: Record<string, string> }>;
};

export type RequestsExplorerProvidersContentProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  totalProvidersLabel: string;
  totalProviderPages: number;
  onSetPage: (page: number) => void;
  providersListDensity: 'single' | 'double';
  onListDensityChange: (value: 'single' | 'double') => void;
  isProvidersLoading: boolean;
  isProvidersError: boolean;
  filteredProvidersCount: number;
  pagedProviders: ProviderPublicDto[];
  favoriteProviderIds: Set<string>;
  pendingFavoriteProviderIds: Set<string>;
  onToggleProviderFavorite: (providerId: string) => void | Promise<void>;
  showFilterControls?: boolean;
} & RequestsExplorerSharedFilters;

export type RequestsExplorerRequestsContentProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  emptyCtaHref: string;
  showTopFilters: boolean;
  totalResultsLabel: string;
  requests: RequestResponseDto[];
  isLoading: boolean;
  isError: boolean;
  offersByRequest?: Map<string, OfferDto>;
  favoriteRequestIds?: Set<string>;
  pendingFavoriteRequestIds?: Set<string>;
  pendingOfferRequestId: string | null;
  totalPages: number;
  openOfferSheet: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  toggleRequestFavorite: (requestId: string) => Promise<void> | void;
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;
  onListDensityChange?: (value: 'single' | 'double') => void;
} & RequestsExplorerSharedFilters & RequestsExplorerCatalogIndex;
