'use client';

import { RequestsFilterControlsBody } from '@/components/requests/RequestsFilterControlsBody';
import { RequestsMobileFilterToolbar } from '@/components/requests/RequestsMobileFilterToolbar';
import { useRequestsFilterControls } from '@/components/requests/useRequestsFilterControls';
import { buildRequestsFilterControlsViewModel } from '@/components/requests/requestsFilterControls.model';
import { WorkspaceContextMobileSheet } from '@/features/workspace/context/contextMobileSheet';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { WorkspaceResultsSummary } from './WorkspaceResultsSummary';
import type {
  WorkspaceFilterControlsProps,
  WorkspaceFiltersProps,
} from './workspaceListPrimitives.types';

export function WorkspaceFilterControls({
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
  classNamespace = 'workspace',
}: WorkspaceFilterControlsProps) {
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
    classNamespace,
  };
  const rootBaseClassName = classNamespace === 'workspace' ? 'workspace-filters' : 'requests-filters';
  const controlsBaseClassName = classNamespace === 'workspace' ? 'workspace-filters__controls' : 'requests-filters__controls';
  const rootClassName =
    `${rootBaseClassName} ${rootBaseClassName}--sticky ${rootBaseClassName}--${variant} ${rootBaseClassName}--surface-${surface}${isPending ? ' is-pending' : ''}`.trim();
  const desktopControlsClassName =
    `${controlsBaseClassName} ${controlsBaseClassName}--${variant} ${isMobileControlsOpen ? 'is-open' : ''}${mobileMode === 'sheet' ? ` ${controlsBaseClassName}--desktop-shell` : ''}`.trim();
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
          classNamespace={classNamespace}
        />
      ) : null}

      {mobileMode === 'sheet' ? (
        <WorkspaceContextMobileSheet
          title={t(I18N_KEYS.requestsPage.filterRegionLabel)}
          triggerLabel={t(I18N_KEYS.requestsPage.mobileFilterLabel)}
          summary={mobileSheetSummary}
          className={classNamespace === 'workspace' ? 'workspace-filters__mobile-sheet' : 'requests-filters__mobile-sheet'}
        >
          <div className={rootClassName.replace(`${rootBaseClassName}--sticky`, '').trim() + ` ${rootBaseClassName}--mobile-sheet-body`}>
            <RequestsFilterControlsBody
              className={controlsBaseClassName}
              {...controlsContentProps}
            />
          </div>
        </WorkspaceContextMobileSheet>
      ) : null}

      <RequestsFilterControlsBody
        id="requests-filter-controls"
        className={desktopControlsClassName}
        {...controlsContentProps}
      />
      {isCategoriesLoading || isServicesLoading ? (
        <div className={classNamespace === 'workspace' ? 'workspace-filters__skeleton' : 'requests-filters__skeleton'} aria-hidden="true">
          <div className="skeleton is-wide h-10 w-full rounded-md" />
          <div className="skeleton is-wide h-10 w-full rounded-md" />
          <div className="skeleton is-wide h-10 w-full rounded-md" />
        </div>
      ) : null}
    </div>
  );
}

export function WorkspaceFilters({
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
  classNamespace = 'workspace',
}: WorkspaceFiltersProps) {
  return (
    <>
      <WorkspaceFilterControls
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
        classNamespace={classNamespace}
      />
      <WorkspaceResultsSummary
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
        classNamespace={classNamespace}
      />
    </>
  );
}
