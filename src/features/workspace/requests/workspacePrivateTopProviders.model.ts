'use client';

import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type Translator = (key: I18nKey) => string;

const WORKSPACE_TOP_PROVIDERS_LIMIT = 2;

export function rankWorkspaceTopProviders(providers: ProviderPublicDto[]) {
  return [...providers].sort((a, b) => b.ratingAvg - a.ratingAvg);
}

export function buildWorkspaceTopProviderCard(params: {
  t: Translator;
  provider: ProviderPublicDto;
}): TopProviderItem {
  const { t, provider } = params;
  return mapPublicProviderToCard({
    t,
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
  providers: ProviderPublicDto[];
}) {
  return rankWorkspaceTopProviders(params.providers)
    .slice(0, WORKSPACE_TOP_PROVIDERS_LIMIT)
    .map((provider) =>
      buildWorkspaceTopProviderCard({
        t: params.t,
        provider,
      }),
    );
}
