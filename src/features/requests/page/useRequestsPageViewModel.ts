'use client';

import * as React from 'react';

import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import type { ContractDto } from '@/lib/api/dto/contracts';
import { WorkspaceContent } from '@/features/requests/page/WorkspaceContent';
import { PublicContent } from '@/features/requests/page/PublicContent';
import type { FavoritesView, ReviewsView, WorkspaceStatusFilter, WorkspaceTab } from '@/features/requests/page/workspace';
import { RequestsFilters } from '@/components/requests/RequestsFilters';

type FilterOption = { value: string; label: string };
type FilterChip = { key: string; label: string; onRemove: () => void };
type StatusFilter = { key: WorkspaceStatusFilter; label: string };
type PrimaryAction = { href: string; label: string };
type OwnerRequestActions = {
  onDelete?: (requestId: string) => void;
  pendingDeleteRequestId?: string | null;
};

type Input = {
  t: (key: I18nKey) => string;
  locale: Locale;
  activeWorkspaceTab: WorkspaceTab;
  showWorkspaceHeader: boolean;
  showWorkspaceHeading: boolean;
  primaryAction: PrimaryAction;
  onPrimaryActionClick: () => void;
  statusFilters: StatusFilter[];
  activeStatusFilter: WorkspaceStatusFilter;
  setStatusFilter: (status: WorkspaceStatusFilter) => void;

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
  isWorkspaceRoute: boolean;
  isLoading: boolean;
  isError: boolean;
  requestsCount: number;
  requests: RequestResponseDto[];
  isPersonalized: boolean;
  offersByRequest: Map<string, OfferDto>;
  favoriteRequestIds: Set<string>;
  onToggleRequestFavorite: (requestId: string) => void;
  onOpenOfferSheet: (requestId: string) => void;
  onWithdrawOffer: (requestId: string) => void;
  pendingOfferRequestId: string | null;
  pendingFavoriteRequestIds: Set<string>;
  isAuthed: boolean;
  serviceByKey: Map<string, { categoryKey: string; i18n: Record<string, string> }>;
  categoryByKey: Map<string, { i18n: Record<string, string> }>;
  cityById: Map<string, { i18n: Record<string, string> }>;
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;

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

  page: number;
  totalPages: number;
  setPage: (page: number) => void;
};

