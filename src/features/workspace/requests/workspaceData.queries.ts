'use client';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { listMyRequests } from '@/lib/api/requests';
import { listPublicProviders } from '@/lib/api/providers';
import { listMyContracts } from '@/lib/api/contracts';
import { listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { listMyReviews } from '@/lib/api/reviews';
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
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/requests/workspace.constants';
import type { WorkspaceDataLoadPlan } from '@/features/workspace/requests/workspaceData.model';

const DEFAULT_STALE_TIME_MS = 60_000;
const PROVIDERS_STALE_TIME_MS = 30_000;
const PROVIDERS_GC_TIME_MS = 5 * 60 * 1000;

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

type BuildWorkspaceLegacyPrivateQueriesArgs = Pick<
  WorkspaceDataQueriesArgs,
  'loadPlan'
>;

function buildWorkspaceContractQueries({
  enabled = true,
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
      enabled: loadPlan.shouldLoadPublicRequests,
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
      enabled,
      queryFn: () =>
        getWorkspacePublicOverview({
          page: 1,
          limit: 1,
          cityActivityLimit: publicSummaryCityActivityLimit,
        }),
    }),
    privateOverview: buildStableWorkspaceQuery({
      queryKey: workspaceQK.workspacePrivateOverview(activeRequestsPeriod),
      enabled: loadPlan.shouldLoadPrivateOverview,
      queryFn: () =>
        hasAccessToken
          ? withStatusFallback(() => getWorkspacePrivateOverview({ period: activeRequestsPeriod }), null, [401, 403])
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
        page: requestsScope === 'market' ? filter.page : undefined,
        limit: requestsScope === 'market' ? filter.limit : undefined,
      }),
      enabled: loadPlan.shouldLoadWorkspaceRequests,
      queryFn: () => {
        if (!loadPlan.shouldLoadWorkspaceRequests) {
          return Promise.resolve(null);
        }

        const query = requestsScope === 'market'
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
          };

        if (requestsScope === 'market') {
          return getWorkspaceRequests(query);
        }

        return hasAccessToken
          ? withStatusFallback(() => getWorkspaceRequests(query), null, [401, 403])
          : Promise.resolve(null);
      },
    }),
  };
}

function buildWorkspaceLegacyPrivateQueries({
  loadPlan,
}: BuildWorkspaceLegacyPrivateQueriesArgs) {
  return {
    myOffers: {
      queryKey: workspaceQK.offersMy(),
      enabled: loadPlan.shouldLoadMyOffers,
      queryFn: () => withStatusFallback(() => listMyProviderOffers(), []),
    },
    favoriteRequests: {
      queryKey: workspaceQK.favoriteRequests(),
      enabled: loadPlan.shouldLoadFavoriteRequests,
      queryFn: () => withStatusFallback(() => listFavorites('request'), []),
    },
    favoriteProviders: {
      queryKey: workspaceQK.favoriteProviders(),
      enabled: loadPlan.shouldLoadFavoriteProviders,
      queryFn: () => withStatusFallback(() => listFavorites('provider'), []),
    },
    myReviews: {
      queryKey: workspaceQK.reviewsMy(),
      enabled: loadPlan.shouldLoadReviews,
      queryFn: () => withStatusFallback(() => listMyReviews({ role: 'all' }), []),
    },
    myRequests: {
      queryKey: workspaceQK.requestsMy(),
      enabled: loadPlan.shouldLoadMyRequests,
      queryFn: () => withStatusFallback(() => listMyRequests(), []),
    },
    myProviderContracts: {
      queryKey: workspaceQK.contractsMyProvider(),
      enabled: loadPlan.shouldLoadMyContracts,
      queryFn: () => withStatusFallback(() => listMyContracts({ role: 'provider' }), []),
    },
    myClientContracts: {
      queryKey: workspaceQK.contractsMyClient(),
      enabled: loadPlan.shouldLoadMyContracts,
      queryFn: () => withStatusFallback(() => listMyContracts({ role: 'client' }), []),
    },
    providers: {
      queryKey: workspaceQK.providersPublic(),
      enabled: loadPlan.shouldLoadProviders,
      queryFn: () => listPublicProviders(),
      staleTime: PROVIDERS_STALE_TIME_MS,
      gcTime: PROVIDERS_GC_TIME_MS,
      refetchOnMount: true as const,
      refetchOnWindowFocus: true as const,
    },
  };
}

export function buildWorkspaceDataQueries(args: WorkspaceDataQueriesArgs) {
  return {
    ...buildWorkspaceContractQueries(args),
    ...buildWorkspaceLegacyPrivateQueries(args),
  };
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
      return new Map<string, RequestResponseDto>(batch.items.map((request) => [request.id, request]));
    },
  };
}
