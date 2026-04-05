'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { listPublicRequests, type PublicRequestsFilter } from '@/lib/api/requests';
import { deleteOffer, listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import {
  buildRequestsExplorerNextPath,
  buildOffersByRequestMap,
  resolveTotalPages,
} from '@/components/requests/requestsExplorer.model';
import {
  buildFavoriteRequestIds,
  buildRequestByIdMap,
  buildRequestsExplorerPublicRequestsQueryState,
  findOfferRequestId,
  formatRequestsExplorerTotalResultsLabel,
  resolveRequestsExplorerLoginHref,
  resolveRequestsExplorerOfferHref,
} from '@/components/requests/requestsExplorerRequestsData.model';

type Params = {
  t: (key: I18nKey) => string;
  locale: Locale;
  isAuthed: boolean;
  isProvidersView: boolean;
  filter: PublicRequestsFilter;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  searchParams: { toString: () => string } | null;
  pathname: string;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests: boolean;
  initialPublicRequestsLoading: boolean;
  initialPublicRequestsError: boolean;
};

export function useRequestsExplorerRequestsData({
  t,
  locale,
  isAuthed,
  isProvidersView,
  filter,
  page,
  limit,
  setPage,
  searchParams,
  pathname,
  initialPublicRequests,
  preferInitialPublicRequests,
}: Params) {
  const router = useRouter();
  const qc = useQueryClient();

  const publicRequestsQueryState = React.useMemo(
    () =>
      buildRequestsExplorerPublicRequestsQueryState({
        filter,
        locale,
        isProvidersView,
        preferInitialPublicRequests,
        initialPublicRequests,
      }),
    [
      filter,
      initialPublicRequests,
      isProvidersView,
      locale,
      preferInitialPublicRequests,
    ],
  );

  const { data: publicRequests, isLoading, isError } = useQuery({
    queryKey: publicRequestsQueryState.queryKey,
    enabled: publicRequestsQueryState.enabled,
    queryFn: async () => {
      if (preferInitialPublicRequests) {
        const overview = await getWorkspacePublicOverview({
          cityId: filter.cityId,
          categoryKey: filter.categoryKey,
          subcategoryKey: filter.subcategoryKey,
          sort: filter.sort,
          page: filter.page,
          limit: filter.limit,
        });

        return overview.requests;
      }

      return listPublicRequests({ ...filter, locale });
    },
    placeholderData: publicRequestsQueryState.placeholderData,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const requests = React.useMemo(() => publicRequests?.items ?? [], [publicRequests?.items]);

  const { data: myOffers = [] } = useQuery({
    queryKey: ['offers-my'],
    enabled: !isProvidersView && isAuthed,
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), [], [401, 403]),
  });

  const offersByRequest = React.useMemo(
    () => buildOffersByRequestMap(myOffers),
    [myOffers],
  );
  const requestById = React.useMemo(
    () => buildRequestByIdMap(requests),
    [requests],
  );

  const { data: favoriteRequests = [] } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: !isProvidersView && isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('request'), [], [401, 403]),
  });

  const favoriteRequestIds = React.useMemo(
    () => buildFavoriteRequestIds(favoriteRequests),
    [favoriteRequests],
  );

  const nextPath = React.useMemo(() => {
    return buildRequestsExplorerNextPath(pathname, searchParams);
  }, [pathname, searchParams]);

  const {
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
  } = useRequestFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteRequestIds,
    requestById,
  });

  const [pendingOfferRequestId, setPendingOfferRequestId] = React.useState<string | null>(null);

  const openOfferSheet = React.useCallback(
    (requestId: string) => {
      if (!isAuthed) {
        toast.message(t(I18N_KEYS.requestDetails.loginRequired));
        router.push(resolveRequestsExplorerLoginHref(requestId));
        return;
      }
      router.push(resolveRequestsExplorerOfferHref(requestId));
    },
    [isAuthed, router, t],
  );

  const withdrawOffer = React.useCallback(
    async (offerId: string) => {
      const offerRequestId = findOfferRequestId(myOffers, offerId);
      if (!offerRequestId) return;
      setPendingOfferRequestId(offerRequestId);
      try {
        await deleteOffer(offerId);
        toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
        await qc.invalidateQueries({ queryKey: ['offers-my'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      } finally {
        setPendingOfferRequestId(null);
      }
    },
    [myOffers, qc, t],
  );

  const onWithdrawOffer = React.useCallback((offerId: string) => {
    void withdrawOffer(offerId);
  }, [withdrawOffer]);

  const totalResults = publicRequests?.total ?? requests.length;
  const totalPages = resolveTotalPages(totalResults, limit);
  const totalResultsLabel = React.useMemo(
    () => formatRequestsExplorerTotalResultsLabel(locale, totalResults),
    [locale, totalResults],
  );

  React.useEffect(() => {
    if (isProvidersView) return;
    if (isLoading || isError || !publicRequests) return;
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [isError, isLoading, isProvidersView, page, publicRequests, setPage, totalPages]);

  return {
    isLoading,
    isError,
    requests,
    offersByRequest,
    favoriteRequestIds,
    pendingFavoriteRequestIds,
    pendingOfferRequestId,
    totalPages,
    totalResultsLabel,
    openOfferSheet,
    onWithdrawOffer,
    toggleRequestFavorite,
  };
}
