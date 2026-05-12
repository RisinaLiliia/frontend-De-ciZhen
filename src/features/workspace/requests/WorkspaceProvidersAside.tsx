'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import { useCities } from '@/features/catalog/queries';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useProviderFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { buildProviderFavoriteLookup, listFavorites } from '@/lib/api/favorites';
import { listPublicProviders } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceSummaryGrid } from '@/features/workspace/requests/components/WorkspaceSummaryGrid';
import {
  buildHomeCityLabelById,
  buildHomeFavoriteProviderIds,
  buildHomeTopProviderCards,
  buildHomeTopProvidersById,
  buildHomeTopProvidersNextPath,
  rankHomeTopProviders,
} from '@/components/home/homeTopProvidersPanel.model';

type Props = {
  t: (key: I18nKey) => string;
  locale: Locale;
};

function formatCompact(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(value);
}

export function WorkspaceProvidersAside({
  t,
  locale,
}: Props) {
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const {
    data: providers = [],
    isLoading,
  } = useQuery({
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

  const providerById = React.useMemo(
    () => buildHomeTopProvidersById(providers),
    [providers],
  );
  const favoriteProviderLookup = React.useMemo(
    () => buildProviderFavoriteLookup(favoriteProviders),
    [favoriteProviders],
  );
  const favoriteProviderIds = React.useMemo(
    () => buildHomeFavoriteProviderIds({ providers, favoriteProviderLookup }),
    [favoriteProviderLookup, providers],
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

  const topProviders = React.useMemo(
    () => rankHomeTopProviders(providers, 3),
    [providers],
  );
  const providerCityIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          topProviders
            .map((provider) => provider.cityId?.trim() ?? '')
            .filter((cityId) => cityId.length > 0),
        ),
      ),
    [topProviders],
  );
  const { data: cities = [] } = useCities('DE', {
    ids: providerCityIds,
    enabled: providerCityIds.length > 0,
    limit: providerCityIds.length || 1,
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
        providers: topProviders,
        cityLabelById,
      }),
    [cityLabelById, locale, t, topProviders],
  );

  const availableCount = React.useMemo(
    () => providers.filter((provider) => provider.availabilityState === 'open').length,
    [providers],
  );
  const topRatedCount = React.useMemo(
    () => providers.filter((provider) => provider.ratingAvg >= 4.8 && provider.ratingCount >= 10).length,
    [providers],
  );
  const trustedCount = React.useMemo(
    () => providers.filter((provider) => provider.completedJobs >= 10 || provider.ratingCount >= 15).length,
    [providers],
  );

  const summaryItems = React.useMemo(
    () => [
      {
        key: 'all',
        label: locale === 'de' ? 'Alle' : 'All',
        value: formatCompact(providers.length, locale),
        helper: locale === 'de' ? 'Gesamter Anbieterpool' : 'Full provider pool',
        tone: 'all' as const,
      },
      {
        key: 'available',
        label: locale === 'de' ? 'Verfügbar' : 'Available',
        value: formatCompact(availableCount, locale),
        helper: locale === 'de' ? 'Direkt einsatzbereit' : 'Ready for new work',
        tone: 'attention' as const,
      },
      {
        key: 'top-rated',
        label: locale === 'de' ? 'Top bewertet' : 'Top rated',
        value: formatCompact(topRatedCount, locale),
        helper: locale === 'de' ? 'Starke Bewertungen' : 'Strong review quality',
        tone: 'execution' as const,
      },
      {
        key: 'trusted',
        label: locale === 'de' ? 'Mit Referenzen' : 'With proof',
        value: formatCompact(trustedCount, locale),
        helper: locale === 'de' ? 'Jobs und Reviews sichtbar' : 'Jobs and reviews visible',
        tone: 'completed' as const,
      },
    ],
    [availableCount, locale, providers.length, topRatedCount, trustedCount],
  );

  return (
    <aside className="stack-md hide-below-desktop">
      <WorkspaceSummaryGrid
        items={summaryItems}
        isLoading={isLoading}
        className="my-requests-summary--rail"
      />
      <TopProvidersPanel
        title={locale === 'de' ? 'Provider Panel' : 'Provider panel'}
        subtitle={
          locale === 'de'
            ? 'Bewährte und aktuell verfügbare Anbieter im aktuellen Kontext.'
            : 'Trusted and currently available providers in the current context.'
        }
        ctaLabel={locale === 'de' ? 'Alle Anbieter öffnen' : 'Open all providers'}
        ctaHref="/workspace?section=providers"
        providers={mappedProviders}
        className="workspace-providers-aside__panel"
        favoriteProviderIds={favoriteProviderIds}
        pendingFavoriteProviderIds={pendingFavoriteProviderIds}
        onToggleFavorite={(providerId) => {
          void toggleProviderFavorite(providerId);
        }}
      />
    </aside>
  );
}
