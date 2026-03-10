'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

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
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/requests/workspace.constants';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { WorkspacePublicOverviewQuery } from '@/lib/api/workspace';

type Params = {
  filter: WorkspacePublicOverviewQuery;
  locale: string;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  shouldLoadPrivateData: boolean;
  activeWorkspaceTab: WorkspaceTab;
};

export function useWorkspaceData(params: Params) {
  const {
    filter,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    isWorkspacePublicSection,
    shouldLoadPrivateData,
    activeWorkspaceTab,
  } = params;
  const shouldLoadPublicRequests = isWorkspacePublicSection || !isWorkspaceAuthed;
  const shouldLoadMyRequests =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'my-requests';
  const shouldLoadMyOffers =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'my-offers';
  const shouldLoadMyContracts =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'completed-jobs';
  const shouldLoadFavoriteRequests =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'favorites';

  const { data: publicOverview, isLoading, isError } = useQuery({
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
    enabled: shouldLoadPublicRequests,
    queryFn: () =>
      getWorkspacePublicOverview({
        cityId: filter.cityId,
        categoryKey: filter.categoryKey,
        subcategoryKey: filter.subcategoryKey,
        sort: filter.sort,
        page: filter.page,
        limit: filter.limit,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const publicRequests = publicOverview?.requests;

  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery({
    queryKey: workspaceQK.workspacePublicSummary(WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT),
    enabled: true,
    queryFn: () =>
      getWorkspacePublicOverview({
        page: 1,
        limit: 1,
        cityActivityLimit: WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const allRequestsSummary = publicSummaryOverview?.summary;
  const publicCityActivity = publicSummaryOverview?.cityActivity;

  const { data: workspacePrivateOverview } = useQuery({
    queryKey: workspaceQK.workspacePrivateOverview(),
    enabled: isWorkspaceAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => getWorkspacePrivateOverview(), null, [401, 403]),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: myOffers = [], isLoading: isMyOffersLoading } = useQuery({
    queryKey: workspaceQK.offersMy(),
    enabled: shouldLoadMyOffers,
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), []),
  });

  const myOfferRequestIds = React.useMemo(
    () => Array.from(new Set(myOffers.map((offer) => offer.requestId).filter(Boolean))),
    [myOffers],
  );
  const shouldLoadOfferRequests = isWorkspaceAuthed && activeWorkspaceTab === 'my-offers';
  const shouldLoadReviews = isWorkspaceAuthed && activeWorkspaceTab === 'reviews';

  const { data: myOfferRequestsById = new Map<string, RequestResponseDto>() } = useQuery({
    queryKey: workspaceQK.requestsByMyOfferIds(locale, myOfferRequestIds),
    enabled: shouldLoadOfferRequests && myOfferRequestIds.length > 0,
    queryFn: async () => {
      const batch = await getWorkspacePublicRequestsBatch(myOfferRequestIds);
      return new Map<string, RequestResponseDto>(batch.items.map((request) => [request.id, request]));
    },
  });

  const { data: favoriteRequests = [], isLoading: isFavoriteRequestsLoading } = useQuery({
    queryKey: workspaceQK.favoriteRequests(),
    enabled: shouldLoadFavoriteRequests,
    queryFn: () => withStatusFallback(() => listFavorites('request'), []),
  });

  const { data: favoriteProviders = [], isLoading: isFavoriteProvidersLoading } = useQuery({
    queryKey: workspaceQK.favoriteProviders(),
    enabled: isAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), []),
  });

  const { data: myReviews = [], isLoading: isMyReviewsLoading } = useQuery({
    queryKey: workspaceQK.reviewsMy(),
    enabled: shouldLoadReviews && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listMyReviews({ role: 'all' }), []),
  });

  const { data: myRequests = [], isLoading: isMyRequestsLoading } = useQuery({
    queryKey: workspaceQK.requestsMy(),
    enabled: shouldLoadMyRequests,
    queryFn: () => withStatusFallback(() => listMyRequests(), []),
  });

  const { data: myProviderContracts = [], isLoading: isProviderContractsLoading } = useQuery({
    queryKey: workspaceQK.contractsMyProvider(),
    enabled: shouldLoadMyContracts,
    queryFn: () => withStatusFallback(() => listMyContracts({ role: 'provider' }), []),
  });

  const { data: myClientContracts = [], isLoading: isClientContractsLoading } = useQuery({
    queryKey: workspaceQK.contractsMyClient(),
    enabled: shouldLoadMyContracts,
    queryFn: () => withStatusFallback(() => listMyContracts({ role: 'client' }), []),
  });

  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery({
    queryKey: workspaceQK.providersPublic(),
    enabled: !isWorkspacePublicSection && shouldLoadPrivateData,
    queryFn: () => listPublicProviders(),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    publicRequests,
    isLoading,
    isError,
    allRequestsSummary,
    publicCityActivity,
    isPublicSummaryLoading,
    isPublicSummaryError,
    workspacePrivateOverview,
    myOffers,
    isMyOffersLoading,
    myOfferRequestsById,
    favoriteRequests,
    isFavoriteRequestsLoading,
    favoriteProviders,
    isFavoriteProvidersLoading,
    myReviews,
    isMyReviewsLoading,
    myRequests,
    isMyRequestsLoading,
    myProviderContracts,
    isProviderContractsLoading,
    myClientContracts,
    isClientContractsLoading,
    providers,
    isProvidersLoading,
    isProvidersError,
  };
}
