// src/hooks/useRequestsFilters.ts
'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { PublicRequestsSort } from '@/lib/api/requests';
import {
  buildPublicRequestsFilterPayload,
  buildRequestsFiltersHref,
  resolveRequestsFilterQueryParams,
  resolveRequestsFilterSelection,
} from '@/hooks/requestsFilters.model';

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

  const {
    categoryParam,
    subcategoryParam,
    cityId,
    sortBy,
    page,
    limit,
  } = React.useMemo(
    () => resolveRequestsFilterQueryParams(searchParams, defaultSort),
    [defaultSort, searchParams],
  );

  const { categoryKey, subcategoryKey, filteredServices } = React.useMemo(
    () =>
      resolveRequestsFilterSelection({
        services,
        categoryParam,
        subcategoryParam,
      }),
    [categoryParam, services, subcategoryParam],
  );

  const filter = React.useMemo(
    () => buildPublicRequestsFilterPayload({ cityId, categoryKey, subcategoryKey, sortBy, page, limit }),
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
      const nextHref = buildRequestsFiltersHref({
        pathname,
        searchParams,
        current: {
          cityId,
          categoryKey,
          subcategoryKey,
          sortBy,
          page,
          limit,
        },
        next,
        defaultSort,
      });
      startTransition(() => {
        router.replace(nextHref, { scroll: false });
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
