'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type {
  WorkspacePrivateOverviewDto,
  WorkspaceStatisticsRange,
  WorkspaceStatisticsViewerMode,
} from '@/lib/api/dto/workspace';
import { getWorkspaceStatistics } from '@/lib/api/workspace';
import {
  normalizeWorkspaceDecisionDashboardResponse,
  type WorkspaceStatisticsDecisionDashboardDto,
} from './statisticsDecisionDashboard.contract';
import { hydrateAuthenticatedStatisticsPayload } from './statisticsAuthenticatedPayload.utils';
import { workspaceStatisticsDecisionDashboardSchema } from './workspaceStatisticsDecisionDashboard.schema';
import type { WorkspaceStatisticsFilters } from './workspaceStatistics.model';

export type UseWorkspaceStatsQueryResult = {
  filters: WorkspaceStatisticsFilters;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  setCityId: (next: string | null) => void;
  setCategoryKey: (next: string | null) => void;
  setViewerMode: (next: WorkspaceStatisticsViewerMode) => void;
  resetFilters: () => void;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  isLoading: boolean;
  isError: boolean;
  hasBackgroundError: boolean;
  isFetching: boolean;
  isPendingFilters: boolean;
};

function resolveRange(value: string | null): WorkspaceStatisticsRange {
  if (value === '24h' || value === '7d' || value === '30d' || value === '90d') return value;
  return '30d';
}

function resolveNullableFilter(value: string | null) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function useWorkspaceStatsQuery({
  privateOverview = null,
}: {
  privateOverview?: WorkspacePrivateOverviewDto | null;
} = {}): UseWorkspaceStatsQueryResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPendingFilters, startTransition] = React.useTransition();

  const filters = React.useMemo<WorkspaceStatisticsFilters>(
    () => ({
      period: resolveRange(searchParams.get('range')),
      cityId: resolveNullableFilter(searchParams.get('cityId')),
      regionId: null,
      categoryKey: resolveNullableFilter(searchParams.get('categoryKey')),
      viewerMode: searchParams.get('viewerMode') === 'customer'
        ? 'customer'
        : searchParams.get('viewerMode') === 'provider'
          ? 'provider'
          : null,
    }),
    [searchParams],
  );

  const replaceSearchParams = React.useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const current = searchParams.toString();
      const next = new URLSearchParams(current);
      mutate(next);
      const nextQuery = next.toString();
      if (nextQuery === current) return;

      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const setRange = React.useCallback((next: WorkspaceStatisticsRange) => {
    replaceSearchParams((params) => {
      params.set('range', next);
      params.delete('statsCityPage');
    });
  }, [replaceSearchParams]);

  const setCityId = React.useCallback((next: string | null) => {
    replaceSearchParams((params) => {
      if (next) {
        params.set('cityId', next);
      } else {
        params.delete('cityId');
      }
      params.delete('statsCityPage');
    });
  }, [replaceSearchParams]);

  const setCategoryKey = React.useCallback((next: string | null) => {
    replaceSearchParams((params) => {
      if (next) {
        params.set('categoryKey', next);
      } else {
        params.delete('categoryKey');
      }
      params.delete('subcategoryKey');
      params.delete('statsCityPage');
    });
  }, [replaceSearchParams]);

  const setViewerMode = React.useCallback((next: WorkspaceStatisticsViewerMode) => {
    replaceSearchParams((params) => {
      params.set('viewerMode', next);
    });
  }, [replaceSearchParams]);

  const resetFilters = React.useCallback(() => {
    replaceSearchParams((params) => {
      params.delete('cityId');
      params.delete('categoryKey');
      params.delete('subcategoryKey');
      params.delete('statsCityPage');
    });
  }, [replaceSearchParams]);

  const [lastSuccessfulData, setLastSuccessfulData] = React.useState<WorkspaceStatisticsDecisionDashboardDto | undefined>(undefined);

  const query = useQuery<WorkspaceStatisticsDecisionDashboardDto>({
    queryKey: [
      'workspace-statistics-overview',
      filters.period,
      filters.regionId,
      filters.cityId,
      filters.categoryKey,
      filters.viewerMode ?? 'auto',
      privateOverview?.updatedAt ?? 'no-private-overview',
    ],
    queryFn: async (): Promise<WorkspaceStatisticsDecisionDashboardDto> => {
      const payload = await getWorkspaceStatistics({
        range: filters.period,
        cityId: filters.cityId,
        regionId: filters.regionId,
        categoryKey: filters.categoryKey,
        viewerMode: filters.viewerMode,
      });
      const hydratedPayload = hydrateAuthenticatedStatisticsPayload({
        payload,
        privateOverview,
      });
      const normalized = normalizeWorkspaceDecisionDashboardResponse({
        ...hydratedPayload,
        __source: 'bff',
      }, filters);
      const parsed = workspaceStatisticsDecisionDashboardSchema.safeParse(normalized);
      if (!parsed.success) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Workspace statistics schema mismatch', parsed.error.flatten());
        }
        return normalized as WorkspaceStatisticsDecisionDashboardDto;
      }
      return parsed.data as WorkspaceStatisticsDecisionDashboardDto;
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
    setViewerMode,
    resetFilters,
    data: resolvedData,
    isLoading: query.isLoading,
    isError: query.isError,
    hasBackgroundError,
    isFetching: query.isFetching,
    isPendingFilters,
  };
}
