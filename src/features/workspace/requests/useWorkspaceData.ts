'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getPublicRequestById, listMyRequests, listPublicRequests } from '@/lib/api/requests';
import { getMyProviderProfile, listPublicProviders } from '@/lib/api/providers';
import { listMyContracts } from '@/lib/api/contracts';
import { listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { listMyReviews } from '@/lib/api/reviews';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import type { ReviewsView, WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import { providerQK } from '@/features/provider/queries';

type PublicRequestsFilter = NonNullable<Parameters<typeof listPublicRequests>[0]>;

type Params = {
  filter: PublicRequestsFilter;
  locale: string;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  shouldLoadPrivateData: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activeReviewsView: ReviewsView;
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
    activeReviewsView,
  } = params;
  const shouldLoadPublicRequests = isWorkspacePublicSection || !isWorkspaceAuthed;

  const { data: publicRequests, isLoading, isError } = useQuery({
    queryKey: workspaceQK.requestsPublic({
      cityId: filter.cityId,
      categoryKey: filter.categoryKey,
      subcategoryKey: filter.subcategoryKey,
      sort: filter.sort,
      page: filter.page,
      limit: filter.limit,
      locale,
    }),
    enabled: shouldLoadPublicRequests,
    queryFn: () => listPublicRequests({ ...filter, locale }),
  });

  const { data: allRequestsSummary } = useQuery({
    queryKey: workspaceQK.requestsPublicSummaryTotal(locale),
    enabled: isWorkspacePublicSection || isWorkspaceAuthed,
    queryFn: () =>
      listPublicRequests({
        locale,
        sort: 'date_desc',
        page: 1,
        limit: 1,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: myOffers = [], isLoading: isMyOffersLoading } = useQuery({
    queryKey: workspaceQK.offersMy(),
    enabled: isAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), []),
  });

  const myOfferRequestIds = React.useMemo(
    () => Array.from(new Set(myOffers.map((offer) => offer.requestId).filter(Boolean))),
    [myOffers],
  );
  const shouldLoadOfferRequests = isWorkspaceAuthed && activeWorkspaceTab === 'my-offers';
  const shouldLoadReviews = isWorkspaceAuthed && activeWorkspaceTab === 'reviews';

  const { data: myOfferRequestsById = new Map<string, Awaited<ReturnType<typeof getPublicRequestById>>>() } = useQuery({
    queryKey: workspaceQK.requestsByMyOfferIds(locale, myOfferRequestIds),
    enabled: shouldLoadOfferRequests && myOfferRequestIds.length > 0,
    queryFn: async () => {
      const pairs = await Promise.all(
        myOfferRequestIds.map(async (id) => {
          try {
            const request = await getPublicRequestById(id, { locale });
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
    queryKey: workspaceQK.favoriteRequests(),
    enabled: isAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listFavorites('request'), []),
  });

  const { data: favoriteProviders = [], isLoading: isFavoriteProvidersLoading } = useQuery({
    queryKey: workspaceQK.favoriteProviders(),
    enabled: isAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), []),
  });

  const { data: myReviews = [], isLoading: isMyReviewsLoading } = useQuery({
    queryKey: workspaceQK.reviewsMy(activeReviewsView),
    enabled: shouldLoadReviews && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listMyReviews({ role: activeReviewsView }), []),
  });

  const { data: myRequests = [], isLoading: isMyRequestsLoading } = useQuery({
    queryKey: workspaceQK.requestsMy(),
    enabled: isWorkspaceAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listMyRequests(), []),
  });

  const { data: myProviderContracts = [], isLoading: isProviderContractsLoading } = useQuery({
    queryKey: workspaceQK.contractsMyProvider(),
    enabled: isWorkspaceAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listMyContracts({ role: 'provider' }), []),
  });

  const { data: myClientContracts = [], isLoading: isClientContractsLoading } = useQuery({
    queryKey: workspaceQK.contractsMyClient(),
    enabled: isWorkspaceAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => listMyContracts({ role: 'client' }), []),
  });

  const { data: myProviderProfile } = useQuery({
    queryKey: providerQK.myProfile(),
    enabled: isAuthed && shouldLoadPrivateData,
    queryFn: () => withStatusFallback(() => getMyProviderProfile(), null),
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
