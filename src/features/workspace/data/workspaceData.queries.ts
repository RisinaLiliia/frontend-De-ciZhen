'use client';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import {
  getWorkspacePrivateOverview,
  getWorkspacePublicOverview,
  getWorkspacePublicRequestsBatch,
  getWorkspaceRequests,
} from '@/lib/api/workspace';
import type { WorkspacePublicOverviewQuery } from '@/lib/api/workspace';
import type {
  WorkspaceRequestsPeriodDto,
  WorkspaceRequestsRoleDto,
  WorkspaceRequestsScopeDto,
  WorkspaceRequestsStateDto,
} from '@/lib/api/dto/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { workspaceQK, WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/data';
import type { WorkspaceDataLoadPlan } from '@/features/workspace/data/workspaceData.model';

const DEFAULT_STALE_TIME_MS = 60_000;

function buildStableWorkspaceQuery<TQueryKey extends readonly unknown[], TQueryFnData>(params: {
  queryKey: TQueryKey;
  enabled: boolean;
  queryFn: () => Promise<TQueryFnData>;
}) {
  return {
    ...params,
    staleTime: DEFAULT_STALE_TIME_MS,
    refetchOnWindowFocus: false as const,
  };
}

type WorkspaceDataQueriesArgs = {
  enabled?: boolean;
  includePrivateOverview?: boolean;
  includePublicSummary?: boolean;
  filter: WorkspacePublicOverviewQuery;
  loadPlan: WorkspaceDataLoadPlan;
  hasAccessToken: boolean;
  publicSummaryCityActivityLimit?: number;
  requestsScope: WorkspaceRequestsScopeDto;
  activeRequestsRole: WorkspaceRequestsRoleDto;
  activeRequestsState: WorkspaceRequestsStateDto;
  activeRequestsPeriod: WorkspaceRequestsPeriodDto;
  activeRequestsSort: string | null;
};

type BuildWorkspaceContractQueriesArgs = Pick<
  WorkspaceDataQueriesArgs,
  | 'enabled'
  | 'includePrivateOverview'
  | 'includePublicSummary'
  | 'filter'
  | 'loadPlan'
  | 'hasAccessToken'
  | 'publicSummaryCityActivityLimit'
  | 'requestsScope'
  | 'activeRequestsRole'
  | 'activeRequestsState'
  | 'activeRequestsPeriod'
  | 'activeRequestsSort'
>;

function buildWorkspaceContractQueries({
  enabled = true,
  includePrivateOverview = true,
  includePublicSummary = true,
  filter,
  loadPlan,
  hasAccessToken,
  publicSummaryCityActivityLimit = WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
  requestsScope,
  activeRequestsRole,
  activeRequestsState,
  activeRequestsPeriod,
  activeRequestsSort,
}: BuildWorkspaceContractQueriesArgs) {
  return {
    publicOverview: buildStableWorkspaceQuery({
      queryKey: workspaceQK.workspacePublicOverview({
        cityId: filter.cityId,
        categoryKey: filter.categoryKey,
        subcategoryKey: filter.subcategoryKey,
        sort: filter.sort,
        state: filter.state,
        period: filter.period,
        page: filter.page,
        limit: filter.limit,
        activityRange: undefined,
        cityActivityLimit: undefined,
      }),
      enabled: loadPlan.shouldLoadLegacyPublicOverview,
      queryFn: () =>
        getWorkspacePublicOverview({
          cityId: filter.cityId,
          categoryKey: filter.categoryKey,
          subcategoryKey: filter.subcategoryKey,
          sort: filter.sort,
          state: filter.state,
          period: filter.period,
          page: filter.page,
          limit: filter.limit,
        }),
    }),
    publicSummary: buildStableWorkspaceQuery({
      queryKey: workspaceQK.workspacePublicSummary(publicSummaryCityActivityLimit),
      enabled: enabled && includePublicSummary,
      queryFn: () =>
        getWorkspacePublicOverview({
          page: 1,
          limit: 1,
          cityActivityLimit: publicSummaryCityActivityLimit,
        }),
    }),
    privateOverview: buildStableWorkspaceQuery({
      queryKey: workspaceQK.workspacePrivateOverview(activeRequestsPeriod),
      enabled: loadPlan.shouldLoadPrivateOverview && includePrivateOverview,
      queryFn: () =>
        hasAccessToken
          ? withStatusFallback(
              () => getWorkspacePrivateOverview({ period: activeRequestsPeriod }),
              null,
              [401, 403],
            )
          : Promise.resolve(null),
    }),
    workspaceRequests: buildStableWorkspaceQuery({
      queryKey: workspaceQK.workspaceRequests({
        scope: requestsScope,
        role: activeRequestsRole,
        state: activeRequestsState,
        city: requestsScope === 'market' ? (filter.cityId ?? null) : null,
        category: requestsScope === 'market' ? (filter.categoryKey ?? null) : null,
        service: requestsScope === 'market' ? (filter.subcategoryKey ?? null) : null,
        period: activeRequestsPeriod,
        sort: activeRequestsSort,
        page: filter.page,
        limit: filter.limit,
      }),
      enabled: loadPlan.shouldLoadWorkspaceRequests,
      queryFn: () => {
        if (!loadPlan.shouldLoadWorkspaceRequests) {
          return Promise.resolve(null);
        }

        const query =
          requestsScope === 'market'
            ? {
                scope: requestsScope,
                state: activeRequestsState,
                period: activeRequestsPeriod,
                city: filter.cityId ?? null,
                category: filter.categoryKey ?? null,
                service: filter.subcategoryKey ?? null,
                sort: activeRequestsSort,
                page: filter.page,
                limit: filter.limit,
              }
            : {
                scope: requestsScope,
                role: activeRequestsRole,
                state: activeRequestsState,
                period: activeRequestsPeriod,
                sort: activeRequestsSort,
                page: filter.page,
                limit: filter.limit,
              };
        return requestsScope === 'market'
          ? getWorkspaceRequests(query)
          : hasAccessToken
            ? withStatusFallback(() => getWorkspaceRequests(query), null, [401, 403])
            : Promise.resolve(null);
      },
    }),
  };
}

export function buildWorkspaceDataQueries(args: WorkspaceDataQueriesArgs) {
  return buildWorkspaceContractQueries(args);
}

type WorkspaceOfferRequestsQueryArgs = {
  locale: string;
  requestIds: string[];
  enabled: boolean;
};

export function buildWorkspaceOfferRequestsQuery({
  locale,
  requestIds,
  enabled,
}: WorkspaceOfferRequestsQueryArgs) {
  return {
    queryKey: workspaceQK.requestsByMyOfferIds(locale, requestIds),
    enabled: enabled && requestIds.length > 0,
    queryFn: async () => {
      const batch = await getWorkspacePublicRequestsBatch(requestIds);
      return new Map<string, RequestResponseDto>(
        batch.items.map((request) => [request.id, request]),
      );
    },
  };
}
