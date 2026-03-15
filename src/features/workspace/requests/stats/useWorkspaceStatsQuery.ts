'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { getWorkspaceStatistics } from '@/lib/api/workspace';
import {
  normalizeWorkspaceDecisionDashboardResponse,
  type WorkspaceStatisticsDecisionDashboardDto,
} from './statisticsDecisionDashboard.contract';
import { workspaceStatisticsDecisionDashboardSchema } from './workspaceStatisticsDecisionDashboard.schema';
import type { WorkspaceStatisticsFilters } from './workspaceStatistics.model';

export type UseWorkspaceStatsQueryResult = {
  filters: WorkspaceStatisticsFilters;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  setCityId: (next: string | null) => void;
  setCategoryKey: (next: string | null) => void;
  resetFilters: () => void;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  isLoading: boolean;
  isError: boolean;
  hasBackgroundError: boolean;
  isFetching: boolean;
  isPendingFilters: boolean;
};

export function useWorkspaceStatsQuery(): UseWorkspaceStatsQueryResult {
  const [filters, setFilters] = React.useState<WorkspaceStatisticsFilters>({
    period: '30d',
    cityId: null,
    regionId: null,
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
        regionId: null,
        categoryKey: null,
      }));
    });
  }, []);

  const [lastSuccessfulData, setLastSuccessfulData] = React.useState<WorkspaceStatisticsDecisionDashboardDto | undefined>(undefined);

  const query = useQuery<WorkspaceStatisticsDecisionDashboardDto>({
    queryKey: ['workspace-statistics-overview', filters.period, filters.regionId, filters.cityId, filters.categoryKey],
    queryFn: async (): Promise<WorkspaceStatisticsDecisionDashboardDto> => {
      const payload = await getWorkspaceStatistics({
        range: filters.period,
        cityId: filters.cityId,
        regionId: filters.regionId,
        categoryKey: filters.categoryKey,
      });
      const normalized = normalizeWorkspaceDecisionDashboardResponse({
        ...payload,
        __source: 'bff',
      }, filters);
      workspaceStatisticsDecisionDashboardSchema.parse(normalized);
      return normalized;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (query.data) {
      setLastSuccessfulData(query.data);
    }
  }, [query.data]);

  const resolvedData = query.data ?? lastSuccessfulData;
  const hasBackgroundError = query.isError && Boolean(resolvedData);

  return {
    filters,
    range: filters.period,
    setRange,
    setCityId,
    setCategoryKey,
    resetFilters,
    data: resolvedData,
    isLoading: query.isLoading,
    isError: query.isError,
    hasBackgroundError,
    isFetching: query.isFetching,
    isPendingFilters,
  };
}
