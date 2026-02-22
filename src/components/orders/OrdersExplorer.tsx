'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PublicContent } from '@/features/requests/page/PublicContent';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { listPublicRequests } from '@/lib/api/requests';
import { pickI18n } from '@/lib/i18n/helpers';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { ALL_OPTION_KEY, SORT_OPTIONS } from '@/features/requests/page/public';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type OrdersExplorerProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  backHref?: string;
  emptyCtaHref?: string;
  showBack?: boolean;
  onListDensityChange?: (value: 'single' | 'double') => void;
};

export function OrdersExplorer({
  t,
  locale,
  backHref = '/',
  emptyCtaHref = '/?view=orders',
  showBack = false,
  onListDensityChange,
}: OrdersExplorerProps) {
  const { data: cities = [] } = useCities('DE');
  const { data: categories = [], isLoading: isCategoriesLoading } = useServiceCategories();
  const { data: services = [], isLoading: isServicesLoading } = useServices();

  const sortOptions = React.useMemo(
    () =>
      SORT_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t],
  );

  const {
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    filteredServices,
    onCategoryChange,
    onSubcategoryChange,
    onCityChange,
    onSortChange,
    onReset,
    setPage,
    isPending,
  } = useRequestsFilters({
    services,
    defaultSort: 'date_desc',
  });

  const categoryOptions = React.useMemo(
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.categoryAll) },
      ...categories
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          value: category.key,
          label: pickI18n(category.i18n, locale),
        })),
    ],
    [categories, locale, t],
  );

  const serviceOptions = React.useMemo(
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.serviceAll) },
      ...filteredServices
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((service) => ({
          value: service.key,
          label: pickI18n(service.i18n, locale),
        })),
    ],
    [filteredServices, locale, t],
  );

  const cityOptions = React.useMemo(
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.cityAll) },
      ...cities
        .slice()
        .sort((a, b) => pickI18n(a.i18n, locale).localeCompare(pickI18n(b.i18n, locale), locale))
        .map((city) => ({
          value: city.id,
          label: pickI18n(city.i18n, locale),
        })),
    ],
    [cities, locale, t],
  );

  const appliedFilterChips = React.useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (cityId !== ALL_OPTION_KEY) {
      const cityLabel = cityOptions.find((option) => option.value === cityId)?.label ?? cityId;
      chips.push({
        key: 'city',
        label: cityLabel,
        onRemove: () => onCityChange(ALL_OPTION_KEY),
      });
    }
    if (categoryKey !== ALL_OPTION_KEY) {
      const categoryLabel = categoryOptions.find((option) => option.value === categoryKey)?.label ?? categoryKey;
      chips.push({
        key: 'category',
        label: categoryLabel,
        onRemove: () => onCategoryChange(ALL_OPTION_KEY),
      });
    }
    if (subcategoryKey !== ALL_OPTION_KEY) {
      const serviceLabel = serviceOptions.find((option) => option.value === subcategoryKey)?.label ?? subcategoryKey;
      chips.push({
        key: 'service',
        label: serviceLabel,
        onRemove: () => onSubcategoryChange(ALL_OPTION_KEY),
      });
    }
    if (sortBy !== 'date_desc') {
      const sortLabel = sortOptions.find((option) => option.value === sortBy)?.label ?? sortBy;
      chips.push({
        key: 'sort',
        label: sortLabel,
        onRemove: () => onSortChange('date_desc'),
      });
    }
    return chips;
  }, [
    categoryKey,
    categoryOptions,
    cityId,
    cityOptions,
    onCategoryChange,
    onCityChange,
    onSortChange,
    onSubcategoryChange,
    serviceOptions,
    sortBy,
    sortOptions,
    subcategoryKey,
  ]);

  const { data: publicRequests, isLoading, isError } = useQuery({
    queryKey: [
      'orders-explorer-public',
      filter.cityId,
      filter.categoryKey,
      filter.subcategoryKey,
      filter.sort,
      filter.page,
      filter.limit,
    ],
    queryFn: () => listPublicRequests(filter),
  });

  const requests = publicRequests?.items ?? [];
  const totalResults = publicRequests?.total ?? requests.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));
  const totalResultsLabel = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(totalResults),
    [locale, totalResults],
  );
  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        day: '2-digit',
        month: 'short',
      }),
    [locale],
  );
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });

  React.useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, setPage, totalPages]);

  return (
    <section className="stack-sm">
      {showBack ? (
        <Link href={backHref} className="back-button w-fit" prefetch={false}>
          <span aria-hidden="true">←</span>
          <span className="back-button__label">{t(I18N_KEYS.common.back)}</span>
        </Link>
      ) : null}
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
        requestsListProps={{
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
          showStaticFavoriteIcon: true,
        }}
        page={page}
        totalPages={totalPages}
        resultsLabel={t(I18N_KEYS.requestsPage.countLabel)}
        onPrevPage={() => setPage(Math.max(1, page - 1))}
        onNextPage={() => setPage(Math.min(totalPages, page + 1))}
        onListDensityChange={onListDensityChange}
      />
    </section>
  );
}
