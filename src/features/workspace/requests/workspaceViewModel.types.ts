'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type {
  FavoritesView,
  WorkspaceStatusFilter,
  WorkspaceTab,
} from '@/features/workspace/requests/workspace.types';

export type FilterOption = { value: string; label: string };
export type FilterChip = { key: string; label: string; onRemove: () => void };
export type StatusFilter = { key: WorkspaceStatusFilter; label: string };
export type PrimaryAction = { href: string; label: string };

export type ServiceLookup = Map<string, { categoryKey: string; i18n: Record<string, string> }>;
export type CategoryLookup = Map<string, { i18n: Record<string, string> }>;
export type CityLookup = Map<string, { i18n: Record<string, string> }>;

export type OwnerRequestActions = {
  onDelete?: (requestId: string) => void;
  pendingDeleteRequestId?: string | null;
};

export type BaseInput = {
  t: (key: I18nKey) => string;
  locale: Locale;
  statusFilters: StatusFilter[];
  activeStatusFilter: WorkspaceStatusFilter;
  setStatusFilter: (status: WorkspaceStatusFilter) => void;
  isPersonalized: boolean;
  offersByRequest: Map<string, OfferDto>;
  favoriteRequestIds: Set<string>;
  onToggleRequestFavorite: (requestId: string) => void;
  onOpenOfferSheet: (requestId: string) => void;
  onWithdrawOffer: (requestId: string) => void;
  onOpenChatThread: (offer: OfferDto) => void;
  pendingOfferRequestId: string | null;
  pendingFavoriteRequestIds: Set<string>;
  serviceByKey: ServiceLookup;
  categoryByKey: CategoryLookup;
  cityById: CityLookup;
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;
};

export type PrivateInput = BaseInput & {
  isWorkspaceAuthed: boolean;
  activeWorkspaceTab: WorkspaceTab;
  showWorkspaceHeader: boolean;
  showWorkspaceHeading: boolean;
  primaryAction: PrimaryAction;
  onPrimaryActionClick: () => void;

  isMyRequestsLoading: boolean;
  filteredMyRequests: RequestResponseDto[];
  ownerRequestActions: OwnerRequestActions;

  isMyOffersLoading: boolean;
  filteredMyOffers: OfferDto[];
  myOfferRequests: RequestResponseDto[];

  isProviderContractsLoading: boolean;
  isClientContractsLoading: boolean;
  filteredContracts: ContractDto[];
  contractRequests: RequestResponseDto[];
  contractOffersByRequest: Map<string, OfferDto>;

  isFavoritesLoading: boolean;
  favoritesItems: Array<{ id: string }>;
  hasFavoriteRequests: boolean;
  hasFavoriteProviders: boolean;
  resolvedFavoritesView: FavoritesView;
  setFavoritesView: (view: FavoritesView) => void;
  favoriteRequests: RequestResponseDto[];
  isFavoriteRequestsLoading: boolean;
  favoriteProviderCards: React.ReactNode;

  isMyReviewsLoading: boolean;
  myReviews: ReviewDto[];
};

export type PublicInput = BaseInput & {
  categoryOptions: FilterOption[];
  serviceOptions: FilterOption[];
  cityOptions: FilterOption[];
  sortOptions: FilterOption[];
  categoryKey: string;
  subcategoryKey: string;
  cityId: string;
  sortBy: string;
  totalResultsLabel: string;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  isFiltersPending: boolean;
  appliedFilterChips: FilterChip[];
  onCategoryChangeTracked: (value: string) => void;
  onSubcategoryChangeTracked: (value: string) => void;
  onCityChangeTracked: (value: string) => void;
  onSortChangeTracked: (value: string) => void;
  onResetTracked: () => void;

  hasActivePublicFilter: boolean;
  isLoading: boolean;
  isError: boolean;
  requestsCount: number;
  requests: RequestResponseDto[];

  page: number;
  limit: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
};
