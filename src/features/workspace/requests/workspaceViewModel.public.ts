'use client';

import type { ComponentProps } from 'react';

import {
  buildRequestsPublicContentProps,
  buildRequestsPublicFiltersProps,
} from '@/components/requests/requestsPublicContent.model';
import type { RequestsFilters } from '@/components/requests/RequestsFilters';
import { buildWorkspacePublicRequestsListProps } from '@/features/workspace/requests/workspaceViewModel.helpers';
import { buildWorkspaceListContext } from '@/features/workspace/requests/workspaceViewModel.shared';
import { resolveRequestsListDensityForPageSize, resolveRequestsPageSizeForDensity } from '@/lib/requests/pagination';
import type {
  PublicInput,
} from '@/features/workspace/requests/workspaceViewModel.types';
import type { PublicContentProps } from '@/features/workspace/requests/PublicContent';

type BuildPublicFiltersArgs = Pick<
  PublicInput,
  | 't'
  | 'locale'
  | 'categoryOptions'
  | 'serviceOptions'
  | 'cityOptions'
  | 'sortOptions'
  | 'categoryKey'
  | 'subcategoryKey'
  | 'cityId'
  | 'sortBy'
  | 'totalResultsLabel'
  | 'isCategoriesLoading'
  | 'isServicesLoading'
  | 'isFiltersPending'
  | 'appliedFilterChips'
  | 'onCategoryChangeTracked'
  | 'onSubcategoryChangeTracked'
  | 'onCityChangeTracked'
  | 'onSortChangeTracked'
  | 'onResetTracked'
>;

type BuildPublicContentArgs = Pick<
  PublicInput,
  | 't'
  | 'locale'
  | 'statusFilters'
  | 'activeStatusFilter'
  | 'isLoading'
  | 'isError'
  | 'requestsCount'
  | 'hasActivePublicFilter'
  | 'requests'
  | 'serviceByKey'
  | 'categoryByKey'
  | 'cityById'
  | 'formatDate'
  | 'formatPrice'
  | 'isPersonalized'
  | 'offersByRequest'
  | 'favoriteRequestIds'
  | 'onToggleRequestFavorite'
  | 'onOpenOfferSheet'
  | 'onWithdrawOffer'
  | 'onOpenChatThread'
  | 'pendingOfferRequestId'
  | 'pendingFavoriteRequestIds'
  | 'page'
  | 'limit'
  | 'totalPages'
  | 'setLimit'
> & {
  filtersProps: ComponentProps<typeof RequestsFilters>;
  onStatusFilterChange: (status: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function buildWorkspacePublicFiltersProps({
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
}: BuildPublicFiltersArgs): ComponentProps<typeof RequestsFilters> {
  return buildRequestsPublicFiltersProps({
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
  });
}

export function buildWorkspacePublicContentProps({
  t,
  locale,
  statusFilters,
  activeStatusFilter,
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
  limit,
  totalPages,
  setLimit,
  filtersProps,
  onStatusFilterChange,
  onPrevPage,
  onNextPage,
}: BuildPublicContentArgs): PublicContentProps {
  const listContext = buildWorkspaceListContext({
    t,
    locale,
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
  });

  return buildRequestsPublicContentProps({
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
    requestsListProps: buildWorkspacePublicRequestsListProps(listContext, {
      requests,
      isLoading,
      isError,
    }),
    page,
    totalPages,
    onPrevPage,
    onNextPage,
    listDensity: resolveRequestsListDensityForPageSize(limit),
    onListDensityChange: (density) => setLimit(resolveRequestsPageSizeForDensity(density)),
  });
}
