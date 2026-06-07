'use client';

import type { ProviderCard } from '@/components/providers/ProviderCard';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { isProviderInFavoriteLookup } from '@/lib/api/favorites';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Translator = (key: I18nKey) => string;
type FavoriteProviderCardProps = Omit<Parameters<typeof ProviderCard>[0], 'variant'>;

type BuildWorkspaceFavoriteProviderCardPropsArgs = {
  t: Translator;
  locale: Locale;
  provider: ProviderPublicDto;
  favoriteProviderLookup: ReadonlySet<string>;
  pendingFavoriteProviderIds: ReadonlySet<string>;
  onToggleProviderFavorite: (providerId: string) => void;
  favoriteProviderRoleLabelById: ReadonlyMap<string, string>;
  favoriteProviderCityLabelById: ReadonlyMap<string, string>;
};

export function buildWorkspaceFavoriteProviderCardProps({
  t,
  locale,
  provider,
  favoriteProviderLookup,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
  favoriteProviderRoleLabelById,
  favoriteProviderCityLabelById,
}: BuildWorkspaceFavoriteProviderCardPropsArgs): FavoriteProviderCardProps {
  return {
    canToggleFavorite: true,
    isFavorite: isProviderInFavoriteLookup(favoriteProviderLookup, provider),
    isFavoritePending: pendingFavoriteProviderIds.has(provider.id),
    onToggleFavorite: onToggleProviderFavorite,
    provider: mapPublicProviderToCard({
      t,
      locale,
      provider,
      roleLabel: favoriteProviderRoleLabelById.get(provider.id) ?? '',
      cityLabel: favoriteProviderCityLabelById.get(provider.id) ?? '',
      profileHref: `/providers/${provider.id}`,
      reviewsHref: `/providers/${provider.id}#reviews`,
      ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
      status: 'online',
    }),
  };
}

export function buildWorkspaceFavoriteProviderCardModels(params: {
  t: Translator;
  locale: Locale;
  favoriteProviders: ProviderPublicDto[];
  favoriteProviderLookup: ReadonlySet<string>;
  pendingFavoriteProviderIds: ReadonlySet<string>;
  onToggleProviderFavorite: (providerId: string) => void;
  favoriteProviderRoleLabelById: ReadonlyMap<string, string>;
  favoriteProviderCityLabelById: ReadonlyMap<string, string>;
}) {
  return params.favoriteProviders.map((provider) => ({
    key: `fav-provider-${provider.id}`,
    props: buildWorkspaceFavoriteProviderCardProps({
      t: params.t,
      locale: params.locale,
      provider,
      favoriteProviderLookup: params.favoriteProviderLookup,
      pendingFavoriteProviderIds: params.pendingFavoriteProviderIds,
      onToggleProviderFavorite: params.onToggleProviderFavorite,
      favoriteProviderRoleLabelById: params.favoriteProviderRoleLabelById,
      favoriteProviderCityLabelById: params.favoriteProviderCityLabelById,
    }),
  }));
}
