'use client';

import * as React from 'react';
import type { QueryClient } from '@tanstack/react-query';

import { useProviderFavoriteToggle, useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';

type RouterLike = {
  push: (href: string) => void;
};

type Translator = (key: I18nKey) => string;

type Args = {
  isAuthed: boolean;
  nextPath: string;
  router: RouterLike;
  t: Translator;
  qc: QueryClient;
  favoriteRequestIds: ReadonlySet<string>;
  requestById: ReadonlyMap<string, RequestResponseDto>;
  favoriteProviderLookup: ReadonlySet<string>;
  providerById: ReadonlyMap<string, ProviderPublicDto>;
};

export function useWorkspaceFavoriteToggles({
  isAuthed,
  nextPath,
  router,
  t,
  qc,
  favoriteRequestIds,
  requestById,
  favoriteProviderLookup,
  providerById,
}: Args) {
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

  const {
    pendingFavoriteProviderIds,
    toggleProviderFavorite,
  } = useProviderFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteProviderLookup,
    providerById,
  });

  const onToggleRequestFavorite = React.useCallback((requestId: string) => {
    void toggleRequestFavorite(requestId);
  }, [toggleRequestFavorite]);

  const onToggleProviderFavorite = React.useCallback((providerId: string) => {
    void toggleProviderFavorite(providerId);
  }, [toggleProviderFavorite]);

  return {
    pendingFavoriteRequestIds,
    pendingFavoriteProviderIds,
    onToggleRequestFavorite,
    onToggleProviderFavorite,
  };
}
