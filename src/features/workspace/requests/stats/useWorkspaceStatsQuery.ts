'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import {
  getWorkspacePublicOverview,
  getWorkspaceStatistics,
} from '@/lib/api/workspace';
import { hasAnyStatus, withStatusFallback } from '@/lib/api/withStatusFallback';
import { ensureStatisticsOpportunityContract } from './statisticsOpportunityContract.utils';
import { mergeFullCityRanking } from './statisticsInsights.utils';
import { getWorkspaceStatisticsFallback } from './statisticsModel.fallbackApi';
import { normalizeLegacyRange } from './statisticsModel.mappers';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';

const WORKSPACE_STATS_BFF_FLAG = process.env.NEXT_PUBLIC_WORKSPACE_STATS_BFF;
const FORCE_DISABLE_STATISTICS_BFF = WORKSPACE_STATS_BFF_FLAG === 'false';
const FORCE_ENABLE_STATISTICS_BFF = WORKSPACE_STATS_BFF_FLAG === 'true';

export type UseWorkspaceStatsQueryResult = {
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  data: WorkspaceStatisticsOverviewSourceDto | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function useWorkspaceStatsQuery(): UseWorkspaceStatsQueryResult {
  const [range, setRange] = React.useState<WorkspaceStatisticsRange>('30d');
  const bffAvailabilityRef = React.useRef<boolean | null>(FORCE_DISABLE_STATISTICS_BFF ? false : null);

  const query = useQuery<WorkspaceStatisticsOverviewSourceDto>({
    queryKey: ['workspace-statistics-overview', range],
    queryFn: async () => {
      if (bffAvailabilityRef.current === false) {
        const fallback = await getWorkspaceStatisticsFallback(range);
        return ensureStatisticsOpportunityContract(fallback);
      }

      try {
        const legacyRange = normalizeLegacyRange(range);
        const [payload, fullPublicOverview] = await Promise.all([
          getWorkspaceStatistics(range),
          withStatusFallback(
            () =>
              getWorkspacePublicOverview({
                sort: 'date_desc',
                page: 1,
                limit: 1,
                activityRange: legacyRange,
                cityActivityLimit: 5000,
              }),
            null,
            [400, 404],
          ),
        ]);

        const mergedCities = mergeFullCityRanking({
          statsCities: payload.demand.cities,
          publicCities: fullPublicOverview?.cityActivity.items ?? [],
        });

        bffAvailabilityRef.current = true;
        return ensureStatisticsOpportunityContract({
          ...payload,
          summary: {
            ...payload.summary,
            totalActiveCities: Math.max(
              payload.summary.totalActiveCities,
              fullPublicOverview?.cityActivity.totalActiveCities ?? 0,
            ),
          },
          demand: {
            ...payload.demand,
            cities: mergedCities,
          },
          __source: 'bff',
        });
      } catch (error) {
        if (hasAnyStatus(error, [404, 405, 501])) {
          if (!FORCE_ENABLE_STATISTICS_BFF) {
            bffAvailabilityRef.current = false;
          }
          const fallback = await getWorkspaceStatisticsFallback(range);
          return ensureStatisticsOpportunityContract(fallback);
        }
        if (hasAnyStatus(error, [400, 401, 403])) {
          const fallback = await getWorkspaceStatisticsFallback(range);
          return ensureStatisticsOpportunityContract(fallback);
        }
        if (FORCE_DISABLE_STATISTICS_BFF) {
          const fallback = await getWorkspaceStatisticsFallback(range);
          return ensureStatisticsOpportunityContract(fallback);
        }
        if (!hasAnyStatus(error, [400, 401, 403, 404, 405, 501])) {
          throw error;
        }
        const fallback = await getWorkspaceStatisticsFallback(range);
        return ensureStatisticsOpportunityContract(fallback);
      }
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
