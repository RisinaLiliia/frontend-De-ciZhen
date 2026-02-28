'use client';

import * as React from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addFavorite, isProviderInFavoriteLookup, removeFavorite } from '@/lib/api/favorites';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';

type RouterLike = {
  push: (href: string) => void;
};

type Translator = (key: I18nKey) => string;

type UseRequestFavoriteToggleParams = {
  isAuthed: boolean;
  nextPath: string;
  router: RouterLike;
  t: Translator;
  qc: QueryClient;
  favoriteRequestIds: ReadonlySet<string>;
  requestById: ReadonlyMap<string, RequestResponseDto>;
};

type UseProviderFavoriteToggleParams = {
  isAuthed: boolean;
  nextPath: string;
  router: RouterLike;
  t: Translator;
  qc: QueryClient;
  favoriteProviderLookup: ReadonlySet<string>;
  providerById: ReadonlyMap<string, ProviderPublicDto>;
};

export function useRequestFavoriteToggle({
  isAuthed,
  nextPath,
  router,
  t,
  qc,
  favoriteRequestIds,
  requestById,
}: UseRequestFavoriteToggleParams) {
  const [pendingFavoriteRequestIds, setPendingFavoriteRequestIds] = React.useState<Set<string>>(() => new Set());

  const toggleRequestFavorite = React.useCallback(
    async (requestId: string) => {
      if (!isAuthed) {
        router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        toast.message(t(I18N_KEYS.requestDetails.favoritesSoon));
        return;
      }
      if (pendingFavoriteRequestIds.has(requestId)) return;
      const request = requestById.get(requestId);
      const isSaved = favoriteRequestIds.has(requestId);
      setPendingFavoriteRequestIds((prev) => {
        const next = new Set(prev);
        next.add(requestId);
        return next;
      });
      try {
        if (isSaved) {
          await removeFavorite('request', requestId, request);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        } else {
          await addFavorite('request', requestId, request);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
        await qc.invalidateQueries({ queryKey: ['favorite-requests'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      } finally {
        setPendingFavoriteRequestIds((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
      }
    },
    [favoriteRequestIds, isAuthed, nextPath, pendingFavoriteRequestIds, qc, requestById, router, t],
  );

  return {
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
  };
}

export function useProviderFavoriteToggle({
  isAuthed,
  nextPath,
  router,
  t,
  qc,
  favoriteProviderLookup,
  providerById,
}: UseProviderFavoriteToggleParams) {
  const [pendingFavoriteProviderIds, setPendingFavoriteProviderIds] = React.useState<Set<string>>(() => new Set());

  const isProviderSaved = React.useCallback(
    (providerId: string) => {
      const provider = providerById.get(providerId);
      return provider
        ? isProviderInFavoriteLookup(favoriteProviderLookup, provider)
        : favoriteProviderLookup.has(providerId);
    },
    [favoriteProviderLookup, providerById],
  );

  const toggleProviderFavorite = React.useCallback(
    async (providerId: string) => {
      if (!isAuthed) {
        router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        toast.message(t(I18N_KEYS.requestDetails.favoritesSoon));
        return;
      }
      if (pendingFavoriteProviderIds.has(providerId)) return;
      const provider = providerById.get(providerId);
      const isSaved = isProviderSaved(providerId);
      setPendingFavoriteProviderIds((prev) => {
        const next = new Set(prev);
        next.add(providerId);
        return next;
      });
      try {
        if (isSaved) {
          await removeFavorite('provider', providerId, provider);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        } else {
          await addFavorite('provider', providerId, provider);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
        await qc.invalidateQueries({ queryKey: ['favorite-providers'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      } finally {
        setPendingFavoriteProviderIds((prev) => {
          const next = new Set(prev);
          next.delete(providerId);
          return next;
        });
      }
    },
    [isAuthed, isProviderSaved, nextPath, pendingFavoriteProviderIds, providerById, qc, router, t],
  );

  return {
    pendingFavoriteProviderIds,
    isProviderSaved,
    toggleProviderFavorite,
  };
}

