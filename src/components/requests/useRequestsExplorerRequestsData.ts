'use client';

import * as React from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
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
import type { OfferDto } from '@/lib/api/dto/offers';
import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';
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
import { workspaceQK } from '@/features/workspace/requests/queryKeys';

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

  const privateQueryEntries = React.useMemo(
    () =>
      !isProvidersView && isAuthed
        ? [
          {
            key: 'myOffers' as const,
            query: {
              queryKey: workspaceQK.offersMy(),
              queryFn: () => withStatusFallback(() => listMyProviderOffers(), [], [401, 403]),
            },
          },
          {
            key: 'favoriteRequests' as const,
            query: {
              queryKey: workspaceQK.favoriteRequests(),
              queryFn: () => withStatusFallback(() => listFavorites('request'), [], [401, 403]),
            },
          },
        ]
        : [],
    [isAuthed, isProvidersView],
  );

  const privateQueryResults = useQueries({
    queries: privateQueryEntries.map((entry) => entry.query),
  });

  const privateQueryResultByKey = React.useMemo(
    () => new Map(privateQueryEntries.map((entry, index) => [entry.key, privateQueryResults[index]])),
    [privateQueryEntries, privateQueryResults],
  );

  const myOffersData = privateQueryResultByKey.get('myOffers')?.data as OfferDto[] | undefined;

  const offersByRequest = React.useMemo(
    () => buildOffersByRequestMap(myOffersData ?? []),
    [myOffersData],
  );
  const requestById = React.useMemo(
    () => buildRequestByIdMap(requests),
    [requests],
  );

  const favoriteRequestsData =
    privateQueryResultByKey.get('favoriteRequests')?.data as RequestResponseDto[] | undefined;

  const favoriteRequestIds = React.useMemo(
    () => buildFavoriteRequestIds(favoriteRequestsData ?? []),
    [favoriteRequestsData],
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
    async (offerId: string, requestId?: string) => {
      const offerRequestId = requestId ?? findOfferRequestId(myOffersData ?? [], offerId);
      if (!offerRequestId) return;
      setPendingOfferRequestId(offerRequestId);
      try {
        await deleteOffer(offerId);
        toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
        await qc.invalidateQueries({ queryKey: workspaceQK.offersMy() });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      } finally {
        setPendingOfferRequestId(null);
      }
    },
    [myOffersData, qc, t],
  );

  const onWithdrawOffer = React.useCallback((offerId: string, requestId?: string) => {
    void withdrawOffer(offerId, requestId);
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
