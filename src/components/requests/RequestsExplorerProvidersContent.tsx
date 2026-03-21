'use client';

import * as React from 'react';

import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { Locale } from '@/lib/i18n/t';
import type { FilterOption } from '@/components/requests/RequestsFilters';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';

type Props = {
  t: (key: I18nKey) => string;
  locale: Locale;
  categoryOptions: FilterOption[];
  serviceOptions: FilterOption[];
  cityOptions: FilterOption[];
  sortOptions: FilterOption[];
  categoryKey: string;
  subcategoryKey: string;
  cityId: string;
  sortBy: string;
  totalProvidersLabel: string;
  page: number;
  totalProviderPages: number;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  isPending: boolean;
  appliedFilterChips: Array<{ key: string; label: string; onRemove: () => void }>;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
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
};

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
}: Props) {
  return (
    <section className="panel requests-panel">
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
        appliedChips={appliedFilterChips.filter((chip) => chip.key !== 'sort')}
        onCategoryChange={onCategoryChange}
        onSubcategoryChange={onSubcategoryChange}
        onCityChange={onCityChange}
        onSortChange={onSortChange}
        onReset={onReset}
        listDensity={providersListDensity}
        onListDensityChange={onListDensityChange}
        onPrevPage={() => onSetPage(Math.max(1, page - 1))}
        onNextPage={() => onSetPage(Math.min(totalProviderPages, page + 1))}
      />

      <section
        id="providers-list"
        className={`requests-list requests-list--stable ${providersListDensity === 'double' ? 'is-double' : 'is-single'}`.trim()}
        aria-live="polite"
      >
        <WorkspaceContentState
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
        </WorkspaceContentState>
      </section>

      <div className="requests-pagination">
        <span className="requests-page-nav__label">
          {page}/{Math.max(1, totalProviderPages)}
        </span>
        <div className="requests-page-nav" role="group" aria-label={t(I18N_KEYS.requestsPage.paginationBottomLabel)}>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={() => onSetPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            aria-label={t(I18N_KEYS.requestsPage.paginationPrev)}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={() => onSetPage(Math.min(totalProviderPages, page + 1))}
            disabled={page >= totalProviderPages}
            aria-label={t(I18N_KEYS.requestsPage.paginationNext)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
