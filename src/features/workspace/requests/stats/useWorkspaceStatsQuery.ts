'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

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

export function useWorkspaceStatsQuery(): UseWorkspaceStatsQueryResult {
  const [range, setRange] = React.useState<WorkspaceStatisticsRange>('30d');

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