export function useRequestsPageViewModel(params: Input) {
  const filtersProps: React.ComponentProps<typeof RequestsFilters> = {
    t: params.t,
    locale: params.locale,
    categoryOptions: params.categoryOptions,
    serviceOptions: params.serviceOptions,
    cityOptions: params.cityOptions,
    sortOptions: params.sortOptions,
    categoryKey: params.categoryKey,
    subcategoryKey: params.subcategoryKey,
    cityId: params.cityId,
    sortBy: params.sortBy,
    totalResults: params.totalResultsLabel,
    isCategoriesLoading: params.isCategoriesLoading,
    isServicesLoading: params.isServicesLoading,
    isPending: params.isFiltersPending,
    appliedChips: params.appliedFilterChips,
    onCategoryChange: params.onCategoryChangeTracked,
    onSubcategoryChange: params.onSubcategoryChangeTracked,
    onCityChange: params.onCityChangeTracked,
    onSortChange: params.onSortChangeTracked,
    onReset: params.onResetTracked,
  };

  const workspaceContentProps: React.ComponentProps<typeof WorkspaceContent> = {
      t: params.t,
      activeWorkspaceTab: params.activeWorkspaceTab,
      showWorkspaceHeader: params.showWorkspaceHeader,
      showWorkspaceHeading: params.showWorkspaceHeading,
      primaryAction: params.primaryAction,
      onPrimaryActionClick: params.onPrimaryActionClick,
      statusFilters: params.statusFilters,
      activeStatusFilter: params.activeStatusFilter,
      setStatusFilter: params.setStatusFilter,
      filtersProps,
      hasActivePublicFilter: params.hasActivePublicFilter,
      newOrdersResetHref: '/orders?tab=new-orders',
      newOrdersState: {
        isLoading: params.isLoading,
        isError: params.isError,
        requestsCount: params.requestsCount,
      },
      newOrdersListProps: {
        t: params.t,
        locale: params.locale,
        requests: params.requests,
        isLoading: params.isLoading,
        isError: params.isError,
        serviceByKey: params.serviceByKey,
        categoryByKey: params.categoryByKey,
        cityById: params.cityById,
        formatDate: params.formatDate,
        formatPrice: params.formatPrice,
        isProviderPersonalized: params.isPersonalized,
        offersByRequest: params.offersByRequest,
        favoriteRequestIds: params.favoriteRequestIds,
        onToggleFavorite: params.onToggleRequestFavorite,
        onSendOffer: params.onOpenOfferSheet,
        onEditOffer: params.onOpenOfferSheet,
        onWithdrawOffer: params.onWithdrawOffer,
        pendingOfferRequestId: params.pendingOfferRequestId,
        pendingFavoriteRequestIds: params.pendingFavoriteRequestIds,
        showStaticFavoriteIcon: !params.isAuthed,
      },
      myRequestsState: {
        isLoading: params.isMyRequestsLoading,
        isEmpty: params.filteredMyRequests.length === 0,
      },
      myRequestsListProps: {
        t: params.t,
        locale: params.locale,
        requests: params.filteredMyRequests,
        isLoading: params.isMyRequestsLoading,
        isError: false,
        serviceByKey: params.serviceByKey,
        categoryByKey: params.categoryByKey,
        cityById: params.cityById,
        formatDate: params.formatDate,
        formatPrice: params.formatPrice,
        ownerRequestActions: params.ownerRequestActions,
      },
      myOffersState: {
        isLoading: params.isMyOffersLoading,
        isEmpty: params.filteredMyOffers.length === 0,
      },
      myOffersListProps: {
        t: params.t,
        locale: params.locale,
        requests: params.myOfferRequests,
        isLoading: params.isMyOffersLoading,
        isError: false,
        serviceByKey: params.serviceByKey,
        categoryByKey: params.categoryByKey,
        cityById: params.cityById,
        formatDate: params.formatDate,
        formatPrice: params.formatPrice,
        isProviderPersonalized: true,
        offersByRequest: params.offersByRequest,
        onSendOffer: params.onOpenOfferSheet,
        onEditOffer: params.onOpenOfferSheet,
        onWithdrawOffer: params.onWithdrawOffer,
        pendingOfferRequestId: params.pendingOfferRequestId,
        showStaticFavoriteIcon: false,
      },
      contractsState: {
        isLoading: params.isProviderContractsLoading || params.isClientContractsLoading,
        isEmpty: params.filteredContracts.length === 0,
      },
      contractsListProps: {
        t: params.t,
        locale: params.locale,
        requests: params.contractRequests,
        isLoading: params.isProviderContractsLoading || params.isClientContractsLoading,
        isError: false,
        serviceByKey: params.serviceByKey,
        categoryByKey: params.categoryByKey,
        cityById: params.cityById,
        formatDate: params.formatDate,
        formatPrice: params.formatPrice,
        isProviderPersonalized: true,
        offersByRequest: params.contractOffersByRequest,
      },
      favoritesState: {
        isLoading: params.isFavoritesLoading,
        isEmpty: params.favoritesItems.length === 0,
        hasFavoriteRequests: params.hasFavoriteRequests,
        hasFavoriteProviders: params.hasFavoriteProviders,
        resolvedView: params.resolvedFavoritesView,
      },
      onFavoritesViewChange: params.setFavoritesView,
      favoriteRequestsListProps: {
        t: params.t,
        locale: params.locale,
        requests: params.favoriteRequests,
        isLoading: params.isFavoriteRequestsLoading,
        isError: false,
        serviceByKey: params.serviceByKey,
        categoryByKey: params.categoryByKey,
        cityById: params.cityById,
        formatDate: params.formatDate,
        formatPrice: params.formatPrice,
        isProviderPersonalized: params.isPersonalized,
        offersByRequest: params.offersByRequest,
        favoriteRequestIds: params.favoriteRequestIds,
        onToggleFavorite: params.onToggleRequestFavorite,
        onSendOffer: params.onOpenOfferSheet,
        onEditOffer: params.onOpenOfferSheet,
        onWithdrawOffer: params.onWithdrawOffer,
        pendingOfferRequestId: params.pendingOfferRequestId,
        pendingFavoriteRequestIds: params.pendingFavoriteRequestIds,
        showStaticFavoriteIcon: false,
      },
      favoriteProvidersNode: params.favoriteProviderCards,
      reviewsState: {
        isLoading: params.isMyReviewsLoading,
        isEmpty: params.myReviews.length === 0,
        activeView: params.activeReviewsView,
      },
      onReviewsViewChange: params.setReviewsView,
      reviewCardsNode: params.reviewCards,
      pagination: {
        page: params.page,
        totalPages: params.totalPages,
        totalResultsLabel: params.totalResultsLabel,
        resultsLabel: params.t(I18N_KEYS.requestsPage.resultsLabel),
        onPrevPage: () => params.setPage(Math.max(1, params.page - 1)),
        onNextPage: () => params.setPage(Math.min(params.totalPages, params.page + 1)),
      },
  };

  const publicContentProps: React.ComponentProps<typeof PublicContent> = {
      t: params.t,
      filtersProps,
      statusFilters: params.statusFilters,
      activeStatusFilter: params.activeStatusFilter,
      onStatusFilterChange: (status: string) => params.setStatusFilter(status as WorkspaceStatusFilter),
      isLoading: params.isLoading,
      isError: params.isError,
      requestsCount: params.requestsCount,
      hasActivePublicFilter: params.hasActivePublicFilter,
      emptyCtaHref: '/requests',
      requestsListProps: {
        t: params.t,
        locale: params.locale,
        requests: params.requests,
        isLoading: params.isLoading,
        isError: params.isError,
        serviceByKey: params.serviceByKey,
        categoryByKey: params.categoryByKey,
        cityById: params.cityById,
        formatDate: params.formatDate,
        formatPrice: params.formatPrice,
        isProviderPersonalized: params.isPersonalized,
        offersByRequest: params.offersByRequest,
        favoriteRequestIds: params.favoriteRequestIds,
        onToggleFavorite: params.onToggleRequestFavorite,
        onSendOffer: params.onOpenOfferSheet,
        onEditOffer: params.onOpenOfferSheet,
        onWithdrawOffer: params.onWithdrawOffer,
        pendingOfferRequestId: params.pendingOfferRequestId,
        pendingFavoriteRequestIds: params.pendingFavoriteRequestIds,
        showStaticFavoriteIcon: !params.isAuthed,
      },
      page: params.page,
      totalPages: params.totalPages,
      resultsLabel: params.t(I18N_KEYS.requestsPage.resultsLabel),
      onPrevPage: () => params.setPage(Math.max(1, params.page - 1)),
      onNextPage: () => params.setPage(Math.min(params.totalPages, params.page + 1)),
  };

  return {
    workspaceContentProps,
    publicContentProps,
  };
}
