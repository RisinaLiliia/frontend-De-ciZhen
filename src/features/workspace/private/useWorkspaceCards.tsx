'use client';

import * as React from 'react';

import { ProviderCard } from '@/components/providers/ProviderCard';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { isProviderInFavoriteLookup } from '@/lib/api/favorites';

type Translator = (key: I18nKey) => string;

type Args = {
  t: Translator;
  favoriteProviders: ProviderPublicDto[];
  favoriteProviderLookup: ReadonlySet<string>;
  pendingFavoriteProviderIds: ReadonlySet<string>;
  onToggleProviderFavorite: (providerId: string) => void;
  favoriteProviderRoleLabelById: ReadonlyMap<string, string>;
  favoriteProviderCityLabelById: ReadonlyMap<string, string>;
};

export function useWorkspaceCards({
  t,
  favoriteProviders,
  favoriteProviderLookup,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
  favoriteProviderRoleLabelById,
  favoriteProviderCityLabelById,
}: Args) {
  const favoriteProviderCards = React.useMemo(
    () =>
      favoriteProviders.map((item) => (
        <ProviderCard
          key={`fav-provider-${item.id}`}
          variant="list"
          canToggleFavorite
          isFavorite={isProviderInFavoriteLookup(favoriteProviderLookup, item)}
          isFavoritePending={pendingFavoriteProviderIds.has(item.id)}
          onToggleFavorite={onToggleProviderFavorite}
          provider={mapPublicProviderToCard({
            t,
            provider: item,
            roleLabel: favoriteProviderRoleLabelById.get(item.id) ?? '',
            cityLabel: favoriteProviderCityLabelById.get(item.id) ?? '',
            profileHref: `/providers/${item.id}`,
            reviewsHref: `/providers/${item.id}#reviews`,
            ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
            status: 'online',
          })}
        />
      )),
    [
      favoriteProviderCityLabelById,
      favoriteProviderLookup,
      favoriteProviderRoleLabelById,
      favoriteProviders,
      onToggleProviderFavorite,
      pendingFavoriteProviderIds,
      t,
    ],
  );

  return {
    favoriteProviderCards,
  };
}
