'use client';

import * as React from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addFavorite, isProviderInFavoriteLookup, removeFavorite } from '@/lib/api/favorites';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { workspaceQK } from '@/features/workspace/data';

type RouterLike = {
  push: (href: string) => void;
};

type Translator = (key: I18nKey) => string;
type ProviderFavoriteSnapshot = Pick<ProviderPublicDto, 'id' | 'userId'>;

type UseRequestFavoriteToggleParams = {
  enabled?: boolean;
  isAuthed: boolean;
  nextPath: string;
  router: RouterLike;
  t: Translator;
  qc: QueryClient;
  favoriteRequestIds: ReadonlySet<string>;
  requestById: ReadonlyMap<string, RequestResponseDto>;
};

type UseProviderFavoriteToggleParams = {
  enabled?: boolean;
  isAuthed: boolean;
  nextPath: string;
  router: RouterLike;
  t: Translator;
  qc: QueryClient;
  favoriteProviderIds?: ReadonlySet<string>;
  favoriteProviderLookup?: ReadonlySet<string>;
  providerById: ReadonlyMap<string, ProviderFavoriteSnapshot>;
};

export function useRequestFavoriteToggle({
  enabled = true,
  isAuthed,
  nextPath,
  router,
  t,
  qc,
  favoriteRequestIds,
  requestById,
}: UseRequestFavoriteToggleParams) {
  const [pendingFavoriteRequestIds, setPendingFavoriteRequestIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  const toggleRequestFavorite = React.useCallback(
    async (requestId: string) => {
      if (!enabled) return;
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
        await qc.invalidateQueries({ queryKey: workspaceQK.favoriteRequests() });
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
    [
      enabled,
      favoriteRequestIds,
      isAuthed,
      nextPath,
      pendingFavoriteRequestIds,
      qc,
      requestById,
      router,
      t,
    ],
  );

  return {
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
  };
}

export function useProviderFavoriteToggle({
  enabled = true,
  isAuthed,
  nextPath,
  router,
  t,
  qc,
  favoriteProviderIds,
  favoriteProviderLookup,
  providerById,
}: UseProviderFavoriteToggleParams) {
  const [pendingFavoriteProviderIds, setPendingFavoriteProviderIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  const isProviderSaved = React.useCallback(
    (providerId: string) => {
      if (favoriteProviderIds) {
        return favoriteProviderIds.has(providerId);
      }
      const provider = providerById.get(providerId);
      return provider && favoriteProviderLookup
        ? isProviderInFavoriteLookup(favoriteProviderLookup, provider)
        : (favoriteProviderLookup?.has(providerId) ?? false);
    },
    [favoriteProviderIds, favoriteProviderLookup, providerById],
  );

  const toggleProviderFavorite = React.useCallback(
    async (providerId: string) => {
      if (!enabled) return;
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
        await Promise.all([
          qc.invalidateQueries({ queryKey: workspaceQK.workspaceProvidersMainPrefix() }),
          qc.invalidateQueries({ queryKey: workspaceQK.workspaceProvidersOverviewPrefix() }),
          qc.invalidateQueries({ queryKey: workspaceQK.favoriteProviders() }),
        ]);
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
    [
      enabled,
      isAuthed,
      isProviderSaved,
      nextPath,
      pendingFavoriteProviderIds,
      providerById,
      qc,
      router,
      t,
    ],
  );

  return {
    pendingFavoriteProviderIds,
    isProviderSaved,
    toggleProviderFavorite,
  };
}
