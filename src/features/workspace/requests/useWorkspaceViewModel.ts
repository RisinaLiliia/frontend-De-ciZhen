'use client';

import * as React from 'react';

import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import type { ContractDto } from '@/lib/api/dto/contracts';
import { WorkspaceContent } from '@/features/workspace/requests/WorkspaceContent';
import { PublicContent } from '@/features/workspace/requests/PublicContent';
import type {
  FavoritesView,
  ReviewsView,
  WorkspaceStatusFilter,
  WorkspaceTab,
} from '@/features/workspace/requests/workspace.types';
import { RequestsFilters } from '@/components/requests/RequestsFilters';

type FilterOption = { value: string; label: string };
type FilterChip = { key: string; label: string; onRemove: () => void };
type StatusFilter = { key: WorkspaceStatusFilter; label: string };
type PrimaryAction = { href: string; label: string };

type ServiceLookup = Map<string, { categoryKey: string; i18n: Record<string, string> }>;
type CategoryLookup = Map<string, { i18n: Record<string, string> }>;
type CityLookup = Map<string, { i18n: Record<string, string> }>;

type OwnerRequestActions = {
  onDelete?: (requestId: string) => void;
  pendingDeleteRequestId?: string | null;
};

type BaseInput = {
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

type PrivateInput = BaseInput & {
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
  activeReviewsView: ReviewsView;
  setReviewsView: (view: ReviewsView) => void;
  reviewCards: React.ReactNode;
};

type PublicInput = BaseInput & {
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
  totalPages: number;
  setPage: (page: number) => void;
};

export function useWorkspacePrivateViewModel(params: PrivateInput) {
  const {
    t,
    locale,
    activeWorkspaceTab,
    showWorkspaceHeader,
    showWorkspaceHeading,
    primaryAction,
    onPrimaryActionClick,
    statusFilters,
    activeStatusFilter,
    setStatusFilter,
    isMyRequestsLoading,
    filteredMyRequests,
    ownerRequestActions,
    isMyOffersLoading,
    filteredMyOffers,
    myOfferRequests,
    isProviderContractsLoading,
    isClientContractsLoading,
    filteredContracts,
    contractRequests,
    contractOffersByRequest,
    isFavoritesLoading,
    favoritesItems,
    hasFavoriteRequests,
    hasFavoriteProviders,
    resolvedFavoritesView,
    setFavoritesView,
    favoriteRequests,
    isFavoriteRequestsLoading,
    favoriteProviderCards,
    isMyReviewsLoading,
    myReviews,
    activeReviewsView,
    setReviewsView,
    reviewCards,
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
  } = params;

  const workspaceContentProps = React.useMemo<React.ComponentProps<typeof WorkspaceContent>>(
    () => ({
      t,
      activeWorkspaceTab,
      showWorkspaceHeader,
      showWorkspaceHeading,
      primaryAction,
      onPrimaryActionClick,
      statusFilters,
      activeStatusFilter,
      setStatusFilter,
      myRequestsState: {
        isLoading: isMyRequestsLoading,
        isEmpty: filteredMyRequests.length === 0,
      },
      myRequestsListProps: {
        t,
        locale,
        requests: filteredMyRequests,
        isLoading: isMyRequestsLoading,
        isError: false,
        serviceByKey,
        categoryByKey,
        cityById,
        formatDate,
        formatPrice,
        ownerRequestActions,
      },
      myOffersState: {
        isLoading: isMyOffersLoading,
        isEmpty: filteredMyOffers.length === 0,
      },
      myOffersListProps: {
        t,
        locale,
        requests: myOfferRequests,
        isLoading: isMyOffersLoading,
        isError: false,
        serviceByKey,
        categoryByKey,
        cityById,
        formatDate,
        formatPrice,
        enableOfferActions: true,
        hideRecurringBadge: true,
        showFavoriteButton: false,
        offersByRequest,
        onSendOffer: onOpenOfferSheet,
        onEditOffer: onOpenOfferSheet,
        onWithdrawOffer,
        onOpenChatThread,
        pendingOfferRequestId,
      },
      contractsState: {
        isLoading: isProviderContractsLoading || isClientContractsLoading,
        isEmpty: filteredContracts.length === 0,
      },
      contractsListProps: {
        t,
        locale,
        requests: contractRequests,
        isLoading: isProviderContractsLoading || isClientContractsLoading,
        isError: false,
        serviceByKey,
        categoryByKey,
        cityById,
        formatDate,
        formatPrice,
        enableOfferActions: true,
        hideRecurringBadge: true,
        showFavoriteButton: false,
        offersByRequest: contractOffersByRequest,
        onOpenChatThread,
      },
      favoritesState: {
        isLoading: isFavoritesLoading,
        isEmpty: favoritesItems.length === 0,
        hasFavoriteRequests,
        hasFavoriteProviders,
        resolvedView: resolvedFavoritesView,
      },
      onFavoritesViewChange: setFavoritesView,
      favoriteRequestsListProps: {
        t,
        locale,
        requests: favoriteRequests,
        isLoading: isFavoriteRequestsLoading,
        isError: false,
        serviceByKey,
        categoryByKey,
        cityById,
        formatDate,
        formatPrice,
        enableOfferActions: true,
        hideRecurringBadge: isPersonalized,
        showFavoriteButton: true,
        offersByRequest,
        favoriteRequestIds,
        onToggleFavorite: onToggleRequestFavorite,
        onSendOffer: onOpenOfferSheet,
        onEditOffer: onOpenOfferSheet,
        onWithdrawOffer,
        onOpenChatThread,
        pendingOfferRequestId,
        pendingFavoriteRequestIds,
      },
      favoriteProvidersNode: favoriteProviderCards,
      reviewsState: {
        isLoading: isMyReviewsLoading,
        isEmpty: myReviews.length === 0,
        activeView: activeReviewsView,
      },
      onReviewsViewChange: setReviewsView,
      reviewCardsNode: reviewCards,
    }),
    [
      activeReviewsView,
      activeStatusFilter,
      activeWorkspaceTab,
      categoryByKey,
      cityById,
      contractOffersByRequest,
      contractRequests,
      favoriteProviderCards,
      favoriteRequestIds,
      favoriteRequests,
      favoritesItems,
      filteredContracts,
      filteredMyOffers,
      filteredMyRequests,
      formatDate,
      formatPrice,
      hasFavoriteProviders,
      hasFavoriteRequests,
      isClientContractsLoading,
      isFavoriteRequestsLoading,
      isFavoritesLoading,
      isMyOffersLoading,
      isMyRequestsLoading,
      isMyReviewsLoading,
      isPersonalized,
      isProviderContractsLoading,
      locale,
      myOfferRequests,
      myReviews,
      onOpenChatThread,
      onOpenOfferSheet,
      onPrimaryActionClick,
      onToggleRequestFavorite,
      onWithdrawOffer,
      ownerRequestActions,
      pendingFavoriteRequestIds,
      pendingOfferRequestId,
      primaryAction,
      resolvedFavoritesView,
      reviewCards,
      serviceByKey,
      setFavoritesView,
      setReviewsView,
      setStatusFilter,
      showWorkspaceHeader,
      showWorkspaceHeading,
      statusFilters,
      t,
      offersByRequest,
    ],
  );

  return {
    workspaceContentProps,
  };
}

export function useWorkspacePublicViewModel(params: PublicInput) {
  const {
    t,
    locale,
    categoryOptions,
    serviceOptions,
    cityOptions,
    sortOptions,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    totalResultsLabel,
    isCategoriesLoading,
    isServicesLoading,
    isFiltersPending,
    appliedFilterChips,
    onCategoryChangeTracked,
    onSubcategoryChangeTracked,
    onCityChangeTracked,
    onSortChangeTracked,
    onResetTracked,
    statusFilters,
    activeStatusFilter,
    setStatusFilter,
    isLoading,
    isError,
    requestsCount,
    hasActivePublicFilter,
    requests,
    serviceByKey,
    categoryByKey,
    cityById,
    formatDate,
    formatPrice,
    isPersonalized,
    offersByRequest,
    favoriteRequestIds,
    onToggleRequestFavorite,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
    pendingOfferRequestId,
    pendingFavoriteRequestIds,
    page,
    totalPages,
    setPage,
  } = params;

  const onStatusFilterChange = React.useCallback(
    (status: string) => setStatusFilter(status as WorkspaceStatusFilter),
    [setStatusFilter],
  );
  const onPrevPage = React.useCallback(() => setPage(Math.max(1, page - 1)), [page, setPage]);
  const onNextPage = React.useCallback(
    () => setPage(Math.min(totalPages, page + 1)),
    [page, setPage, totalPages],
  );

  const filtersProps = React.useMemo<React.ComponentProps<typeof RequestsFilters>>(
    () => ({
      t,
      locale,
      categoryOptions,
      serviceOptions,
      cityOptions,
      sortOptions,
      categoryKey,
      subcategoryKey,
      cityId,
      sortBy,
      totalResults: totalResultsLabel,
      isCategoriesLoading,
      isServicesLoading,
      isPending: isFiltersPending,
      appliedChips: appliedFilterChips,
      onCategoryChange: onCategoryChangeTracked,
      onSubcategoryChange: onSubcategoryChangeTracked,
      onCityChange: onCityChangeTracked,
      onSortChange: onSortChangeTracked,
      onReset: onResetTracked,
    }),
    [
      appliedFilterChips,
      categoryKey,
      categoryOptions,
      cityId,
      cityOptions,
      isCategoriesLoading,
      isFiltersPending,
      isServicesLoading,
      locale,
      onCategoryChangeTracked,
      onCityChangeTracked,
      onResetTracked,
      onSortChangeTracked,
      onSubcategoryChangeTracked,
      serviceOptions,
      sortBy,
      sortOptions,
      subcategoryKey,
      t,
      totalResultsLabel,
    ],
  );

  const publicContentProps = React.useMemo<React.ComponentProps<typeof PublicContent>>(
    () => ({
      t,
      filtersProps,
      statusFilters,
      activeStatusFilter,
      onStatusFilterChange,
      isLoading,
      isError,
      requestsCount,
      hasActivePublicFilter,
      emptyCtaHref: '/workspace?section=requests',
      requestsListProps: {
        t,
        locale,
        requests,
        isLoading,
        isError,
        serviceByKey,
        categoryByKey,
        cityById,
        formatDate,
        formatPrice,
        enableOfferActions: isPersonalized,
        hideRecurringBadge: isPersonalized,
        showFavoriteButton: true,
        offersByRequest,
        favoriteRequestIds,
        onToggleFavorite: onToggleRequestFavorite,
        onSendOffer: onOpenOfferSheet,
        onEditOffer: onOpenOfferSheet,
        onWithdrawOffer,
        onOpenChatThread,
        pendingOfferRequestId,
        pendingFavoriteRequestIds,
      },
      page,
      totalPages,
      resultsLabel: t(I18N_KEYS.requestsPage.resultsLabel),
      onPrevPage,
      onNextPage,
    }),
    [
      activeStatusFilter,
      categoryByKey,
      cityById,
      filtersProps,
      formatDate,
      formatPrice,
      hasActivePublicFilter,
      isError,
      isLoading,
      isPersonalized,
      locale,
      onNextPage,
      onOpenChatThread,
      onOpenOfferSheet,
      onPrevPage,
      onStatusFilterChange,
      onToggleRequestFavorite,
      onWithdrawOffer,
      offersByRequest,
      page,
      pendingFavoriteRequestIds,
      pendingOfferRequestId,
      requests,
      requestsCount,
      serviceByKey,
      statusFilters,
      t,
      totalPages,
      favoriteRequestIds,
    ],
  );

  return {
    publicContentProps,
  };
}
