'use client';

import * as React from 'react';

import { RequestsFilters, RequestsResultsSummary } from '@/components/requests/RequestsFilters';
import { RequestsPaginatedPanel } from '@/components/requests/RequestsPaginatedPanel';
import { selectRequestsAppliedChipsForContentType } from '@/components/requests/requestsFilters.model';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { RequestsExplorerProvidersContentProps } from '@/components/requests/requestsExplorer.types';

export function RequestsExplorerProvidersContent({
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
  totalProvidersLabel,
  page,
  totalProviderPages,
  isCategoriesLoading,
  isServicesLoading,
  isPending,
  appliedFilterChips,
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onSortChange,
  onReset,
  onSetPage,
  providersListDensity,
  onListDensityChange,
  isProvidersLoading,
  isProvidersError,
  filteredProvidersCount,
  pagedProviders,
  favoriteProviderIds,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
  showFilterControls = true,
}: RequestsExplorerProvidersContentProps) {
  const onPrevPage = () => onSetPage(Math.max(1, page - 1));
  const onNextPage = () => onSetPage(Math.min(totalProviderPages, page + 1));

  const topSlot = showFilterControls ? (
    <RequestsFilters
      t={t}
      locale={locale}
      categoryOptions={categoryOptions}
      serviceOptions={serviceOptions}
      cityOptions={cityOptions}
      sortOptions={sortOptions}
      categoryKey={categoryKey}
      subcategoryKey={subcategoryKey}
      cityId={cityId}
      sortBy={sortBy}
      totalResults={totalProvidersLabel}
      resultsLabel={t(I18N_KEYS.requestsPage.providersResultsLabel)}
      page={page}
      totalPages={totalProviderPages}
      isCategoriesLoading={isCategoriesLoading}
      isServicesLoading={isServicesLoading}
      isPending={isPending}
      appliedChips={selectRequestsAppliedChipsForContentType(appliedFilterChips, 'providers')}
      onCategoryChange={onCategoryChange}
      onSubcategoryChange={onSubcategoryChange}
      onCityChange={onCityChange}
      onSortChange={onSortChange}
      onReset={onReset}
      listDensity={providersListDensity}
      onListDensityChange={onListDensityChange}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
    />
  ) : (
    <RequestsResultsSummary
      t={t}
      totalResults={totalProvidersLabel}
      resultsLabel={t(I18N_KEYS.requestsPage.providersResultsLabel)}
      page={page}
      totalPages={totalProviderPages}
      isPending={isPending}
      listDensity={providersListDensity}
      onListDensityChange={onListDensityChange}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
    />
  );

  return (
    <RequestsPaginatedPanel
      t={t}
      page={page}
      totalPages={totalProviderPages}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      topSlot={topSlot}
      listId="providers-list"
      listAriaLabel={t(I18N_KEYS.requestsPage.providersResultsLabel)}
      listDensity={providersListDensity}
      isLoading={isProvidersLoading}
      isEmpty={!isProvidersError && filteredProvidersCount === 0}
      emptyTitle={t(I18N_KEYS.requestsPage.emptyProvidersFilteredTitle)}
      emptyHint={t(I18N_KEYS.requestsPage.emptyProvidersFilteredHint)}
    >
      {pagedProviders.map((provider) => (
        <ProviderCard
          key={provider.id}
          variant="list"
          canToggleFavorite
          isFavorite={favoriteProviderIds.has(provider.id)}
          isFavoritePending={pendingFavoriteProviderIds.has(provider.id)}
          onToggleFavorite={(providerId) => {
            void onToggleProviderFavorite(providerId);
          }}
          provider={{
            ...mapPublicProviderToCard({
              t,
              locale,
              provider,
              roleLabel: subcategoryKey !== ALL_OPTION_KEY
                ? (serviceOptions.find((item) => item.value === subcategoryKey)?.label ?? '')
                : '',
              cityLabel: cityOptions.find((item) => item.value === provider.cityId)?.label ?? '',
              profileHref: `/providers/${provider.id}`,
              reviewsHref: `/providers/${provider.id}#reviews`,
              ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
              status: 'online',
            }),
            reviewPreview: t(I18N_KEYS.homePublic.providerReviewPreviewDefault),
          }}
        />
      ))}
    </RequestsPaginatedPanel>
  );
}
