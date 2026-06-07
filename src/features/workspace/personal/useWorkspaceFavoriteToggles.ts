'use client';

import * as React from 'react';
import type { QueryClient } from '@tanstack/react-query';

import { useProviderFavoriteToggle, useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import {
  buildWorkspaceFavoriteToggleHandlers,
  buildWorkspaceFavoriteTogglesResult,
} from '@/features/workspace/personal/workspaceFavoriteToggles.model';

type RouterLike = {
  push: (href: string) => void;
};

type Translator = (key: I18nKey) => string;

type Args = {
  includeRequestToggle?: boolean;
  includeProviderToggle?: boolean;
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
  includeRequestToggle = true,
  includeProviderToggle = true,
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
    enabled: includeRequestToggle,
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
    enabled: includeProviderToggle,
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteProviderLookup,
    providerById,
  });

  const {
    onToggleRequestFavorite,
    onToggleProviderFavorite,
  } = React.useMemo(
    () =>
      buildWorkspaceFavoriteToggleHandlers({
        toggleRequestFavorite,
        toggleProviderFavorite,
      }),
    [toggleProviderFavorite, toggleRequestFavorite],
  );

  return React.useMemo(
    () =>
      buildWorkspaceFavoriteTogglesResult({
        requestToggle: {
          pendingFavoriteRequestIds,
        },
        providerToggle: {
          pendingFavoriteProviderIds,
        },
        onToggleRequestFavorite,
        onToggleProviderFavorite,
      }),
    [
      onToggleProviderFavorite,
      onToggleRequestFavorite,
      pendingFavoriteProviderIds,
      pendingFavoriteRequestIds,
    ],
  );
}
