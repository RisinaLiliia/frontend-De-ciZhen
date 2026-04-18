import * as React from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getMyRequestById, getPublicRequestById } from '@/lib/api/requests';
import { listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { getMyProviderProfile } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { ApiError } from '@/lib/api/http-error';
import { useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { providerQK } from '@/features/provider/queries';
import type { AuthStatus } from '@/features/auth/store';

type RouterLike = {
  push: (href: string) => void;
};

type SearchParamsLike = {
  toString: () => string;
} | null;

type Params = {
  t: (key: I18nKey) => string;
  locale: Locale;
  requestId: string | undefined;
  isHydrated: boolean;
  authStatus: AuthStatus;
  isAuthed: boolean;
  pathname: string;
  searchParams: SearchParamsLike;
  router: RouterLike;
  qc: QueryClient;
};

export function useRequestDetailsPageData({
  t,
  locale,
  requestId,
  isHydrated,
  authStatus,
  isAuthed,
  pathname,
  searchParams,
  router,
  qc,
}: Params) {
  const {
    data: request,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['request-detail', requestId, locale],
    enabled: isHydrated && Boolean(requestId),
    queryFn: async () => {
      const id = String(requestId);
      if (authStatus === 'authenticated') {
        try {
          return await getMyRequestById(id);
        } catch (error) {
          if (!(error instanceof ApiError) || (error.status !== 403 && error.status !== 404)) {
            throw error;
          }
        }
      }
      return getPublicRequestById(id, { locale });
    },
    staleTime: 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const { data: myResponses } = useQuery({
    queryKey: ['offers-my'],
    enabled: isHydrated && authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), []),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const { data: providerProfile } = useQuery({
    queryKey: providerQK.myProfile(),
    enabled: isHydrated && authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => getMyProviderProfile(), null),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const { data: favoriteRequests = [] } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: isHydrated && authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => listFavorites('request'), []),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const existingResponse = React.useMemo(() => {
    if (!isAuthed || !request || !myResponses) return null;
    return myResponses.find((response) => response.requestId === request.id) ?? null;
  }, [isAuthed, myResponses, request]);

  const favoriteRequestIds = React.useMemo(
    () => new Set(favoriteRequests.map((item) => item.id)),
    [favoriteRequests],
  );
  const requestById = React.useMemo(() => {
    const map = new Map<string, RequestResponseDto>();
    if (request) map.set(request.id, request);
    return map;
  }, [request]);
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

  const isSaved = Boolean(request?.id && favoriteRequestIds.has(request.id));

  return {
    request,
    isLoading,
    isError,
    providerProfile: providerProfile ?? null,
    existingResponse,
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
    isSaved,
  };
}
