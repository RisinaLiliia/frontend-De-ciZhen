'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { KpiCardTrend } from '@/components/ui/KpiCard';

import type {
  RequestResponseDto,
} from '@/lib/api/dto/requests';
import type {
  ReviewOverviewDto,
} from '@/lib/api/dto/reviews';
import type {
  WorkspacePublicCityActivityItemDto,
  WorkspaceStatisticsActivityPointDto,
  WorkspaceStatisticsActivityTotalsDto,
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsCityDemandDto,
  WorkspaceStatisticsGrowthCardDto,
  WorkspaceStatisticsInsightDto,
  WorkspaceStatisticsOverviewDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import { getPlatformActivity, type PlatformActivityRange } from '@/lib/api/analytics';
import { getPlatformReviewsOverview } from '@/lib/api/reviews';
import {
  getWorkspacePrivateOverview,
  getWorkspacePublicOverview,
  getWorkspaceStatistics,
} from '@/lib/api/workspace';
import { hasAnyStatus, withStatusFallback } from '@/lib/api/withStatusFallback';
import { getAccessToken } from '@/lib/auth/token';
import type { Locale } from '@/lib/i18n/t';
import {
  getWorkspaceStatisticsCopy,
  resolveGrowthCard,
  resolveInsightText,
  type WorkspaceStatisticsCopy,
} from './workspaceStatistics.copy';

const REVIEWS_SUMMARY_FALLBACK: ReviewOverviewDto = {
  items: [],
  total: 0,
  limit: 1,
  offset: 0,
  summary: {
    total: 0,
    averageRating: 0,
    distribution: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    },
  },
};

const WORKSPACE_STATS_BFF_FLAG = process.env.NEXT_PUBLIC_WORKSPACE_STATS_BFF;
const FORCE_DISABLE_STATISTICS_BFF = WORKSPACE_STATS_BFF_FLAG === 'false';
const FORCE_ENABLE_STATISTICS_BFF = WORKSPACE_STATS_BFF_FLAG === 'true';
let isStatisticsBffAvailable: boolean | null = FORCE_DISABLE_STATISTICS_BFF ? false : null;

type WorkspaceStatisticsSource = 'bff' | 'fallback';
type WorkspaceStatisticsCitySourceDto = Omit<
  WorkspaceStatisticsCityDemandDto,
  'auftragSuchenCount' | 'anbieterSuchenCount'
> & {
  auftragSuchenCount?: number;
  anbieterSuchenCount?: number;
};

type WorkspaceStatisticsOverviewSourceDto = Omit<WorkspaceStatisticsOverviewDto, 'demand'> & {
  demand: Omit<WorkspaceStatisticsOverviewDto['demand'], 'cities'> & {
    cities: WorkspaceStatisticsCitySourceDto[];
  };
  __source: WorkspaceStatisticsSource;
};

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
  value: string;
};

export type WorkspaceStatisticsInsightView = {
  key: string;
  level: WorkspaceStatisticsInsightDto['level'];
  text: string;
};

export type WorkspaceStatisticsGrowthCardView = {
  key: string;
  title: string;
  body: string;
  href: string;
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
  demandRows: WorkspaceStatisticsCategoryDemandDto[];
  cityRows: WorkspaceStatisticsCityRowView[];
  citySignalCoverage: {
    mode: 'full' | 'partial' | 'none';
    label: string;
    detail: string;
  };
  funnel: WorkspaceStatisticsFunnelItemView[];
  conversion: string;
  insights: WorkspaceStatisticsInsightView[];
  growthCards: WorkspaceStatisticsGrowthCardView[];
  onExport: () => void;
};

