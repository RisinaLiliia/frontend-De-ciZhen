'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { KpiCardTrend } from '@/components/ui/KpiCard';

import type {
  WorkspaceStatisticsActivityMetricsDto,
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsGrowthCardDto,
  WorkspaceStatisticsInsightDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import {
  getWorkspacePublicOverview,
  getWorkspaceStatistics,
} from '@/lib/api/workspace';
import { hasAnyStatus, withStatusFallback } from '@/lib/api/withStatusFallback';
import type { Locale } from '@/lib/i18n/t';
import {
  getWorkspaceStatisticsCopy,
  resolveGrowthCard,
  resolveInsightText,
  type WorkspaceStatisticsCopy,
} from './workspaceStatistics.copy';
import {
  inferInsightType,
  mergeFullCityRanking,
  mergeInsightsByIdentity,
  selectInsightsForDisplay,
} from './statisticsInsights.utils';
import {
  buildSupplementalInsights,
  formatDateLabel,
  formatDateTimeLabel,
  formatInsightEvidence,
  formatMinutes,
  formatPercent,
  formatReviewCountHint,
  normalizeLegacyRange,
  resolveCitySignal,
  resolveMarketBalanceRatio,
  toActivityTotals,
  toFallbackActivityMetrics,
  toHint,
  toTrend,
} from './statisticsModel.mappers';
import { getWorkspaceStatisticsFallback } from './statisticsModel.fallbackApi';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';

const WORKSPACE_STATS_BFF_FLAG = process.env.NEXT_PUBLIC_WORKSPACE_STATS_BFF;
const FORCE_DISABLE_STATISTICS_BFF = WORKSPACE_STATS_BFF_FLAG === 'false';
const FORCE_ENABLE_STATISTICS_BFF = WORKSPACE_STATS_BFF_FLAG === 'true';

export type WorkspaceStatisticsKpiView = {
  key: string;
  label: string;
  value: string;
  hint: string;
  tone: 'positive' | 'neutral';
  trend: KpiCardTrend;
};

export type WorkspaceStatisticsCityRowView = {
  key: string;
  cityId: string | null;
  name: string;
  count: number;
  auftragSuchenCount: number | null;
  anbieterSuchenCount: number | null;
  marketBalanceRatio: number | null;
  signal: 'high' | 'medium' | 'low' | 'none';
};

export type WorkspaceStatisticsFunnelItemView = {
  key: string;
  label: string;
  count: number;
  value: string;
  widthPercent: number;
  rateFromPreviousPercent: number | null;
  railLabel?: string;
  railValue?: string;
  isCurrency?: boolean;
};

export type WorkspaceStatisticsInsightView = {
  key: string;
  level: WorkspaceStatisticsInsightDto['level'];
  kind: 'demand' | 'opportunity' | 'performance' | 'growth' | 'risk' | 'promotion' | 'other';
  code: string;
  priority?: WorkspaceStatisticsInsightDto['priority'];
  score?: number;
  metrics?: Array<{ key: string; value: string | number }>;
  context?: string | null;
  title?: string;
  text: string;
  evidence?: string;
};

export type WorkspaceStatisticsGrowthCardView = {
  key: string;
  title: string;
  body: string;
  benefit: string;
  tone: 'primary' | 'default';
  badge?: string;
  recommendedFor?: string;
  href: string;
};

export type WorkspaceStatisticsActivitySignalView = {
  key: string;
  label: string;
  value: string;
  hint: string;
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsOpportunityRadarItemView = {
  rank: 1 | 2 | 3;
  cityId: string | null;
  city: string;
  categoryKey: string | null;
  category: string;
  demand: number;
  providers: number | null;
  marketBalanceRatio: number | null;
  score: number;
  demandScore: number;
  competitionScore: number;
  growthScore: number;
  activityScore: number;
  tone: 'very-high' | 'high' | 'balanced' | 'supply-heavy';
  href: string;
};

export type WorkspaceStatisticsPriceIntelligenceView = {
  contextLabel: string | null;
  recommendedRangeLabel: string | null;
  marketAverageLabel: string | null;
};

export type WorkspaceStatisticsModel = {
  copy: WorkspaceStatisticsCopy;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  isLoading: boolean;
  isError: boolean;
  mode: 'platform' | 'personalized';
  modeLabel: string;
  kpis: WorkspaceStatisticsKpiView[];
  activityPoints: Array<{ label: string; requests: number; offers: number }>;
  activityMeta: {
    peak: string;
    bestWindow: string;
    updatedAt: string;
  };
  activitySignals: WorkspaceStatisticsActivitySignalView[];
  demandRows: WorkspaceStatisticsCategoryDemandDto[];
  cityRows: WorkspaceStatisticsCityRowView[];
  citySignalCoverage: {
    mode: 'full' | 'partial' | 'none';
    label: string;
    detail: string;
  };
  opportunityRadar: WorkspaceStatisticsOpportunityRadarItemView[];
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceView;
  funnel: WorkspaceStatisticsFunnelItemView[];
  funnelPeriodLabel: string;
  funnelSummary: string;
  hasFunnelData: boolean;
  conversion: string;
  insights: WorkspaceStatisticsInsightView[];
  growthCards: WorkspaceStatisticsGrowthCardView[];
  onExport: () => void;
};

function exportCsv(rows: string[][], filename: string) {
  const body = rows
    .map((row) =>
      row
        .map((cell) => {
          const safe = String(cell ?? '');
          if (!safe.includes(',') && !safe.includes('"') && !safe.includes('\n')) return safe;
          return `"${safe.replaceAll('"', '""')}"`;
        })
        .join(','),
    )
    .join('\n');

  const blob = new Blob([`${body}\n`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function useWorkspaceStatisticsModel({
  locale,
}: {
  locale: Locale;
}): WorkspaceStatisticsModel {
  const [range, setRange] = React.useState<WorkspaceStatisticsRange>('30d');
  const bffAvailabilityRef = React.useRef<boolean | null>(FORCE_DISABLE_STATISTICS_BFF ? false : null);
  const copy = React.useMemo(() => getWorkspaceStatisticsCopy(locale), [locale]);
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const formatNumber = React.useMemo(() => new Intl.NumberFormat(localeTag), [localeTag]);
  const formatCurrency = React.useMemo(
    () =>
      new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [localeTag],
  );

  const query = useQuery<WorkspaceStatisticsOverviewSourceDto>({
    queryKey: ['workspace-statistics-overview', range],
    queryFn: async () => {
      if (bffAvailabilityRef.current === false) {
        return getWorkspaceStatisticsFallback(range);
      }

      try {
        const legacyRange = normalizeLegacyRange(range);
        const [payload, fullPublicOverview] = await Promise.all([
          getWorkspaceStatistics(range),
          withStatusFallback(
            () =>
              getWorkspacePublicOverview({
                sort: 'date_desc',
                page: 1,
                limit: 1,
                activityRange: legacyRange,
                cityActivityLimit: 5000,
              }),
            null,
            [400, 404],
          ),
        ]);

        const mergedCities = mergeFullCityRanking({
          statsCities: payload.demand.cities,
          publicCities: fullPublicOverview?.cityActivity.items ?? [],
        });

        bffAvailabilityRef.current = true;
        return {
          ...payload,
          summary: {
            ...payload.summary,
            totalActiveCities: Math.max(
              payload.summary.totalActiveCities,
              fullPublicOverview?.cityActivity.totalActiveCities ?? 0,
            ),
          },
          demand: {
            ...payload.demand,
            cities: mergedCities,
          },
          __source: 'bff',
        };
      } catch (error) {
        if (hasAnyStatus(error, [404, 405, 501])) {
          if (!FORCE_ENABLE_STATISTICS_BFF) {
            bffAvailabilityRef.current = false;
          }
          return getWorkspaceStatisticsFallback(range);
        }
        if (hasAnyStatus(error, [400, 401, 403])) {
          return getWorkspaceStatisticsFallback(range);
        }
        if (FORCE_DISABLE_STATISTICS_BFF) {
          return getWorkspaceStatisticsFallback(range);
        }
        if (!hasAnyStatus(error, [400, 401, 403, 404, 405, 501])) {
          throw error;
        }
        return getWorkspaceStatisticsFallback(range);
      }
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  const data = query.data;
  const mode = data?.mode ?? 'platform';

  const activityPoints = React.useMemo(
    () =>
      (data?.activity.points ?? []).slice(-12).map((point) => ({
        label: formatDateLabel(point.timestamp, range, locale),
        requests: point.requests,
        offers: point.offers,
      })),
    [data?.activity.points, locale, range],
  );

  const activityMetrics: WorkspaceStatisticsActivityMetricsDto = data?.activity.metrics ?? toFallbackActivityMetrics({
    totals: data?.activity.totals ?? toActivityTotals([]),
    completedJobs: data?.kpis.completedJobsTotal ?? 0,
  });

  const activitySignals = React.useMemo<WorkspaceStatisticsActivitySignalView[]>(() => {
    const responseValue = formatMinutes(activityMetrics.responseMedianMinutes, locale);
    const responseHint = responseValue === '—'
      ? copy.activityNoResponse
      : locale === 'de'
        ? 'Zeit bis zum ersten Angebot'
        : 'Time to first offer';
    const revenueHint = `${copy.activityGmvLabel}: ${formatCurrency.format(activityMetrics.gmvAmount)} · ${activityMetrics.takeRatePercent}% ${copy.activityTakeRateSuffix}`;

    return [
      {
        key: 'offer-rate',
        label: copy.activityOfferRateLabel,
        value: formatPercent(activityMetrics.offerRatePercent),
        hint: locale === 'de' ? 'Angebote pro Anfrage' : 'Offers per request',
        tone: activityMetrics.offerRatePercent >= 60 ? 'positive' : activityMetrics.offerRatePercent < 30 ? 'warning' : 'neutral',
      },
      {
        key: 'response-median',
        label: copy.activityResponseMedianLabel,
        value: responseValue,
        hint: responseHint,
        tone: typeof activityMetrics.responseMedianMinutes === 'number'
          ? activityMetrics.responseMedianMinutes <= 30
            ? 'positive'
            : activityMetrics.responseMedianMinutes > 90
              ? 'warning'
              : 'neutral'
          : 'neutral',
      },
      {
        key: 'unanswered',
        label: copy.activityUnansweredLabel,
        value: formatNumber.format(activityMetrics.unansweredRequests24h),
        hint: locale === 'de' ? 'Offene Nachfrage ohne Angebot' : 'Open demand without offers',
        tone: activityMetrics.unansweredRequests24h > 0 ? 'warning' : 'positive',
      },
      {
        key: 'cancellation',
        label: copy.activityCancellationLabel,
        value: formatPercent(activityMetrics.cancellationRatePercent),
        hint: locale === 'de' ? 'Stornos aus Abschlüssen + Stornos' : 'Cancels from completions + cancels',
        tone: activityMetrics.cancellationRatePercent <= 10 ? 'positive' : activityMetrics.cancellationRatePercent >= 25 ? 'warning' : 'neutral',
      },
      {
        key: 'completed',
        label: copy.activityCompletedLabel,
        value: formatNumber.format(activityMetrics.completedJobs),
        hint: locale === 'de' ? 'Gelöste Aufträge im Zeitraum' : 'Completed jobs in range',
        tone: activityMetrics.completedJobs > 0 ? 'positive' : 'neutral',
      },
      {
        key: 'revenue',
        label: copy.activityRevenueLabel,
        value: formatCurrency.format(activityMetrics.platformRevenueAmount),
        hint: revenueHint,
        tone: activityMetrics.platformRevenueAmount > 0 ? 'positive' : 'neutral',
      },
    ];
  }, [activityMetrics, copy, formatCurrency, formatNumber, locale]);

  const kpis = React.useMemo<WorkspaceStatisticsKpiView[]>(() => {
    if (!data) return [];
    const totals = data.activity.totals;
    const shared: WorkspaceStatisticsKpiView[] = [
      {
        key: 'requests-total',
        label: copy.requestsLabel,
        value: formatNumber.format(data.kpis.requestsTotal),
        hint: toHint(totals.latestRequests, totals.previousRequests, range, locale),
        tone: totals.latestRequests >= totals.previousRequests ? 'positive' : 'neutral',
        trend: toTrend(totals.latestRequests, totals.previousRequests),
      },
      {
        key: 'offers-total',
        label: copy.offersLabel,
        value: formatNumber.format(data.kpis.offersTotal),
        hint: toHint(totals.latestOffers, totals.previousOffers, range, locale),
        tone: totals.latestOffers >= totals.previousOffers ? 'positive' : 'neutral',
        trend: toTrend(totals.latestOffers, totals.previousOffers),
      },
      {
        key: 'completed-total',
        label: copy.stage4LabelPlatform,
        value: formatNumber.format(data.kpis.completedJobsTotal),
        hint: data.kpis.completedJobsTotal > 0
          ? locale === 'de'
            ? `Erfolgsquote ${formatPercent(data.kpis.successRate)}`
            : `Success rate ${formatPercent(data.kpis.successRate)}`
          : locale === 'de'
            ? 'Noch keine Abschlüsse'
            : 'No completed jobs yet',
        tone: data.kpis.completedJobsTotal > 0 && data.kpis.successRate >= 25 ? 'positive' : 'neutral',
        trend: data.kpis.completedJobsTotal > 0
          ? {
              direction: data.kpis.successRate >= 25 ? 'up' : 'down',
              percent: Math.round(data.kpis.successRate),
            }
          : { direction: 'flat', percent: 0 },
      },
      {
        key: 'active-providers',
        label: locale === 'de' ? 'Aktive Anbieter' : 'Active providers',
        value: formatNumber.format(data.summary.totalActiveProviders),
        hint: locale === 'de'
          ? `${formatNumber.format(data.summary.totalPublishedRequests)} aktive Aufträge`
          : `${formatNumber.format(data.summary.totalPublishedRequests)} active requests`,
        tone: 'neutral',
        trend: { direction: 'flat', percent: 0 },
      },
      {
        key: 'active-cities',
        label: locale === 'de' ? 'Aktive Städte' : 'Active cities',
        value: formatNumber.format(data.summary.totalActiveCities),
        hint: locale === 'de' ? 'mit Nachfrage' : 'with demand',
        tone: 'neutral',
        trend: { direction: 'flat', percent: 0 },
      },
      {
        key: 'rating-avg',
        label: locale === 'de' ? 'Durchschnittsbewertung' : 'Average rating',
        value:
          data.summary.platformRatingAvg > 0
            ? data.summary.platformRatingAvg.toFixed(1)
            : '—',
        hint: formatReviewCountHint(data.summary.platformRatingCount, locale, formatNumber),
        tone: data.summary.platformRatingAvg >= 4 ? 'positive' : 'neutral',
        trend: data.summary.platformRatingAvg > 0
          ? {
              direction: data.summary.platformRatingAvg >= 4 ? 'up' : 'down',
              percent: Math.round((data.summary.platformRatingAvg / 5) * 100),
            }
          : { direction: 'flat', percent: 0 },
      },
    ];

    if (mode === 'personalized') {
      const openRequests = data.kpis.openRequests ?? 0;
      const recentOffers7d = data.kpis.recentOffers7d ?? 0;
      const avgResponseMinutes = data.kpis.avgResponseMinutes;
      const isFastResponse = typeof avgResponseMinutes === 'number' && avgResponseMinutes <= 30;
      const acceptedOffers = data.profileFunnel.stage3;
      const sentOffers = data.profileFunnel.stage2;
      const completedJobs = data.kpis.completedJobsTotal;
      const profileCompleteness = data.kpis.profileCompleteness ?? 0;

      return [
        {
          key: 'open-requests',
          label: copy.stage1LabelPersonalized,
          value: formatNumber.format(openRequests),
          hint: openRequests > 0
            ? locale === 'de'
              ? `${formatNumber.format(data.kpis.requestsTotal)} insgesamt im Zeitraum`
              : `${formatNumber.format(data.kpis.requestsTotal)} total in selected range`
            : locale === 'de'
              ? 'Keine offenen Anfragen'
              : 'No open requests',
          tone: 'neutral',
          trend: { direction: 'flat', percent: 0 },
        },
        {
          key: 'recent-offers',
          label: copy.stage2LabelPersonalized,
          value: formatNumber.format(data.kpis.offersTotal),
          hint: recentOffers7d > 0
            ? locale === 'de'
              ? `${formatNumber.format(recentOffers7d)} in den letzten 7 Tagen`
              : `${formatNumber.format(recentOffers7d)} in the last 7 days`
            : locale === 'de'
              ? 'Noch keine Angebote in den letzten 7 Tagen'
              : 'No offers in the last 7 days',
          tone: recentOffers7d > 0 ? 'positive' : 'neutral',
          trend: recentOffers7d > 0
            ? { direction: 'up', percent: 100 }
            : { direction: 'flat', percent: 0 },
        },
        {
          key: 'completed-personal',
          label: copy.stage4LabelPersonalized,
          value: formatNumber.format(completedJobs),
          hint: completedJobs > 0
            ? locale === 'de'
              ? `Erfolgsquote ${formatPercent(data.kpis.successRate)}`
              : `Success rate ${formatPercent(data.kpis.successRate)}`
            : locale === 'de'
              ? 'Noch keine Abschlüsse'
              : 'No completed jobs yet',
          tone: completedJobs > 0 && data.kpis.successRate >= 30 ? 'positive' : 'neutral',
          trend: completedJobs > 0
            ? { direction: data.kpis.successRate >= 30 ? 'up' : 'down', percent: Math.round(data.kpis.successRate) }
            : { direction: 'flat', percent: 0 },
        },
        {
          key: 'response-time',
          label: locale === 'de' ? 'Antwortzeit' : 'Response time',
          value: formatMinutes(data.kpis.avgResponseMinutes, locale),
          hint: typeof avgResponseMinutes !== 'number'
            ? locale === 'de'
              ? 'Noch keine Antwortzeit-Daten'
              : 'No response-time data yet'
            : isFastResponse
              ? locale === 'de'
                ? 'Stark: unter 30 Min.'
                : 'Strong: under 30 min'
              : locale === 'de'
                ? 'Ziel: unter 30 Min.'
                : 'Target: under 30 min',
          tone: typeof avgResponseMinutes === 'number' && isFastResponse ? 'positive' : 'neutral',
          trend: typeof avgResponseMinutes === 'number'
            ? {
                direction: isFastResponse ? 'up' : 'down',
                percent: Math.max(0, 100 - Math.round(avgResponseMinutes)),
              }
            : { direction: 'flat', percent: 0 },
        },
        {
          key: 'success-rate',
          label: locale === 'de' ? 'Erfolgsquote' : 'Success rate',
          value: sentOffers > 0 ? formatPercent(data.kpis.successRate) : '—',
          hint: sentOffers > 0
            ? locale === 'de'
              ? `${formatNumber.format(acceptedOffers)} akzeptierte Angebote`
              : `${formatNumber.format(acceptedOffers)} accepted offers`
            : locale === 'de'
              ? 'Noch keine gesendeten Angebote'
              : 'No sent offers yet',
          tone: sentOffers > 0 && data.kpis.successRate >= 30 ? 'positive' : 'neutral',
          trend: sentOffers > 0
            ? { direction: data.kpis.successRate >= 30 ? 'up' : 'down', percent: Math.round(data.kpis.successRate) }
            : { direction: 'flat', percent: 0 },
        },
        {
          key: 'profile-completeness',
          label: locale === 'de' ? 'Profil Vollständigkeit' : 'Profile completeness',
          value: formatPercent(profileCompleteness),
          hint: profileCompleteness >= 80
            ? locale === 'de'
              ? 'Starkes Profil'
              : 'Strong profile'
            : locale === 'de'
              ? 'Profil ausbauen für mehr Sichtbarkeit'
              : 'Improve profile for better visibility',
          tone: profileCompleteness >= 80 ? 'positive' : 'neutral',
          trend: profileCompleteness > 0
            ? { direction: profileCompleteness >= 80 ? 'up' : 'down', percent: Math.round(profileCompleteness) }
            : { direction: 'flat', percent: 0 },
        },
      ];
    }

    return shared;
  }, [copy, data, formatNumber, locale, mode, range]);

  const cityRows = React.useMemo<WorkspaceStatisticsCityRowView[]>(() => {
    const source = data?.demand.cities ?? [];
    if (source.length === 0) return [];

    const hasSearchMetrics =
      data?.__source === 'bff' &&
      source.some(
        (item) =>
          typeof item.auftragSuchenCount === 'number' &&
          Number.isFinite(item.auftragSuchenCount) &&
          typeof item.anbieterSuchenCount === 'number' &&
          Number.isFinite(item.anbieterSuchenCount),
      );

    return source.map((item) => {
      const requestCount = Math.max(0, Math.round(item.requestCount ?? 0));
      const rawAuftragSuchenCount =
        typeof item.auftragSuchenCount === 'number' && Number.isFinite(item.auftragSuchenCount)
          ? Math.max(0, Math.round(item.auftragSuchenCount))
          : null;
      const rawAnbieterSuchenCount =
        typeof item.anbieterSuchenCount === 'number' && Number.isFinite(item.anbieterSuchenCount)
          ? Math.max(0, Math.round(item.anbieterSuchenCount))
          : null;

      if (!hasSearchMetrics || rawAuftragSuchenCount === null || rawAnbieterSuchenCount === null) {
        return {
          key: item.citySlug,
          cityId: item.cityId ?? null,
          name: item.cityName,
          count: requestCount,
          auftragSuchenCount: null,
          anbieterSuchenCount: null,
          marketBalanceRatio: null,
          signal: 'none',
        };
      }

      const auftragSuchenCount = rawAuftragSuchenCount;
      const anbieterSuchenCount = rawAnbieterSuchenCount;
      const marketBalanceRatio = resolveMarketBalanceRatio({
        requestCount,
        auftragSuchenCount,
        anbieterSuchenCount,
      });
      const signal = resolveCitySignal({
        requestCount,
        auftragSuchenCount,
        anbieterSuchenCount,
      });

      return {
        key: item.citySlug,
        cityId: item.cityId ?? null,
        name: item.cityName,
        count: requestCount,
        auftragSuchenCount,
        anbieterSuchenCount,
        marketBalanceRatio,
        signal,
      };
    });
  }, [data?.__source, data?.demand.cities]);

  const demandRows = React.useMemo<WorkspaceStatisticsCategoryDemandDto[]>(() => {
    const rows = (data?.demand.categories ?? []).slice();
    rows.sort(
      (a, b) =>
        (b.sharePercent - a.sharePercent) ||
        (b.requestCount - a.requestCount) ||
        a.categoryName.localeCompare(b.categoryName, locale === 'de' ? 'de-DE' : 'en-US'),
    );
    return rows;
  }, [data?.demand.categories, locale]);

  const opportunityRadar = React.useMemo<WorkspaceStatisticsOpportunityRadarItemView[]>(() => {
    if (cityRows.length === 0) return [];

    const categoryLeaders = demandRows.slice(0, 3);
    const fallbackCategory = locale === 'de' ? 'Generalistisch' : 'General';
    const growthIndex = Math.max(0, Math.min(1, activityMetrics.offerRatePercent / 100));
    const responseSpeedIndex =
      typeof activityMetrics.responseMedianMinutes === 'number' && Number.isFinite(activityMetrics.responseMedianMinutes)
        ? Math.max(0, Math.min(1, 1 - (activityMetrics.responseMedianMinutes / 180)))
        : 0.5;

    const demandByCity = cityRows.map((city) => Math.max(city.count, city.anbieterSuchenCount ?? 0));
    const maxDemand = Math.max(1, ...demandByCity);

    const withScore = cityRows.map((city) => {
      const demand = Math.max(city.count, city.anbieterSuchenCount ?? 0);
      const providers = city.auftragSuchenCount;
      const demandIndex = Math.max(0, Math.min(1, demand / maxDemand));
      const competitionIndex = city.marketBalanceRatio === null
        ? 0.5
        : Math.max(0, Math.min(1, city.marketBalanceRatio / 1.5));
      const demandScore = Number((demandIndex * 10).toFixed(1));
      const competitionScore = Number((competitionIndex * 10).toFixed(1));
      const growthScore = Number((growthIndex * 10).toFixed(1));
      const activityScore = Number((responseSpeedIndex * 10).toFixed(1));
      const score = Number((10 * (
        (demandIndex * 0.4) +
        (competitionIndex * 0.3) +
        (growthIndex * 0.2) +
        (responseSpeedIndex * 0.1)
      )).toFixed(1));

      const tone: WorkspaceStatisticsOpportunityRadarItemView['tone'] =
        score >= 8.5
          ? 'very-high'
          : score >= 7
            ? 'high'
            : score >= 5
              ? 'balanced'
              : 'supply-heavy';

      return {
        ...city,
        demand,
        providers,
        score,
        demandScore,
        competitionScore,
        growthScore,
        activityScore,
        tone,
      };
    });

    return withScore
      .sort((a, b) =>
        (b.score - a.score) ||
        (b.demand - a.demand) ||
        a.name.localeCompare(b.name, locale === 'de' ? 'de-DE' : 'en-US'),
      )
      .slice(0, 3)
      .map((city, index) => {
        const categoryEntry = categoryLeaders[index] ?? null;
        const category = categoryEntry?.categoryName ?? fallbackCategory;
        const categoryKey = categoryEntry?.categoryKey ?? null;
        const hrefParams = new URLSearchParams({ section: 'requests' });
        if (city.cityId) hrefParams.set('cityId', city.cityId);
        if (categoryKey) hrefParams.set('categoryKey', categoryKey);
        return {
          rank: (index + 1) as 1 | 2 | 3,
          cityId: city.cityId,
          city: city.name,
          categoryKey,
          category,
          demand: city.demand,
          providers: city.providers,
          marketBalanceRatio: city.marketBalanceRatio,
          score: city.score,
          demandScore: city.demandScore,
          competitionScore: city.competitionScore,
          growthScore: city.growthScore,
          activityScore: city.activityScore,
          tone: city.tone,
          href: `/workspace?${hrefParams.toString()}`,
        };
      });
  }, [
    activityMetrics.offerRatePercent,
    activityMetrics.responseMedianMinutes,
    cityRows,
    demandRows,
    locale,
  ]);

  const priceIntelligence = React.useMemo<WorkspaceStatisticsPriceIntelligenceView>(() => {
    const topOpportunity = opportunityRadar[0] ?? null;
    const contextLabel = topOpportunity
      ? `${topOpportunity.category} · ${topOpportunity.city}`
      : null;

    const avgRevenue = activityMetrics.completedJobs > 0
      ? activityMetrics.gmvAmount / activityMetrics.completedJobs
      : null;

    if (typeof avgRevenue !== 'number' || !Number.isFinite(avgRevenue) || avgRevenue <= 0) {
      return {
        contextLabel,
        recommendedRangeLabel: null,
        marketAverageLabel: null,
      };
    }

    const roundToNearestFive = (value: number) => Math.max(5, Math.round(value / 5) * 5);
    const lower = roundToNearestFive(avgRevenue * 0.85);
    const upper = roundToNearestFive(avgRevenue * 1.15);
    const marketAverage = roundToNearestFive(avgRevenue);

    return {
      contextLabel,
      recommendedRangeLabel: `${formatCurrency.format(lower)} – ${formatCurrency.format(upper)}`,
      marketAverageLabel: formatCurrency.format(marketAverage),
    };
  }, [activityMetrics.completedJobs, activityMetrics.gmvAmount, formatCurrency, opportunityRadar]);

  const citySignalCoverage = React.useMemo(() => {
    const total = cityRows.length;
    const withSearchSignals = cityRows.filter(
      (row) => row.auftragSuchenCount !== null && row.anbieterSuchenCount !== null,
    ).length;

    const detail =
      locale === 'de'
        ? `${formatNumber.format(withSearchSignals)} von ${formatNumber.format(total)} Städte mit Suchsignal`
        : `${formatNumber.format(withSearchSignals)} of ${formatNumber.format(total)} cities with search signal`;

    if (total > 0 && withSearchSignals === total) {
      return {
        mode: 'full' as const,
        label: copy.cityCoverageFullLabel,
        detail,
      };
    }

    if (withSearchSignals > 0) {
      return {
        mode: 'partial' as const,
        label: copy.cityCoveragePartialLabel,
        detail,
      };
    }

    return {
      mode: 'none' as const,
      label: copy.cityCoverageNoneLabel,
      detail,
    };
  }, [cityRows, copy.cityCoverageFullLabel, copy.cityCoverageNoneLabel, copy.cityCoveragePartialLabel, formatNumber, locale]);

  const funnel = React.useMemo<WorkspaceStatisticsFunnelItemView[]>(() => {
    if (!data) return [];
    const stages = data.profileFunnel.stages;
    if (Array.isArray(stages) && stages.length > 0) {
      return stages.map((stage) => {
        const normalizedId = stage.id === 'confirmations'
          ? 'confirmed'
          : stage.id === 'contracts'
            ? 'closed'
            : stage.id === 'revenue'
              ? 'profit'
              : stage.id;
        const ratePercent = typeof stage.ratePercent === 'number' ? Math.max(0, Math.min(100, Math.round(stage.ratePercent))) : null;
        return {
          key: normalizedId,
          label: stage.label,
          count: Math.max(0, Math.round(stage.value)),
          value: stage.displayValue,
          widthPercent: Math.max(0, Math.min(100, Number(stage.widthPercent ?? 0))),
          rateFromPreviousPercent: ratePercent,
          railLabel: stage.id === 'requests' ? undefined : (stage.rateLabel ?? undefined),
          railValue:
            stage.id === 'requests'
              ? undefined
              : (stage.helperText ?? (ratePercent !== null ? formatPercent(ratePercent) : undefined)),
          isCurrency: stage.id === 'revenue',
        } satisfies WorkspaceStatisticsFunnelItemView;
      });
    }

    const requestsCount = Math.max(0, Math.round(data.profileFunnel.requestsTotal ?? data.profileFunnel.stage1 ?? 0));
    const offersCount = Math.max(0, Math.round(data.profileFunnel.offersTotal ?? data.profileFunnel.stage2 ?? 0));
    const confirmedCount = Math.max(0, Math.round(data.profileFunnel.confirmedResponsesTotal ?? data.profileFunnel.stage3 ?? 0));
    const closedCount = Math.max(0, Math.round(data.profileFunnel.closedContractsTotal ?? data.profileFunnel.stage4 ?? 0));
    const completedCount = Math.max(0, Math.round(data.profileFunnel.completedJobsTotal ?? data.kpis.completedJobsTotal ?? 0));
    const profitAmount = Math.max(0, Number(data.profileFunnel.profitAmount ?? data.activity.metrics.gmvAmount ?? 0));
    const avgRevenuePerCompleted = completedCount > 0 ? profitAmount / completedCount : 0;
    const widthByRequests = (value: number) => Math.max(0, Math.min(100, Number(((value / Math.max(1, requestsCount)) * 100).toFixed(2))));

    return [
      { key: 'requests', label: copy.funnelRequestsLabel, count: requestsCount, value: formatNumber.format(requestsCount), widthPercent: 100, rateFromPreviousPercent: null },
      { key: 'offers', label: copy.funnelOffersLabel, count: offersCount, value: formatNumber.format(offersCount), widthPercent: widthByRequests(offersCount), rateFromPreviousPercent: data.profileFunnel.offerResponseRatePercent ?? null, railLabel: copy.funnelRateOfferLabel, railValue: formatPercent(data.profileFunnel.offerResponseRatePercent ?? 0) },
      { key: 'confirmed', label: copy.funnelConfirmedLabel, count: confirmedCount, value: formatNumber.format(confirmedCount), widthPercent: widthByRequests(confirmedCount), rateFromPreviousPercent: data.profileFunnel.confirmationRatePercent ?? null, railLabel: copy.funnelRateConfirmationLabel, railValue: formatPercent(data.profileFunnel.confirmationRatePercent ?? 0) },
      { key: 'closed', label: copy.funnelClosedLabel, count: closedCount, value: formatNumber.format(closedCount), widthPercent: widthByRequests(closedCount), rateFromPreviousPercent: data.profileFunnel.contractClosureRatePercent ?? null, railLabel: copy.funnelRateClosureLabel, railValue: formatPercent(data.profileFunnel.contractClosureRatePercent ?? 0) },
      { key: 'completed', label: copy.funnelCompletedLabel, count: completedCount, value: formatNumber.format(completedCount), widthPercent: widthByRequests(completedCount), rateFromPreviousPercent: data.profileFunnel.completionRatePercent ?? null, railLabel: copy.funnelRateCompletionLabel, railValue: formatPercent(data.profileFunnel.completionRatePercent ?? 0) },
      { key: 'profit', label: copy.funnelProfitLabel, count: completedCount, value: formatCurrency.format(profitAmount), widthPercent: widthByRequests(completedCount), rateFromPreviousPercent: null, railLabel: copy.funnelRateAvgRevenueLabel, railValue: completedCount > 0 ? formatCurrency.format(avgRevenuePerCompleted) : '—', isCurrency: true },
    ];
  }, [copy, data, formatCurrency, formatNumber]);

  const hasFunnelData = React.useMemo(() => {
    if (!funnel.length) return false;
    const hasStageVolume = funnel.some((item) => !item.isCurrency && item.count > 0);
    if (hasStageVolume) return true;
    return Number(data?.profileFunnel.profitAmount ?? 0) > 0;
  }, [data?.profileFunnel.profitAmount, funnel]);

  const funnelPeriodLabel = React.useMemo(
    () => String(data?.profileFunnel.periodLabel ?? '').trim() || '',
    [data?.profileFunnel.periodLabel],
  );

  const insights = React.useMemo<WorkspaceStatisticsInsightView[]>(
    () => {
      if (!data) return [];
      const merged = mergeInsightsByIdentity([
        ...(data.insights ?? []),
        ...buildSupplementalInsights({ data, mode }),
      ]);
      return selectInsightsForDisplay(merged, mode).map((item, index) => ({
        key: item.id ?? `${item.code}-${index}`,
        level: item.level,
        kind: inferInsightType(item),
        code: item.code,
        priority: item.priority,
        score: item.score,
        metrics: item.metrics,
        context: item.context,
        title: (item.title ?? '').trim() || undefined,
        text: resolveInsightText(copy, item),
        evidence: formatInsightEvidence(item.metrics, locale, formatNumber),
      }));
    },
    [copy, data, formatNumber, locale, mode],
  );

  const growthCards = React.useMemo<WorkspaceStatisticsGrowthCardView[]>(
    () => {
      const recommendedCity = (data?.insights ?? []).find((insight) =>
        insight.code.includes('city'),
      )?.context ?? undefined;

      return (data?.growthCards ?? []).map((card: WorkspaceStatisticsGrowthCardDto) => {
        const resolved = resolveGrowthCard(copy, card);
        return {
          key: card.key,
          title: resolved.title,
          body: resolved.body,
          benefit: resolved.benefit,
          tone: resolved.tone,
          badge: resolved.badge,
          recommendedFor: card.key === 'local_ads' ? recommendedCity : undefined,
          href: resolved.href,
        };
      });
    },
    [copy, data?.growthCards, data?.insights],
  );

  const onExport = React.useCallback(() => {
    if (!data) return;

    const rows: string[][] = [
      ['section', 'metric', 'value'],
      ...kpis.map((item) => ['kpi', item.label, item.value]),
      ...activitySignals.map((item) => ['activity-signal', item.label, `${item.value} (${item.hint})`]),
      ...data.demand.categories.map((item) => ['category-demand', item.categoryName, `${item.sharePercent}% (${item.requestCount})`]),
      ...cityRows.map((item) => [
        'city-demand',
        item.name,
        `${item.count} (job-search=${item.auftragSuchenCount ?? 'n/a'}, provider-search=${item.anbieterSuchenCount ?? 'n/a'}, market-balance=${item.marketBalanceRatio === null ? 'n/a' : `${item.marketBalanceRatio.toFixed(2)}x`}, ${item.signal})`,
      ]),
      ...funnel.map((item) => ['funnel', item.label, item.value]),
    ];

    const filename = `workspace-statistics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    exportCsv(rows, filename);
  }, [activitySignals, cityRows, data, funnel, kpis, range]);

  const activityMeta = React.useMemo(
    () => ({
      peak: formatDateTimeLabel(data?.activity.totals.peakTimestamp, locale),
      bestWindow: formatDateTimeLabel(data?.activity.totals.bestWindowTimestamp, locale),
      updatedAt: formatDateTimeLabel(data?.updatedAt, locale),
    }),
    [data?.activity.totals.bestWindowTimestamp, data?.activity.totals.peakTimestamp, data?.updatedAt, locale],
  );

  return {
    copy,
    range,
    setRange,
    isLoading: query.isLoading && !data,
    isError: query.isError && !data,
    mode,
    modeLabel: mode === 'personalized' ? copy.modePersonalized : copy.modePlatform,
    kpis,
    activityPoints,
    activityMeta,
    activitySignals,
    demandRows,
    cityRows,
    citySignalCoverage,
    opportunityRadar,
    priceIntelligence,
    funnel,
    funnelPeriodLabel,
    funnelSummary:
      String(data?.profileFunnel.summaryText ?? '').trim() ||
      `${copy.funnelSummaryPrefix} ${funnel.find((item) => item.key === 'requests')?.value ?? '0'} ${copy.funnelSummaryMiddle} ${funnel.find((item) => item.key === 'completed')?.value ?? '0'} ${copy.funnelSummarySuffix}`,
    hasFunnelData,
    conversion: formatPercent(
      Number.isFinite(data?.profileFunnel.totalConversionPercent)
        ? Number(data?.profileFunnel.totalConversionPercent)
        : Number.isFinite(data?.profileFunnel.conversionRate)
          ? Number(data?.profileFunnel.conversionRate)
        : 0,
    ),
    insights,
    growthCards,
    onExport,
  };
}
