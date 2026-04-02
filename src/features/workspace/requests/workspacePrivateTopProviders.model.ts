'use client';

import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Translator = (key: I18nKey) => string;

const WORKSPACE_TOP_PROVIDERS_LIMIT = 2;

export function rankWorkspaceTopProviders(providers: ProviderPublicDto[]) {
  return [...providers].sort((a, b) => b.ratingAvg - a.ratingAvg);
}

export function buildWorkspaceTopProviderCard(params: {
  t: Translator;
  locale: Locale;
  provider: ProviderPublicDto;
}): TopProviderItem {
  const { t, locale, provider } = params;
  return mapPublicProviderToCard({
    t,
    locale,
    provider,
    roleLabel: '',
    profileHref: `/providers/${provider.id}`,
    reviewsHref: `/providers/${provider.id}#reviews`,
    ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
    status: 'online',
  });
}

export function buildWorkspacePrivateTopProviders(params: {
  t: Translator;
  locale: Locale;
  providers: ProviderPublicDto[];
}) {
  return rankWorkspaceTopProviders(params.providers)
    .slice(0, WORKSPACE_TOP_PROVIDERS_LIMIT)
    .map((provider) =>
      buildWorkspaceTopProviderCard({
        t: params.t,
        locale: params.locale,
        provider,
      }),
    );
}
