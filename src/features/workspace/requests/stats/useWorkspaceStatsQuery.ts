'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { getWorkspaceStatistics } from '@/lib/api/workspace';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import type { WorkspaceStatisticsFilters } from './workspaceStatistics.model';

export type UseWorkspaceStatsQueryResult = {
  filters: WorkspaceStatisticsFilters;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  setCityId: (next: string | null) => void;
  setCategoryKey: (next: string | null) => void;
  resetFilters: () => void;
  data: WorkspaceStatisticsOverviewSourceDto | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  isPendingFilters: boolean;
};

export function useWorkspaceStatsQuery(): UseWorkspaceStatsQueryResult {
  const [filters, setFilters] = React.useState<WorkspaceStatisticsFilters>({
    period: '30d',
    cityId: null,
    categoryKey: null,
  });
  const [isPendingFilters, startTransition] = React.useTransition();

  const setRange = React.useCallback((next: WorkspaceStatisticsRange) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, period: next }));
    });
  }, []);

  const setCityId = React.useCallback((next: string | null) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, cityId: next }));
    });
  }, []);

  const setCategoryKey = React.useCallback((next: string | null) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, categoryKey: next }));
    });
  }, []);

  const resetFilters = React.useCallback(() => {
    startTransition(() => {
      setFilters((current) => ({
        period: current.period,
        cityId: null,
        categoryKey: null,
      }));
    });
  }, []);

  const query = useQuery<WorkspaceStatisticsOverviewSourceDto>({
    queryKey: ['workspace-statistics-overview', filters.period, filters.cityId, filters.categoryKey],
    queryFn: async () => {
      const payload = await getWorkspaceStatistics({
        range: filters.period,
        cityId: filters.cityId,
        categoryKey: filters.categoryKey,
      });
      return {
        ...payload,
        __source: 'bff',
      };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  return {
    filters,
    range: filters.period,
    setRange,
    setCityId,
    setCategoryKey,
    resetFilters,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    isPendingFilters,
  };
}
