'use client';

import { buildRequestsListProps } from '@/components/requests/requestsListProps';
import { PublicContent } from '@/features/workspace/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { RequestsExplorerRequestsContentProps } from '@/components/requests/requestsExplorer.types';

export function RequestsExplorerRequestsContent({
  t,
  locale,
  emptyCtaHref,
  showTopFilters,
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
  isPending,
  appliedFilterChips,
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onSortChange,
  onReset,
  requests,
  isLoading,
  isError,
  offersByRequest,
  favoriteRequestIds,
  pendingFavoriteRequestIds,
  pendingOfferRequestId,
  totalPages,
  openOfferSheet,
  onWithdrawOffer,
  toggleRequestFavorite,
  serviceByKey,
  categoryByKey,
  cityById,
  formatDate,
  formatPrice,
  page,
  setPage,
  onListDensityChange,
}: RequestsExplorerRequestsContentProps) {
  const onPrevPage = () => setPage(Math.max(1, page - 1));
  const onNextPage = () => setPage(Math.min(totalPages, page + 1));

  return (
    <PublicContent
      t={t}
      filtersProps={{
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
        isPending,
        appliedChips: appliedFilterChips,
        onCategoryChange,
        onSubcategoryChange,
        onCityChange,
        onSortChange,
        onReset,
      }}
      statusFilters={[]}
      activeStatusFilter="all"
      onStatusFilterChange={() => {}}
      isLoading={isLoading}
      isError={isError}
      requestsCount={requests.length}
      hasActivePublicFilter={appliedFilterChips.length > 0}
      emptyCtaHref={emptyCtaHref}
      requestsListProps={buildRequestsListProps({
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
        enableOfferActions: true,
        offersByRequest,
        favoriteRequestIds,
        pendingFavoriteRequestIds,
        onToggleFavorite: (requestId) => {
          void toggleRequestFavorite(requestId);
        },
        onSendOffer: openOfferSheet,
        onEditOffer: openOfferSheet,
        onWithdrawOffer,
        pendingOfferRequestId,
        showFavoriteButton: true,
      })}
      page={page}
      totalPages={totalPages}
      resultsLabel={t(I18N_KEYS.requestsPage.countLabel)}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      onListDensityChange={onListDensityChange}
      showFilterControls={showTopFilters}
    />
  );
}
