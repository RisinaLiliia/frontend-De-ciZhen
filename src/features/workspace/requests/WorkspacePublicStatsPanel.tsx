'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { RequestsStatsPanel } from '@/components/requests/RequestsStatsPanel';
import { getPlatformActivity } from '@/lib/api/analytics';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspacePublicStatsPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  platformRequestsTotal: number;
};

export function WorkspacePublicStatsPanel({
  t,
  locale,
  platformRequestsTotal,
}: WorkspacePublicStatsPanelProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['workspace-public-platform-activity', '30d'],
    queryFn: () => getPlatformActivity('30d'),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const points = data?.data ?? [];
  const formatNumber = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US'),
    [locale],
  );

  const chartPoints = React.useMemo(() => {
    const dtf = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: 'short',
    });
    return points.slice(-6).map((point) => {
      const ts = new Date(point.timestamp);
      return {
        label: Number.isFinite(ts.getTime()) ? dtf.format(ts) : point.timestamp.slice(0, 10),
        bars: point.requests,
        line: point.offers,
      };
    });
  }, [locale, points]);

  const totals = React.useMemo(() => {
    const requests30d = points.reduce((sum, point) => sum + point.requests, 0);
    const offers30d = points.reduce((sum, point) => sum + point.offers, 0);
    const latest = points[points.length - 1] ?? null;
    return {
      requests30d,
      offers30d,
      latestRequests: latest?.requests ?? 0,
      latestOffers: latest?.offers ?? 0,
    };
  }, [points]);

  const offerConversion = totals.requests30d > 0
    ? Math.round((totals.offers30d / totals.requests30d) * 100)
    : 0;

  const hasData = platformRequestsTotal > 0 || totals.requests30d > 0 || totals.offers30d > 0;
  const providersLabel = t(I18N_KEYS.homePublic.exploreAllProviders);
  const ordersLabel = t(I18N_KEYS.homePublic.exploreAllOrders);

  const providerPayload = React.useMemo<React.ComponentProps<typeof RequestsStatsPanel>['provider']>(
    () => ({
      kpis: [],
      showKpis: false,
      hasData,
      chartTitle: t(I18N_KEYS.homePublic.activityTitle),
      chartPoints,
      secondary: {
        leftLabel: t(I18N_KEYS.requestsPage.statsLabelTotal),
        leftValue: formatNumber.format(platformRequestsTotal),
        centerLabel: t(I18N_KEYS.homePublic.activityRequests),
        centerValue: formatNumber.format(totals.requests30d),
        rightLabel: t(I18N_KEYS.homePublic.activityOffers),
        rightValue: formatNumber.format(totals.offers30d),
        progressLabel: t(I18N_KEYS.requestsPage.statsLabelCompletionRate),
        progressValue: offerConversion,
        responseLabel: t(I18N_KEYS.homePublic.activityRange30d),
        responseValue: formatNumber.format(totals.latestRequests),
      },
      showHint: false,
      hint: {
        text: t(I18N_KEYS.homePublic.activitySubtitle),
        ctaLabel: t(I18N_KEYS.homePublic.exploreAllOrders),
        ctaHref: '/workspace?section=requests',
      },
      emptyTitle: t(I18N_KEYS.requestsPage.statsProviderEmptyTitle),
      emptyCtaLabel: t(I18N_KEYS.homePublic.exploreAllOrders),
      emptyCtaHref: '/workspace?section=requests',
    }),
    [
      chartPoints,
      formatNumber,
      hasData,
      offerConversion,
      platformRequestsTotal,
      t,
      totals.latestRequests,
      totals.offers30d,
      totals.requests30d,
    ],
  );

  const clientPayload = React.useMemo<React.ComponentProps<typeof RequestsStatsPanel>['client']>(
    () => ({
      kpis: [
        {
          key: 'platform-total',
          label: t(I18N_KEYS.requestsPage.statsLabelTotal),
          value: formatNumber.format(platformRequestsTotal),
        },
        {
          key: 'requests-30d',
          label: t(I18N_KEYS.homePublic.activityRequests),
          value: formatNumber.format(totals.requests30d),
        },
        {
          key: 'offers-30d',
          label: t(I18N_KEYS.homePublic.activityOffers),
          value: formatNumber.format(totals.offers30d),
        },
        {
          key: 'requests-latest',
          label: t(I18N_KEYS.requestsPage.statsLabelOpen),
          value: formatNumber.format(totals.latestRequests),
        },
      ],
      hasData,
      chartTitle: t(I18N_KEYS.homePublic.activityTitle),
      chartPoints: chartPoints.map((point) => ({ ...point, bars: point.line, line: point.bars })),
      secondary: {
        leftLabel: t(I18N_KEYS.requestsPage.statsLabelTotal),
        leftValue: formatNumber.format(platformRequestsTotal),
        centerLabel: t(I18N_KEYS.requestsPage.statsLabelOpen),
        centerValue: formatNumber.format(totals.latestRequests),
        rightLabel: t(I18N_KEYS.requestsPage.statsLabelCompletedJobs),
        rightValue: formatNumber.format(totals.latestOffers),
        progressLabel: t(I18N_KEYS.requestsPage.statsLabelCompletionRate),
        progressValue: offerConversion,
        responseLabel: t(I18N_KEYS.homePublic.activityRange30d),
        responseValue: formatNumber.format(totals.offers30d),
      },
      showHint: false,
      hint: {
        text: t(I18N_KEYS.homePublic.activitySubtitle),
        ctaLabel: t(I18N_KEYS.homePublic.exploreAllProviders),
        ctaHref: '/workspace?section=providers',
      },
      emptyTitle: t(I18N_KEYS.requestsPage.statsClientEmptyTitle),
      emptyCtaLabel: t(I18N_KEYS.homePublic.exploreAllProviders),
      emptyCtaHref: '/workspace?section=providers',
    }),
    [
      chartPoints,
      formatNumber,
      hasData,
      offerConversion,
      platformRequestsTotal,
      t,
      totals.latestOffers,
      totals.latestRequests,
      totals.offers30d,
      totals.requests30d,
    ],
  );

  return (
    <RequestsStatsPanel
      title={providersLabel}
      titleByTab={{
        provider: providersLabel,
        client: ordersLabel,
      }}
      tabsLabel={{
        provider: providersLabel,
        client: ordersLabel,
      }}
      defaultTab="provider"
      preferredTab="provider"
      storageKey="dc_workspace_public_intro_stats_tab"
      loading={isLoading}
      error={isError}
      errorLabel={t(I18N_KEYS.requestsPage.statsLoadError)}
      provider={providerPayload}
      client={clientPayload}
    />
  );
}
