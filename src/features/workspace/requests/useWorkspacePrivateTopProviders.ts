'use client';

import * as React from 'react';

import type { TopProviderItem } from '@/components/providers/TopProvidersPanel';
import { mapPublicProviderToCard } from '@/components/providers/providerCardMapper';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type Translator = (key: I18nKey) => string;

type Params = {
  t: Translator;
  providers: ProviderPublicDto[];
};

export function useWorkspacePrivateTopProviders({ t, providers }: Params) {
  return React.useMemo<TopProviderItem[]>(() => {
    const sorted = [...providers].sort((a, b) => b.ratingAvg - a.ratingAvg);
    return sorted.slice(0, 2).map((provider) =>
      mapPublicProviderToCard({
        t,
        provider,
        roleLabel: '',
        profileHref: `/providers/${provider.id}`,
        reviewsHref: `/providers/${provider.id}#reviews`,
        ctaLabel: t(I18N_KEYS.homePublic.topProvider1Cta),
        status: 'online',
      }),
    );
  }, [providers, t]);
}
