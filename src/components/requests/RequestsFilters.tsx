// src/components/requests/RequestsFilters.tsx
'use client';

import { RequestsFilterControlsBody } from '@/components/requests/RequestsFilterControlsBody';
import { RequestsMobileFilterToolbar } from '@/components/requests/RequestsMobileFilterToolbar';
import { RequestsResultsSummary } from '@/components/requests/RequestsResultsSummary';
import { useRequestsFilterControls } from '@/components/requests/useRequestsFilterControls';
import { WorkspaceMobileFiltersSheet } from '@/features/workspace/requests/WorkspaceMobileFiltersSheet';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { buildRequestsFilterControlsViewModel } from './requestsFilterControls.model';
import type {
  RequestsFilterControlsProps,
  RequestsFiltersProps,
} from './requestsFilters.types';

export type { FilterOption } from './requestsFilters.types';
export { RequestsResultsSummary } from './RequestsResultsSummary';

export function RequestsFilterControls({
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
  page = 1,
  totalPages = 1,
  isCategoriesLoading,
  isServicesLoading,
  isPending = false,
  appliedChips = [],
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onSortChange,
  onReset,
  onPrevPage,
  onNextPage,
  variant = 'panel',
  surface = 'card',
  showMobileToolbar = true,
  mobileMode = 'inline',
}: RequestsFilterControlsProps) {
  const cityQuery = '';
  const {
    isMobileControlsOpen,
    sortControlRef,
    toggleMobileControls,
    openSortControl,
  } = useRequestsFilterControls();
  const {
    filteredCityOptions,
    controlsDisabled,
    hasActiveFilters,
    hasPagination,
    cityLabel,
    mobileSummaryLabel,
  } = buildRequestsFilterControlsViewModel({
    t,
    locale,
    cityOptions,
    categoryOptions,
    serviceOptions,
    cityId,
    categoryKey,
    subcategoryKey,
    cityQuery,
    isPending,
    isCategoriesLoading,
    isServicesLoading,
    appliedChips,
    onPrevPage,
    onNextPage,
  });
  const controlsContentProps = {
    t,
    locale,
    cityId,
    categoryKey,
    subcategoryKey,
    sortBy,
    cityOptions: filteredCityOptions,
    categoryOptions,
    serviceOptions,
    sortOptions,
    controlsDisabled,
    hasActiveFilters,
    variant,
    appliedChips,
    sortControlRef,
    onCityChange,
    onCategoryChange,
    onSubcategoryChange,
    onSortChange,
    onReset,
  };
  const rootClassName =
    `requests-filters requests-filters--sticky requests-filters--${variant} requests-filters--surface-${surface}${isPending ? ' is-pending' : ''}`.trim();
  const desktopControlsClassName =
    `requests-filters__controls requests-filters__controls--${variant} ${isMobileControlsOpen ? 'is-open' : ''}${mobileMode === 'sheet' ? ' requests-filters__controls--desktop-shell' : ''}`.trim();
  const mobileSheetSummary = (
    <>
      <span className="workspace-mobile-filters__summary-chip">{cityLabel}</span>
      <span className="workspace-mobile-filters__summary-chip">{mobileSummaryLabel}</span>
    </>
  );

  return (
    <div
      className={rootClassName}
      role="region"
      aria-label={t(I18N_KEYS.requestsPage.filterRegionLabel)}
      aria-busy={isPending}
    >
      {showMobileToolbar ? (
        <RequestsMobileFilterToolbar
          t={t}
          isOpen={isMobileControlsOpen}
          disabled={controlsDisabled}
          page={page}
          totalPages={totalPages}
          hasPagination={hasPagination}
          onToggleFilters={toggleMobileControls}
          onOpenSort={openSortControl}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
        />
      ) : null}

      {mobileMode === 'sheet' ? (
        <WorkspaceMobileFiltersSheet
          title={t(I18N_KEYS.requestsPage.filterRegionLabel)}
          closeLabel={t(I18N_KEYS.auth.closeDialog)}
          triggerLabel={t(I18N_KEYS.requestsPage.mobileFilterLabel)}
          summary={mobileSheetSummary}
          className="requests-filters__mobile-sheet"
        >
          <div className="requests-filters requests-filters--surface-embedded requests-filters--shell requests-filters--mobile-sheet-body">
            <RequestsFilterControlsBody
              className="requests-filters__controls"
              {...controlsContentProps}
            />
          </div>
        </WorkspaceMobileFiltersSheet>
      ) : null}

      <RequestsFilterControlsBody
        id="requests-filter-controls"
        className={desktopControlsClassName}
        {...controlsContentProps}
      />
      {isCategoriesLoading || isServicesLoading ? (
        <div className="requests-filters__skeleton" aria-hidden="true">
          <div className="skeleton is-wide h-10 w-full rounded-md" />
          <div className="skeleton is-wide h-10 w-full rounded-md" />
          <div className="skeleton is-wide h-10 w-full rounded-md" />
        </div>
      ) : null}
    </div>
  );
}

export function RequestsFilters({
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
  totalResults,
  resultsLabel,
  page = 1,
  totalPages = 1,
  isCategoriesLoading,
  isServicesLoading,
  isPending = false,
  listDensity = 'single',
  appliedChips = [],
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onSortChange,
  onReset,
  onPrevPage,
  onNextPage,
  onListDensityChange,
}: RequestsFiltersProps) {
  return (
    <>
      <RequestsFilterControls
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
        page={page}
        totalPages={totalPages}
        isCategoriesLoading={isCategoriesLoading}
        isServicesLoading={isServicesLoading}
        isPending={isPending}
        appliedChips={appliedChips}
        onCategoryChange={onCategoryChange}
        onSubcategoryChange={onSubcategoryChange}
        onCityChange={onCityChange}
        onSortChange={onSortChange}
        onReset={onReset}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />
      <RequestsResultsSummary
        t={t}
        totalResults={totalResults}
        resultsLabel={resultsLabel}
        page={page}
        totalPages={totalPages}
        isPending={isPending}
        listDensity={listDensity}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onListDensityChange={onListDensityChange}
      />
    </>
  );
}
