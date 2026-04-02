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
} from '@/lib/api/workspace';
import type { WorkspacePublicOverviewQuery } from '@/lib/api/workspace';
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
  filter: WorkspacePublicOverviewQuery;
  loadPlan: WorkspaceDataLoadPlan;
  hasAccessToken: boolean;
};

export function buildWorkspaceDataQueries({
  filter,
  loadPlan,
  hasAccessToken,
}: WorkspaceDataQueriesArgs) {
  return {
    publicOverview: buildStableWorkspaceQuery({
      queryKey: workspaceQK.workspacePublicOverview({
        cityId: filter.cityId,
        categoryKey: filter.categoryKey,
        subcategoryKey: filter.subcategoryKey,
        sort: filter.sort,
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
          page: filter.page,
          limit: filter.limit,
        }),
    }),
    publicSummary: buildStableWorkspaceQuery({
      queryKey: workspaceQK.workspacePublicSummary(WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT),
      enabled: true,
      queryFn: () =>
        getWorkspacePublicOverview({
          page: 1,
          limit: 1,
          cityActivityLimit: WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
        }),
    }),
    privateOverview: buildStableWorkspaceQuery({
      queryKey: workspaceQK.workspacePrivateOverview(),
      enabled: loadPlan.shouldLoadPrivateOverview,
      queryFn: () =>
        hasAccessToken
          ? withStatusFallback(() => getWorkspacePrivateOverview(), null, [401, 403])
          : Promise.resolve(null),
    }),
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
