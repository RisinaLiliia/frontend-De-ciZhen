'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { listPublicRequests, type PublicRequestsFilter } from '@/lib/api/requests';
import { deleteOffer, listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import {
  buildOffersByRequestMap,
  hasDefaultPublicFilter,
  resolveTotalPages,
} from '@/components/requests/requestsExplorer.model';

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
  initialPublicRequestsLoading,
  initialPublicRequestsError,
}: Params) {
  const router = useRouter();
  const qc = useQueryClient();

  const hasDefaultFilter = hasDefaultPublicFilter(filter);
  const shouldUseInitialPublicRequests = preferInitialPublicRequests && hasDefaultFilter;
  const hasInitialPublicRequests = Boolean(initialPublicRequests);

  const { data: publicRequests, isLoading, isError } = useQuery({
    queryKey: [
      'requests-explorer-public',
      filter.cityId,
      filter.categoryKey,
      filter.subcategoryKey,
      filter.sort,
      filter.page,
      filter.limit,
      locale,
    ],
    enabled:
      !isProvidersView &&
      (!shouldUseInitialPublicRequests ||
        hasInitialPublicRequests ||
        initialPublicRequestsError ||
        !initialPublicRequestsLoading),
    queryFn: () => listPublicRequests({ ...filter, locale }),
    initialData:
      !isProvidersView && shouldUseInitialPublicRequests
        ? initialPublicRequests
        : undefined,
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
    () => new Map(requests.map((request) => [request.id, request])),
    [requests],
  );

  const { data: favoriteRequests = [] } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: !isProvidersView && isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('request'), [], [401, 403]),
  });

  const favoriteRequestIds = React.useMemo(
    () => new Set(favoriteRequests.map((item) => item.id)),
    [favoriteRequests],
  );

  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
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
        router.push(`/auth/login?next=${encodeURIComponent(`/requests/${requestId}?offer=1`)}`);
        return;
      }
      router.push(`/requests/${requestId}?offer=1`);
    },
    [isAuthed, router, t],
  );

  const withdrawOffer = React.useCallback(
    async (offerId: string) => {
      const offer = myOffers.find((item) => item.id === offerId);
      if (!offer) return;
      setPendingOfferRequestId(offer.requestId);
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
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(totalResults),
    [locale, totalResults],
  );

  React.useEffect(() => {
    if (isProvidersView) return;
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [isProvidersView, page, setPage, totalPages]);

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
