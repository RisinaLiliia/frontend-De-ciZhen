// src/hooks/useRequestsFilters.ts
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildPublicRequestsQuery, type PublicRequestsSort } from '@/lib/api/requests';

const ALL_OPTION_KEY = 'all';

type UseRequestsFiltersArgs<TService extends { key: string; categoryKey: string }> = {
  services: TService[];
  defaultSort: PublicRequestsSort;
};

export function useRequestsFilters<TService extends { key: string; categoryKey: string }>({
  services,
  defaultSort,
}: UseRequestsFiltersArgs<TService>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategoryKey = searchParams.get('categoryKey') ?? ALL_OPTION_KEY;
  const initialSubcategoryKey =
    searchParams.get('subcategoryKey') ?? searchParams.get('serviceKey') ?? ALL_OPTION_KEY;
  const initialCityId = searchParams.get('cityId') ?? ALL_OPTION_KEY;
  const initialSortParam = searchParams.get('sort') as PublicRequestsSort | null;
  const initialSort = initialSortParam ?? defaultSort;
  const initialPage = Number(searchParams.get('page') ?? '1');
  const initialLimit = Number(searchParams.get('limit') ?? '20');

  const [categoryKey, setCategoryKey] = React.useState<string>(initialCategoryKey);
  const [subcategoryKey, setSubcategoryKey] = React.useState<string>(initialSubcategoryKey);
  const [cityId, setCityId] = React.useState<string>(initialCityId);
  const [sortBy, setSortBy] = React.useState<PublicRequestsSort>(initialSort);
  const [page, setPage] = React.useState<number>(
    Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1,
  );
  const [limit] = React.useState<number>(
    Number.isFinite(initialLimit) && initialLimit > 0 ? initialLimit : 20,
  );

  const serviceByKey = React.useMemo(
    () => new Map(services.map((service) => [service.key, service])),
    [services],
  );

  const filteredServices = React.useMemo(() => {
    if (categoryKey === ALL_OPTION_KEY) return [];
    return services.filter((service) => service.categoryKey === categoryKey);
  }, [categoryKey, services]);

  React.useEffect(() => {
    if (categoryKey !== ALL_OPTION_KEY || subcategoryKey === ALL_OPTION_KEY) return;
    const service = serviceByKey.get(subcategoryKey);
    if (service) setCategoryKey(service.categoryKey);
  }, [categoryKey, subcategoryKey, serviceByKey]);

  React.useEffect(() => {
    if (subcategoryKey === ALL_OPTION_KEY) return;
    const exists = filteredServices.some((service) => service.key === subcategoryKey);
    if (!exists) setSubcategoryKey(ALL_OPTION_KEY);
  }, [filteredServices, subcategoryKey]);

  const filter = React.useMemo(
    () => ({
      cityId: cityId === ALL_OPTION_KEY ? undefined : cityId,
      categoryKey: categoryKey === ALL_OPTION_KEY ? undefined : categoryKey,
      subcategoryKey: subcategoryKey === ALL_OPTION_KEY ? undefined : subcategoryKey,
      sort: sortBy,
      page,
      limit,
    }),
    [categoryKey, cityId, limit, page, sortBy, subcategoryKey],
  );

  React.useEffect(() => {
    const next = buildPublicRequestsQuery(filter);
    if (next !== searchParams.toString()) {
      router.replace(`/requests?${next}`);
    }
  }, [filter, router, searchParams]);

  const onCategoryChange = React.useCallback((value: string) => {
    setCategoryKey(value);
    setSubcategoryKey(ALL_OPTION_KEY);
    setPage(1);
  }, []);

  const onSubcategoryChange = React.useCallback((value: string) => {
    setSubcategoryKey(value);
    setPage(1);
  }, []);

  const onCityChange = React.useCallback((value: string) => {
    setCityId(value);
    setPage(1);
  }, []);

  const onSortChange = React.useCallback((value: string) => {
    setSortBy(value as PublicRequestsSort);
    setPage(1);
  }, []);

  const onReset = React.useCallback(() => {
    setCategoryKey(ALL_OPTION_KEY);
    setSubcategoryKey(ALL_OPTION_KEY);
    setCityId(ALL_OPTION_KEY);
    setSortBy(defaultSort);
    setPage(1);
  }, [defaultSort]);

  return {
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
  };
}
