/* src/components/home/HomeTopProvidersPanel.tsx */
import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import {
  buildHomeCityLabelById,
  buildHomeFavoriteProviderIds,
  buildHomeTopProviderCards,
  buildHomeTopProvidersById,
  buildHomeTopProvidersNextPath,
  rankHomeTopProviders,
} from '@/components/home/homeTopProvidersPanel.model';
import { listPublicProviders } from '@/lib/api/providers';
import {
  buildProviderFavoriteLookup,
  listFavorites,
} from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useProviderFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { useCities } from '@/features/catalog/queries';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type HomeTopProvidersPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  limit?: number;
};

export function HomeTopProvidersPanel({ t, locale, limit = 5 }: HomeTopProvidersPanelProps) {
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const { data: providers = [] } = useQuery({
    queryKey: ['providers-public-top'],
    queryFn: () => listPublicProviders(),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), [], [401, 403]),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const sortedProviders = React.useMemo(
    () => rankHomeTopProviders(providers, limit),
    [limit, providers],
  );
  const providerCityIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          sortedProviders
            .map((provider) => provider.cityId?.trim() ?? '')
            .filter((cityId) => cityId.length > 0),
        ),
      ),
    [sortedProviders],
  );
  const providerById = React.useMemo(
    () => buildHomeTopProvidersById(sortedProviders),
    [sortedProviders],
  );
  const { data: cities = [] } = useCities('DE', {
    ids: providerCityIds,
    enabled: providerCityIds.length > 0,
    limit: providerCityIds.length || 1,
  });
  const favoriteProviderLookup = React.useMemo(
    () => buildProviderFavoriteLookup(favoriteProviders),
    [favoriteProviders],
  );
  const favoriteProviderIds = React.useMemo(
    () =>
      buildHomeFavoriteProviderIds({
        providers: sortedProviders,
        favoriteProviderLookup,
      }),
    [favoriteProviderLookup, sortedProviders],
  );
  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString() ?? '';
    return buildHomeTopProvidersNextPath(pathname, qs);
  }, [pathname, searchParams]);
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

  const cityLabelById = React.useMemo(
    () => buildHomeCityLabelById({ cities, locale }),
    [cities, locale],
  );

  const mappedProviders = React.useMemo(
    () =>
      buildHomeTopProviderCards({
        t,
        locale,
        providers: sortedProviders,
        cityLabelById,
      }),
    [cityLabelById, locale, sortedProviders, t],
  );
  return (
    <TopProvidersPanel
      title={t(I18N_KEYS.homePublic.topProviders)}
      subtitle={t(I18N_KEYS.homePublic.topProvidersSubtitle)}
      ctaLabel={t(I18N_KEYS.homePublic.topProvidersCta)}
      ctaHref="/workspace?section=providers"
      providers={mappedProviders}
      favoriteProviderIds={favoriteProviderIds}
      pendingFavoriteProviderIds={pendingFavoriteProviderIds}
      onToggleFavorite={(providerId) => {
        void toggleProviderFavorite(providerId);
      }}
    />
  );
}
