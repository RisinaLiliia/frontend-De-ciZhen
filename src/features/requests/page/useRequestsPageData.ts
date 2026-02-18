'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getPublicRequestById, listMyRequests, listPublicRequests } from '@/lib/api/requests';
import { getMyProviderProfile, listPublicProviders } from '@/lib/api/providers';
import { listMyContracts } from '@/lib/api/contracts';
import { listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { listMyReviews } from '@/lib/api/reviews';
import { ALL_OPTION_KEY } from '@/features/requests/page/public';
import type { ReviewsView } from '@/features/requests/page/workspace';

type PublicRequestsFilter = NonNullable<Parameters<typeof listPublicRequests>[0]>;

type Params = {
  filter: PublicRequestsFilter;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  activeReviewsView: ReviewsView;
  cityId: string;
  subcategoryKey: string;
};

async function with403or404Fallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      const status = Number((error as { status?: number }).status ?? 0);
      if (status === 403 || status === 404) return fallback;
    }
    throw error;
  }
}

export function useRequestsPageData(params: Params) {
  const { filter, isAuthed, isWorkspaceAuthed, activeReviewsView, cityId, subcategoryKey } = params;

  const { data: publicRequests, isLoading, isError } = useQuery({
    queryKey: [
      'requests-public',
      filter.cityId,
      filter.categoryKey,
      filter.subcategoryKey,
      filter.sort,
      filter.page,
      filter.limit,
    ],
    queryFn: () => listPublicRequests(filter),
  });

  const { data: allRequestsSummary } = useQuery({
    queryKey: ['requests-public-summary-total'],
    enabled: isAuthed,
    queryFn: () =>
      listPublicRequests({
        sort: 'date_desc',
        page: 1,
        limit: 1,
      }),
  });

  const { data: myOffers = [], isLoading: isMyOffersLoading } = useQuery({
    queryKey: ['offers-my'],
    enabled: isAuthed,
    queryFn: () => with403or404Fallback(() => listMyProviderOffers(), []),
  });

  const myOfferRequestIds = React.useMemo(
    () => Array.from(new Set(myOffers.map((offer) => offer.requestId).filter(Boolean))),
    [myOffers],
  );

  const { data: myOfferRequestsById = new Map<string, Awaited<ReturnType<typeof getPublicRequestById>>>() } = useQuery({
    queryKey: ['requests-by-my-offer-ids', ...myOfferRequestIds],
    enabled: isWorkspaceAuthed && myOfferRequestIds.length > 0,
    queryFn: async () => {
      const pairs = await Promise.all(
        myOfferRequestIds.map(async (id) => {
          try {
            const request = await getPublicRequestById(id);
            return [id, request] as const;
          } catch {
            return [id, null] as const;
          }
        }),
      );
      const map = new Map<string, Awaited<ReturnType<typeof getPublicRequestById>>>();
      pairs.forEach(([id, request]) => {
        if (request) map.set(id, request);
      });
      return map;
    },
  });

  const { data: favoriteRequests = [], isLoading: isFavoriteRequestsLoading } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: isAuthed,
    queryFn: () => with403or404Fallback(() => listFavorites('request'), []),
  });

  const { data: favoriteProviders = [], isLoading: isFavoriteProvidersLoading } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isAuthed,
    queryFn: () => with403or404Fallback(() => listFavorites('provider'), []),
  });

  const { data: myReviews = [], isLoading: isMyReviewsLoading } = useQuery({
    queryKey: ['reviews-my', activeReviewsView],
    enabled: isWorkspaceAuthed,
    queryFn: () => with403or404Fallback(() => listMyReviews({ role: activeReviewsView }), []),
  });

  const { data: myRequests = [], isLoading: isMyRequestsLoading } = useQuery({
    queryKey: ['requests-my'],
    enabled: isWorkspaceAuthed,
    queryFn: () => with403or404Fallback(() => listMyRequests(), []),
  });

  const { data: myProviderContracts = [], isLoading: isProviderContractsLoading } = useQuery({
    queryKey: ['contracts-my-provider'],
    enabled: isWorkspaceAuthed,
    queryFn: () => with403or404Fallback(() => listMyContracts({ role: 'provider' }), []),
  });

  const { data: myClientContracts = [], isLoading: isClientContractsLoading } = useQuery({
    queryKey: ['contracts-my-client'],
    enabled: isWorkspaceAuthed,
    queryFn: () => with403or404Fallback(() => listMyContracts({ role: 'client' }), []),
  });

  const { data: myProviderProfile } = useQuery({
    queryKey: ['provider-profile-me'],
    enabled: isAuthed,
    queryFn: () => with403or404Fallback(() => getMyProviderProfile(), null),
  });

  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery({
    queryKey: ['providers-public', cityId, subcategoryKey],
    queryFn: () =>
      listPublicProviders({
        cityId: cityId === ALL_OPTION_KEY ? undefined : cityId,
        serviceKey: subcategoryKey === ALL_OPTION_KEY ? undefined : subcategoryKey,
      }),
  });

  return {
    publicRequests,
    isLoading,
    isError,
    allRequestsSummary,
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
    myProviderProfile,
    providers,
    isProvidersLoading,
    isProvidersError,
  };
}
