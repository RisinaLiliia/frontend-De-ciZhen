'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import { TopProvidersPanel } from '@/components/providers/TopProvidersPanel';
import { useCities } from '@/features/catalog/queries';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useProviderFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { buildProviderFavoriteLookup, listFavorites } from '@/lib/api/favorites';
import { listPublicProviders } from '@/lib/api/providers';
import { getWorkspaceProviders } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { ALL_OPTION_KEY, resolveWorkspaceRequestsPeriod } from '@/features/workspace/requests';
import { WorkspaceSectionAside } from '@/features/workspace/requests/components/WorkspaceSectionAside';
import { WorkspaceSectionDecisionPanel } from '@/features/workspace/requests/components/WorkspaceSectionDecisionPanel';
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

function normalizeFilter(value: string | null) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized === ALL_OPTION_KEY) {
    return undefined;
  }
  return normalized;
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
  const cityId = normalizeFilter(searchParams.get('cityId'));
  const categoryKey = normalizeFilter(searchParams.get('categoryKey'));
  const subcategoryKey = normalizeFilter(searchParams.get('subcategoryKey'));
  const viewerModeParam = searchParams.get('viewerMode');
  const viewerMode = viewerModeParam === 'customer' || viewerModeParam === 'provider'
    ? viewerModeParam
    : undefined;
  const period = resolveWorkspaceRequestsPeriod(searchParams.get('period') ?? searchParams.get('range'));

  const {
    data: contractData,
    isLoading: isContractLoading,
    isError: isContractError,
  } = useQuery({
    queryKey: ['workspace-providers-overview', cityId ?? '', categoryKey ?? '', subcategoryKey ?? '', period, viewerMode ?? ''],
    queryFn: () =>
      withStatusFallback(
        () => getWorkspaceProviders({
          cityId,
          categoryKey,
          subcategoryKey,
          period,
          viewerMode,
        }),
        null,
        [401, 403, 404],
      ),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const shouldUseLegacyFallback = isContractError || (!isContractLoading && !contractData);

  const {
    data: providers = [],
    isLoading: isLegacyProvidersLoading,
  } = useQuery({
    queryKey: ['providers-public-top', cityId ?? '', subcategoryKey ?? ''],
    enabled: shouldUseLegacyFallback,
    queryFn: () => listPublicProviders({ cityId, serviceKey: subcategoryKey }),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: shouldUseLegacyFallback && isAuthed,
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
            .filter((value) => value.length > 0),
        ),
      ),
    [topProviders],
  );
  const { data: cities = [] } = useCities('DE', {
    ids: providerCityIds,
    enabled: shouldUseLegacyFallback && providerCityIds.length > 0,
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
  const legacySummaryItems = React.useMemo(() => {
    const availableCount = providers.filter((provider) => provider.availabilityState === 'open').length;
    const topRatedCount = providers.filter((provider) => provider.ratingAvg >= 4.8 && provider.ratingCount >= 10).length;
    const trustedCount = providers.filter((provider) => provider.completedJobs >= 10 || provider.ratingCount >= 15).length;

    return [
      {
        key: 'all',
        label: locale === 'de' ? 'Alle' : 'All',
        value: providers.length,
        helper: locale === 'de' ? 'Gesamter Anbieterpool' : 'Full provider pool',
        tone: 'all' as const,
      },
      {
        key: 'available',
        label: locale === 'de' ? 'Verfügbar' : 'Available',
        value: availableCount,
        helper: locale === 'de' ? 'Direkt einsatzbereit' : 'Ready for new work',
        tone: 'attention' as const,
      },
      {
        key: 'top-rated',
        label: locale === 'de' ? 'Top bewertet' : 'Top rated',
        value: topRatedCount,
        helper: locale === 'de' ? 'Starke Bewertungen' : 'Strong review quality',
        tone: 'execution' as const,
      },
      {
        key: 'trusted',
        label: locale === 'de' ? 'Mit Referenzen' : 'With proof',
        value: trustedCount,
        helper: locale === 'de' ? 'Jobs und Reviews sichtbar' : 'Jobs and reviews visible',
        tone: 'completed' as const,
      },
    ];
  }, [locale, providers]);

  const summaryItems = React.useMemo(
    () =>
      contractData?.summary.items.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.value,
        helper: item.helper,
        tone: item.tone,
      })) ?? null,
    [contractData],
  );
  const asideSummaryItems = contractData ? summaryItems : legacySummaryItems;
  const asideIsLoading = contractData ? isContractLoading : isLegacyProvidersLoading;

  return (
    <WorkspaceSectionAside
      locale={locale}
      summaryItems={asideSummaryItems}
      isLoading={asideIsLoading}
      panel={contractData ? {
        ...contractData.decisionPanel,
        queue: contractData.decisionPanel.queue.map((item) => ({
          id: item.providerId,
          title: item.title,
          actionLabel: item.actionLabel,
          actionPriorityLevel: item.actionPriorityLevel,
          actionReason: item.actionReason,
          href: item.href,
        })),
      } : null}
    >
      {contractData ? (
        null
      ) : (
        <>
          <WorkspaceSectionDecisionPanel
            locale={locale}
            panel={{
              eyebrow: locale === 'de' ? 'Decision Panel' : 'Decision panel',
              totalNeedsAction: mappedProviders.length,
              title: locale === 'de' ? 'Anbieter im Fokus' : 'Providers in focus',
              text: locale === 'de'
                ? 'Fallback auf den bestehenden Anbieter-Feed, bis der neue Workspace-Contract verfügbar ist.'
                : 'Fallback to the existing provider feed until the new workspace contract is available.',
              primaryAction: {
                label: locale === 'de' ? 'Anbieter prüfen' : 'Review providers',
                href: '/workspace?section=providers',
              },
              queueTitle: locale === 'de' ? 'Action Queue' : 'Action queue',
              queue: mappedProviders.slice(0, 3).map((provider) => ({
                id: provider.id,
                title: provider.name,
                actionLabel: provider.servicePreview?.slice(0, 2).join(' · ') || provider.role,
                actionPriorityLevel: 'medium',
                actionReason: provider.aboutPreview ?? provider.reviewPreview ?? null,
                href: provider.profileHref,
              })),
              emptyText: locale === 'de'
                ? 'Derzeit sind keine priorisierten Anbieter verfügbar.'
                : 'There are no prioritized providers right now.',
              overviewEyebrow: locale === 'de' ? 'Marktlage' : 'Market snapshot',
              overview: [
                {
                  key: 'available',
                  label: locale === 'de' ? 'Verfügbar' : 'Available',
                  value: providers.filter((provider) => provider.availabilityState === 'open').length,
                },
                {
                  key: 'topRated',
                  label: locale === 'de' ? 'Top bewertet' : 'Top rated',
                  value: providers.filter((provider) => provider.ratingAvg >= 4.8 && provider.ratingCount >= 10).length,
                },
                {
                  key: 'trusted',
                  label: locale === 'de' ? 'Mit Referenzen' : 'With proof',
                  value: providers.filter((provider) => provider.completedJobs >= 10 || provider.ratingCount >= 15).length,
                },
              ],
            }}
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
        </>
      )}
    </WorkspaceSectionAside>
  );
}
