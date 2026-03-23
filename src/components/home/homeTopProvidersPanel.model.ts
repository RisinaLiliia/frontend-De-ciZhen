import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import type { City } from '@/features/catalog/model';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { isProviderInFavoriteLookup } from '@/lib/api/favorites';
import { pickI18n } from '@/lib/i18n/helpers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Translator = (key: I18nKey) => string;

export function rankHomeTopProviders(providers: ProviderPublicDto[], limit: number) {
  const max = Math.max(1, limit);
  return [...providers]
    .sort((a, b) => b.ratingAvg - a.ratingAvg)
    .slice(0, max);
}

export function buildHomeTopProvidersById(providers: ProviderPublicDto[]) {
  return new Map(providers.map((provider) => [provider.id, provider]));
}

export function buildHomeFavoriteProviderIds(params: {
  providers: ProviderPublicDto[];
  favoriteProviderLookup: ReadonlySet<string>;
}) {
  const ids = new Set<string>();
  for (const provider of params.providers) {
    if (isProviderInFavoriteLookup(params.favoriteProviderLookup, provider)) {
      ids.add(provider.id);
    }
  }
  return ids;
}

export function buildHomeTopProvidersNextPath(pathname: string, searchParamsValue: string) {
  return `${pathname}${searchParamsValue ? `?${searchParamsValue}` : ''}`;
}

export function buildHomeCityLabelById(params: {
  cities: City[];
  locale: Locale;
}) {
  const map = new Map<string, string>();
  for (const city of params.cities) {
    map.set(city.id, pickI18n(city.i18n, params.locale));
  }
  return map;
}

export function buildHomeTopProviderCards(params: {
  t: Translator;
  providers: ProviderPublicDto[];
  cityLabelById: ReadonlyMap<string, string>;
}): TopProviderItem[] {
  const topBadge = {
    type: 'top' as const,
    size: 'md' as const,
    label: params.t(I18N_KEYS.homePublic.providerBadgeTopAnbieter),
    tooltip: params.t(I18N_KEYS.homePublic.providerBadgeTopAnbieterTooltip),
  };

  return params.providers.map((provider) => {
    const mapped = mapPublicProviderToCard({
      t: params.t,
      provider,
      cityLabel:
        (provider as { cityId?: string }).cityId
          ? params.cityLabelById.get((provider as { cityId?: string }).cityId ?? '') ?? ''
          : '',
      profileHref: `/providers/${provider.id}`,
      reviewsHref: `/providers/${provider.id}#reviews`,
      ctaLabel: params.t(I18N_KEYS.homePublic.topProvider1Cta),
      status: 'online',
    });

    const secondary = mapped.badges.find((badge) => badge.type !== 'top') ?? null;

    return {
      ...mapped,
      badges: secondary ? [topBadge, secondary] : [topBadge],
      reviewPreview: params.t(I18N_KEYS.homePublic.providerReviewPreviewDefault),
    };
  });
}
