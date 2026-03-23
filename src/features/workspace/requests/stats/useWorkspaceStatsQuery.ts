'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { getWorkspaceStatistics } from '@/lib/api/workspace';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';

export type UseWorkspaceStatsQueryResult = {
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  data: WorkspaceStatisticsOverviewSourceDto | undefined;
  isLoading: boolean;
  isError: boolean;
};

function resolveRange(value: string | null): WorkspaceStatisticsRange {
  if (value === '24h' || value === '7d' || value === '30d' || value === '90d') return value;
  return '30d';
}

export function useWorkspaceStatsQuery(): UseWorkspaceStatsQueryResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const range = React.useMemo(
    () => resolveRange(searchParams.get('range')),
    [searchParams],
  );

  const setRange = React.useCallback((next: WorkspaceStatisticsRange) => {
    const current = searchParams.toString();
    const params = new URLSearchParams(current);
    if (next === '30d') {
      params.delete('range');
    } else {
      params.set('range', next);
    }
    params.delete('statsCityPage');
    const nextQuery = params.toString();
    if (nextQuery === current) return;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const query = useQuery<WorkspaceStatisticsOverviewSourceDto>({
    queryKey: ['workspace-statistics-overview', range],
    queryFn: async () => {
      const payload = await getWorkspaceStatistics(range);
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
    range,
    setRange,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
