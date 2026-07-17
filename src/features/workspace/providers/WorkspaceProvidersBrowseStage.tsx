'use client';

import * as React from 'react';

import { ProviderCard } from '@/components/providers/ProviderCard';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsPaginatedPanel } from '@/components/requests/RequestsPaginatedPanel';
import { selectRequestsAppliedChipsForContentType } from '@/components/requests/requestsFilters.model';
import type { RequestsExplorerSharedFilters } from '@/components/requests/requestsExplorer.types';
import type { WorkspaceBadgeVariant } from '@/features/workspace/shared/WorkspaceBadge';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { RequestsListDensity } from '@/lib/requests/pagination';
import type { WorkspaceProvidersResponseDto } from '@/lib/api/dto/workspace';
import { resolveWorkspaceProviderItemIdentity } from '@/lib/providers/publicProvider';

type WorkspaceProvidersBrowseStageProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  totalProvidersLabel: string;
  totalProviderPages: number;
  emptyTitle: string;
  emptyHint: string;
  providersListDensity: RequestsListDensity;
  onListDensityChange: (value: RequestsListDensity) => void;
  isProvidersLoading: boolean;
  isProvidersError: boolean;
  filteredProvidersCount: number;
  providerCards: WorkspaceProvidersResponseDto['list']['items'];
  favoriteProviderIds: Set<string>;
  pendingFavoriteProviderIds: Set<string>;
  onToggleProviderFavorite: (providerId: string) => void | Promise<void>;
  showFilterControls?: boolean;
  providerProfileHrefResolver?: (providerId: string) => string;
  providerReviewsHrefResolver?: (providerId: string) => string;
} & RequestsExplorerSharedFilters;

function normalizeWorkspaceBadgeVariant(variant: string): WorkspaceBadgeVariant {
  if (variant === 'opportunity') return 'success';
  if (
    variant === 'neutral' ||
    variant === 'info' ||
    variant === 'success' ||
    variant === 'warning' ||
    variant === 'danger' ||
    variant === 'risk' ||
    variant === 'priority'
  ) {
    return variant;
  }

  return 'neutral';
}

export function WorkspaceProvidersBrowseStage({
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
  emptyTitle,
  emptyHint,
  isCategoriesLoading,
  isServicesLoading,
  isPending,
  appliedFilterChips,
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onSortChange,
  onReset,
  setPage,
  providersListDensity,
  onListDensityChange,
  isProvidersLoading,
  isProvidersError,
  filteredProvidersCount,
  providerCards,
  favoriteProviderIds,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
  showFilterControls = true,
  providerProfileHrefResolver,
  providerReviewsHrefResolver,
}: WorkspaceProvidersBrowseStageProps) {
  const onPrevPage = React.useCallback(() => {
    setPage(Math.max(1, page - 1));
  }, [page, setPage]);

  const onNextPage = React.useCallback(() => {
    setPage(Math.min(totalProviderPages, page + 1));
  }, [page, setPage, totalProviderPages]);

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
  ) : null;

  return (
    <RequestsPaginatedPanel
      t={t}
      page={page}
      totalPages={totalProviderPages}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      surface="bare"
      topSlot={topSlot}
      listId="providers-list"
      listAriaLabel={t(I18N_KEYS.requestsPage.providersResultsLabel)}
      listDensity={providersListDensity}
      isLoading={isProvidersLoading}
      isError={isProvidersError}
      isEmpty={!isProvidersError && filteredProvidersCount === 0}
      emptyTitle={emptyTitle}
      emptyHint={emptyHint}
      errorTitle={t(I18N_KEYS.common.loadErrorShort)}
      errorHint={t(I18N_KEYS.common.loadError)}
    >
      {providerCards.map((item) => {
        const providerIdentity = resolveWorkspaceProviderItemIdentity(item);

        return (
          <div key={providerIdentity.id || item.id} className="workspace-list-card-shell">
            <ProviderCard
              variant="list"
              canToggleFavorite
              className="workspace-provider-card"
              isFavorite={favoriteProviderIds.has(providerIdentity.id)}
              isFavoritePending={pendingFavoriteProviderIds.has(providerIdentity.id)}
              favoriteAriaLabel={t(I18N_KEYS.requestDetails.ctaSave)}
              onToggleFavorite={(providerId) => {
                void onToggleProviderFavorite(providerId);
              }}
              provider={{
                ...item.card,
                profileHref: providerProfileHrefResolver?.(providerIdentity.id) ?? item.card.profileHref,
                reviewsHref: providerReviewsHrefResolver?.(providerIdentity.id) ?? item.card.reviewsHref,
                badges: item.card.badges.map((badge) => ({
                  ...badge,
                  variant: normalizeWorkspaceBadgeVariant(badge.variant),
                  tooltip: badge.tooltip ?? undefined,
                })),
                avatarUrl: item.card.avatarUrl ?? undefined,
                cityLabel: item.card.cityLabel ?? undefined,
                responseTime: item.card.responseTime ?? undefined,
                responseTimeLabel: item.card.responseTimeLabel ?? undefined,
                responseRate: item.card.responseRate ?? undefined,
                responseRateLabel: item.card.responseRateLabel ?? undefined,
                aboutPreview: item.card.aboutPreview ?? undefined,
                reviewPreview: item.card.reviewPreview ?? undefined,
                availabilityDatePrefix: item.card.availabilityDatePrefix ?? undefined,
                availabilityDateLabel: item.card.availabilityDateLabel ?? undefined,
                availabilityDateIso: item.card.availabilityDateIso ?? undefined,
                pricingPrefixLabel: item.card.pricingPrefixLabel ?? undefined,
                pricingValueLabel: item.card.pricingValueLabel ?? undefined,
                pricingSuffixLabel: item.card.pricingSuffixLabel ?? undefined,
              }}
            />
          </div>
        );
      })}
    </RequestsPaginatedPanel>
  );
}