function formatDateLabel(timestamp: string, range: WorkspaceStatisticsRange, locale: Locale) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return timestamp;
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  if (range === '24h') {
    return new Intl.DateTimeFormat(localeTag, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
  return new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function formatDateTimeLabel(timestamp: string | null | undefined, locale: Locale) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return '—';
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  return new Intl.DateTimeFormat(localeTag, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${Math.max(0, Math.round(value))}%`;
}

function formatMinutes(value: number | null, locale: Locale) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '—';
  return locale === 'de' ? `~${Math.round(value)} Min.` : `~${Math.round(value)} min`;
}

function toHint(
  value: number,
  baseline: number,
  range: WorkspaceStatisticsRange,
  locale: Locale,
) {
  const context =
    locale === 'de'
      ? range === '24h'
        ? 'heute'
        : range === '7d'
          ? 'diese Woche'
          : range === '30d'
            ? 'diesen Monat'
            : 'in 90 Tagen'
      : range === '24h'
        ? 'today'
        : range === '7d'
          ? 'this week'
          : range === '30d'
            ? 'this month'
            : 'in 90 days';

  if (baseline <= 0) {
    if (value <= 0) return locale === 'de' ? 'Trend stabil' : 'Trend stable';
    return locale === 'de' ? `+${value} neu ${context}` : `+${value} new ${context}`;
  }
  const delta = value - baseline;
  if (delta === 0) return locale === 'de' ? 'Trend stabil' : 'Trend stable';
  if (locale === 'de') {
    return `${delta > 0 ? '+' : ''}${delta} seit letzter Periode`;
  }
  return `${delta > 0 ? '+' : ''}${delta} since last period`;
}

function toTrend(value: number, baseline: number): KpiCardTrend {
  if (baseline <= 0) {
    if (value <= 0) return { direction: 'flat', percent: 0 };
    return { direction: 'up', percent: 100 };
  }
  const percent = Math.round(((value - baseline) / baseline) * 100);
  if (percent > 0) return { direction: 'up', percent };
  if (percent < 0) return { direction: 'down', percent };
  return { direction: 'flat', percent: 0 };
}

function resolveCitySignal(params: {
  requestCount: number;
  auftragSuchenCount: number;
  anbieterSuchenCount: number;
}): WorkspaceStatisticsCityRowView['signal'] {
  const demandActivity = Math.max(0, params.requestCount) + Math.max(0, params.anbieterSuchenCount);
  const supplyActivity = Math.max(0, params.auftragSuchenCount);
  const pressure = demandActivity / Math.max(1, supplyActivity);
  if (pressure >= 1.2) return 'high';
  if (pressure <= 0.8) return 'low';
  return 'medium';
}

function resolveMarketBalanceRatio(params: {
  requestCount: number;
  auftragSuchenCount: number;
  anbieterSuchenCount: number;
}): number {
  const demandActivity = Math.max(0, params.requestCount) + Math.max(0, params.anbieterSuchenCount);
  const supplyActivity = Math.max(0, params.auftragSuchenCount);
  if (demandActivity <= 0) return 0;
  return demandActivity / Math.max(1, supplyActivity);
}

function formatReviewCountHint(count: number, locale: Locale, formatNumber: Intl.NumberFormat): string {
  if (locale === 'de') {
    return `${formatNumber.format(count)} ${count === 1 ? 'Bewertung' : 'Bewertungen'}`;
  }
  return `${formatNumber.format(count)} ${count === 1 ? 'review' : 'reviews'}`;
}

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

function normalizeLegacyRange(range: WorkspaceStatisticsRange): PlatformActivityRange {
  if (range === '24h' || range === '7d' || range === '30d') return range;
  return '30d';
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toActivityTotals(points: WorkspaceStatisticsActivityPointDto[]): WorkspaceStatisticsActivityTotalsDto {
  const requestsTotal = points.reduce((sum, point) => sum + point.requests, 0);
  const offersTotal = points.reduce((sum, point) => sum + point.offers, 0);
  const latest = points[points.length - 1] ?? null;
  const previous = points[points.length - 2] ?? null;

  const peak = points.reduce<{ timestamp: string; score: number } | null>((acc, point) => {
    const score = point.requests + point.offers;
    if (!acc || score > acc.score) return { timestamp: point.timestamp, score };
    return acc;
  }, null);

  const bestWindow = points.reduce<{ timestamp: string; requests: number } | null>((acc, point) => {
    if (!acc || point.requests > acc.requests) {
      return { timestamp: point.timestamp, requests: point.requests };
    }
    return acc;
  }, null);

  return {
    requestsTotal,
    offersTotal,
    latestRequests: latest?.requests ?? 0,
    latestOffers: latest?.offers ?? 0,
    previousRequests: previous?.requests ?? 0,
    previousOffers: previous?.offers ?? 0,
    peakTimestamp: peak?.timestamp ?? null,
    bestWindowTimestamp: bestWindow?.timestamp ?? null,
  };
}

function buildCategoryDemand(items: RequestResponseDto[]): WorkspaceStatisticsCategoryDemandDto[] {
  const counts = new Map<string, { categoryKey: string | null; categoryName: string; count: number }>();
  for (const item of items) {
    const categoryName =
      String(item.categoryName ?? '').trim() ||
      String(item.subcategoryName ?? '').trim() ||
      String(item.serviceKey ?? '').trim() ||
      'Other';
    const key = `${item.categoryKey ?? 'none'}::${categoryName}`;
    const current = counts.get(key);
    if (current) {
      current.count += 1;
      continue;
    }
    counts.set(key, {
      categoryKey: item.categoryKey ?? null,
      categoryName,
      count: 1,
    });
  }

  const rows = Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return rows.map((row) => ({
    categoryKey: row.categoryKey,
    categoryName: row.categoryName,
    requestCount: row.count,
    sharePercent: total > 0 ? clampPercent((row.count / total) * 100) : 0,
  }));
}

function buildInsightsFromFallback(params: {
  mode: 'platform' | 'personalized';
  profileCompleteness: number | null;
  successRate: number;
  avgResponseMinutes: number | null;
  topCategoryName: string | null;
  topCityName: string | null;
}): WorkspaceStatisticsInsightDto[] {
  const next: WorkspaceStatisticsInsightDto[] = [];

  if (params.mode === 'personalized' && params.profileCompleteness !== null && params.profileCompleteness < 80) {
    next.push({ level: 'warning', code: 'profile_incomplete', context: String(params.profileCompleteness) });
  }
  if (params.mode === 'personalized' && params.successRate < 25) {
    next.push({ level: 'warning', code: 'low_success_rate', context: String(params.successRate) });
  }
  if (params.mode === 'personalized' && params.avgResponseMinutes !== null) {
    if (params.avgResponseMinutes <= 30) {
      next.push({ level: 'trend', code: 'strong_response_time', context: String(Math.round(params.avgResponseMinutes)) });
    } else {
      next.push({ level: 'info', code: 'slow_response_time', context: String(Math.round(params.avgResponseMinutes)) });
    }
  }
  if (params.topCategoryName) {
    next.push({ level: 'trend', code: 'high_category_demand', context: params.topCategoryName });
  }
  if (params.topCityName) {
    next.push({ level: 'info', code: 'top_city_demand', context: params.topCityName });
  }

  if (next.length === 0) {
    return [{ level: 'info', code: 'insufficient_data', context: null }];
  }
  return next.slice(0, 4);
}

function mergeFullCityRanking(params: {
  statsCities: WorkspaceStatisticsCitySourceDto[];
  publicCities: WorkspacePublicCityActivityItemDto[];
}): WorkspaceStatisticsCitySourceDto[] {
  if (params.publicCities.length === 0) return params.statsCities;

  const statsBySlug = new Map<string, WorkspaceStatisticsCitySourceDto>();
  const statsByName = new Map<string, WorkspaceStatisticsCitySourceDto>();

  for (const city of params.statsCities) {
    statsBySlug.set(city.citySlug, city);
    statsByName.set(city.cityName.trim().toLowerCase(), city);
  }

  return params.publicCities
    .slice()
    .sort((a, b) => b.requestCount - a.requestCount)
    .map((city) => {
      const bySlug = statsBySlug.get(city.citySlug);
      const byName = statsByName.get(city.cityName.trim().toLowerCase());
      const statsCity = bySlug ?? byName;
      return {
        citySlug: city.citySlug,
        cityName: city.cityName,
        cityId: city.cityId,
        requestCount: city.requestCount,
        lat: city.lat,
        lng: city.lng,
        auftragSuchenCount: statsCity?.auftragSuchenCount,
        anbieterSuchenCount: statsCity?.anbieterSuchenCount,
      };
    });
}

async function getWorkspaceStatisticsFallback(
  range: WorkspaceStatisticsRange,
): Promise<WorkspaceStatisticsOverviewSourceDto> {
  const hasAccessToken = Boolean(getAccessToken());
  const legacyRange = normalizeLegacyRange(range);

  const [publicOverview, activity, reviews, privateOverview] = await Promise.all([
    getWorkspacePublicOverview({
      sort: 'date_desc',
      page: 1,
      limit: 80,
      activityRange: legacyRange,
      cityActivityLimit: 5000,
    }),
    withStatusFallback(
      () => getPlatformActivity(legacyRange),
      {
        range: legacyRange,
        interval: legacyRange === '24h' ? 'hour' : 'day',
        source: 'real',
        data: [],
        updatedAt: new Date().toISOString(),
      },
      [400, 404],
    ),
    withStatusFallback(
      () => getPlatformReviewsOverview({ limit: 1, offset: 0, sort: 'created_desc' }),
      REVIEWS_SUMMARY_FALLBACK,
      [400, 404],
    ),
    hasAccessToken
      ? withStatusFallback(() => getWorkspacePrivateOverview(), null, [401, 403, 404])
      : Promise.resolve(null),
  ]);

  const points = (activity.data.length > 0 ? activity.data : publicOverview.activity.data).map((point) => ({
    timestamp: point.timestamp,
    requests: Math.max(0, Math.round(point.requests)),
    offers: Math.max(0, Math.round(point.offers)),
  }));
  const activityTotals = toActivityTotals(points);

  const demandCategories = buildCategoryDemand(publicOverview.requests.items);
  const demandCities = publicOverview.cityActivity.items
    .slice()
    .sort((a, b) => b.requestCount - a.requestCount)
    .map((item) => ({
      ...item,
      auftragSuchenCount: item.requestCount,
      anbieterSuchenCount: item.requestCount,
    }));

  const mode: 'platform' | 'personalized' = privateOverview ? 'personalized' : 'platform';
  const completedJobs = privateOverview
    ? privateOverview.providerContractsByStatus.completed + privateOverview.clientContractsByStatus.completed
    : 0;
  const profileCompleteness = privateOverview
    ? Math.max(privateOverview.profiles.providerCompleteness, privateOverview.profiles.clientCompleteness)
    : null;
  const successRate = privateOverview
    ? privateOverview.kpis.acceptanceRate
    : clampPercent((activityTotals.offersTotal / Math.max(1, activityTotals.requestsTotal)) * 100);

  const insights = buildInsightsFromFallback({
    mode,
    profileCompleteness,
    successRate,
    avgResponseMinutes: privateOverview?.kpis.avgResponseMinutes ?? null,
    topCategoryName: demandCategories[0]?.categoryName ?? null,
    topCityName: demandCities[0]?.cityName ?? null,
  });

  return {
    __source: 'fallback',
    updatedAt: new Date().toISOString(),
    mode,
    range,
    summary: {
      totalPublishedRequests: publicOverview.summary.totalPublishedRequests,
      totalActiveProviders: publicOverview.summary.totalActiveProviders,
      totalActiveCities: publicOverview.cityActivity.totalActiveCities,
      platformRatingAvg: Number(reviews.summary.averageRating ?? 0),
      platformRatingCount: Number(reviews.summary.total ?? 0),
    },
    kpis: {
      requestsTotal: privateOverview?.requestsByStatus.total ?? activityTotals.requestsTotal,
      offersTotal: privateOverview?.providerOffersByStatus.sent ?? activityTotals.offersTotal,
      completedJobsTotal: privateOverview ? completedJobs : 0,
      successRate,
      avgResponseMinutes: privateOverview?.kpis.avgResponseMinutes ?? null,
      profileCompleteness,
      openRequests: privateOverview?.kpis.myOpenRequests ?? null,
      recentOffers7d: privateOverview?.kpis.recentOffers7d ?? null,
    },
    activity: {
      range,
      interval: legacyRange === '24h' ? 'hour' : 'day',
      points,
      totals: activityTotals,
    },
    demand: {
      categories: demandCategories,
      cities: demandCities,
    },
    profileFunnel: privateOverview
      ? {
          stage1: privateOverview.kpis.myOpenRequests,
          stage2: privateOverview.providerOffersByStatus.sent,
          stage3: privateOverview.providerOffersByStatus.accepted,
          stage4: completedJobs,
          conversionRate: privateOverview.kpis.acceptanceRate,
        }
      : {
          stage1: activityTotals.requestsTotal,
          stage2: activityTotals.offersTotal,
          stage3: activityTotals.offersTotal,
          stage4: 0,
          conversionRate: successRate,
        },
    insights,
    growthCards: [
      { key: 'highlight_profile', href: '/workspace?section=profile' },
      { key: 'local_ads', href: '/workspace?section=requests' },
      { key: 'premium_tools', href: '/provider/onboarding' },
    ],
  };
}

export function useWorkspaceStatisticsModel({
  locale,
}: {
  locale: Locale;
}): WorkspaceStatisticsModel {
  const [range, setRange] = React.useState<WorkspaceStatisticsRange>('30d');
  const copy = React.useMemo(() => getWorkspaceStatisticsCopy(locale), [locale]);
  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const formatNumber = React.useMemo(() => new Intl.NumberFormat(localeTag), [localeTag]);

  const query = useQuery<WorkspaceStatisticsOverviewSourceDto>({
    queryKey: ['workspace-statistics-overview', range],
    queryFn: async () => {
      if (isStatisticsBffAvailable === false) {
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

        isStatisticsBffAvailable = true;
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
            isStatisticsBffAvailable = false;
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
        name: item.cityName,
        count: requestCount,
        auftragSuchenCount,
        anbieterSuchenCount,
        marketBalanceRatio,
        signal,
      };
    });
  }, [data?.__source, data?.demand.cities]);

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
    if (mode === 'personalized') {
      return [
        {
          key: 'stage1',
          label: copy.stage1LabelPersonalized,
          value: formatNumber.format(data.profileFunnel.stage1),
        },
        {
          key: 'stage2',
          label: copy.stage2LabelPersonalized,
          value: formatNumber.format(data.profileFunnel.stage2),
        },
        {
          key: 'stage3',
          label: copy.stage3LabelPersonalized,
          value: formatNumber.format(data.profileFunnel.stage3),
        },
        {
          key: 'stage4',
          label: copy.stage4LabelPersonalized,
          value: formatNumber.format(data.profileFunnel.stage4),
        },
      ];
    }

    return [
      {
        key: 'stage1',
        label: copy.stage1LabelPlatform,
        value: formatNumber.format(data.profileFunnel.stage1),
      },
      {
        key: 'stage2',
        label: copy.stage2LabelPlatform,
        value: formatNumber.format(data.profileFunnel.stage2),
      },
      {
        key: 'stage3',
        label: copy.stage3LabelPlatform,
        value: formatNumber.format(data.profileFunnel.stage3),
      },
      {
        key: 'stage4',
        label: copy.stage4LabelPlatform,
        value: formatNumber.format(data.profileFunnel.stage4),
      },
    ];
  }, [copy, data, formatNumber, mode]);

  const insights = React.useMemo<WorkspaceStatisticsInsightView[]>(
    () =>
      (data?.insights ?? []).map((item, index) => ({
        key: `${item.code}-${index}`,
        level: item.level,
        text: resolveInsightText(copy, item),
      })),
    [copy, data?.insights],
  );

  const growthCards = React.useMemo<WorkspaceStatisticsGrowthCardView[]>(
    () =>
      (data?.growthCards ?? []).map((card: WorkspaceStatisticsGrowthCardDto) => {
        const resolved = resolveGrowthCard(copy, card);
        return {
          key: card.key,
          title: resolved.title,
          body: resolved.body,
          href: resolved.href,
        };
      }),
    [copy, data?.growthCards],
  );

  const onExport = React.useCallback(() => {
    if (!data) return;

    const rows: string[][] = [
      ['section', 'metric', 'value'],
      ...kpis.map((item) => ['kpi', item.label, item.value]),
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
  }, [cityRows, data, funnel, kpis, range]);

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
    demandRows: data?.demand.categories ?? [],
    cityRows,
    citySignalCoverage,
    funnel,
    conversion: formatPercent(data?.profileFunnel.conversionRate ?? 0),
    insights,
    growthCards,
    onExport,
  };
}
