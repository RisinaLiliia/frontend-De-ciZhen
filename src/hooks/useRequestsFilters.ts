// src/hooks/useRequestsFilters.ts
'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PublicRequestsSort } from '@/lib/api/requests';

const ALL_OPTION_KEY = 'all';
const FILTER_QUERY_KEYS = new Set(['cityId', 'categoryKey', 'subcategoryKey', 'serviceKey', 'sort', 'page', 'limit']);
const DEFAULT_LIMIT = 10;

type UseRequestsFiltersArgs<TService extends { key: string; categoryKey: string }> = {
  services: TService[];
  defaultSort: PublicRequestsSort;
};

export function useRequestsFilters<TService extends { key: string; categoryKey: string }>({
  services,
  defaultSort,
}: UseRequestsFiltersArgs<TService>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const categoryParam = searchParams.get('categoryKey') ?? ALL_OPTION_KEY;
  const subcategoryParam = searchParams.get('subcategoryKey') ?? searchParams.get('serviceKey') ?? ALL_OPTION_KEY;
  const cityId = searchParams.get('cityId') ?? ALL_OPTION_KEY;
  const sortBy = (searchParams.get('sort') as PublicRequestsSort | null) ?? defaultSort;
  const page = readPositiveInt(searchParams.get('page'), 1);
  const limit = readPositiveInt(searchParams.get('limit'), DEFAULT_LIMIT);

  const serviceByKey = React.useMemo(
    () => new Map(services.map((service) => [service.key, service])),
    [services],
  );

  const categoryKey = React.useMemo(() => {
    if (categoryParam !== ALL_OPTION_KEY) return categoryParam;
    if (subcategoryParam === ALL_OPTION_KEY) return ALL_OPTION_KEY;
    return serviceByKey.get(subcategoryParam)?.categoryKey ?? ALL_OPTION_KEY;
  }, [categoryParam, serviceByKey, subcategoryParam]);

  const subcategoryKey = React.useMemo(() => {
    if (subcategoryParam === ALL_OPTION_KEY) return ALL_OPTION_KEY;
    if (categoryKey === ALL_OPTION_KEY) return subcategoryParam;
    const service = serviceByKey.get(subcategoryParam);
    if (!service || service.categoryKey !== categoryKey) return ALL_OPTION_KEY;
    return subcategoryParam;
  }, [categoryKey, serviceByKey, subcategoryParam]);

  const filteredServices = React.useMemo(() => {
    if (categoryKey === ALL_OPTION_KEY) return [];
    return services.filter((service) => service.categoryKey === categoryKey);
  }, [categoryKey, services]);

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

  const updateQuery = React.useCallback(
    (next: {
      cityId?: string;
      categoryKey?: string;
      subcategoryKey?: string;
      sortBy?: PublicRequestsSort;
      page?: number;
    }) => {
      const current = new URLSearchParams(searchParams.toString());
      const merged = new URLSearchParams();

      current.forEach((value, key) => {
        if (!FILTER_QUERY_KEYS.has(key)) {
          merged.append(key, value);
        }
      });

      const nextCity = next.cityId ?? cityId;
      const nextCategory = next.categoryKey ?? categoryKey;
      const nextSubcategory = next.subcategoryKey ?? subcategoryKey;
      const nextSort = next.sortBy ?? sortBy;
      const nextPage = next.page ?? page;

      if (nextCity !== ALL_OPTION_KEY) merged.set('cityId', nextCity);
      if (nextCategory !== ALL_OPTION_KEY) merged.set('categoryKey', nextCategory);
      if (nextSubcategory !== ALL_OPTION_KEY) merged.set('subcategoryKey', nextSubcategory);
      if (nextSort !== defaultSort) merged.set('sort', nextSort);
      if (nextPage > 1) merged.set('page', String(nextPage));
      if (limit !== DEFAULT_LIMIT) merged.set('limit', String(limit));

      const nextQuery = merged.toString();
      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
      });
    },
    [categoryKey, cityId, defaultSort, limit, page, pathname, router, searchParams, sortBy, subcategoryKey],
  );

  const onCategoryChange = React.useCallback(
    (value: string) => {
      updateQuery({
        categoryKey: value,
        subcategoryKey: ALL_OPTION_KEY,
        page: 1,
      });
    },
    [updateQuery],
  );

  const onSubcategoryChange = React.useCallback(
    (value: string) => {
      updateQuery({
        subcategoryKey: value,
        page: 1,
      });
    },
    [updateQuery],
  );

  const onCityChange = React.useCallback(
    (value: string) => {
      updateQuery({
        cityId: value,
        page: 1,
      });
    },
    [updateQuery],
  );

  const onSortChange = React.useCallback(
    (value: string) => {
      updateQuery({
        sortBy: value as PublicRequestsSort,
        page: 1,
      });
    },
    [updateQuery],
  );

  const onReset = React.useCallback(() => {
    updateQuery({
      categoryKey: ALL_OPTION_KEY,
      subcategoryKey: ALL_OPTION_KEY,
      cityId: ALL_OPTION_KEY,
      sortBy: defaultSort,
      page: 1,
    });
  }, [defaultSort, updateQuery]);

  const setPage = React.useCallback(
    (nextPage: number) => {
      updateQuery({
        page: Math.max(1, nextPage),
      });
    },
    [updateQuery],
  );

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
    isPending,
  };
}

function readPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
