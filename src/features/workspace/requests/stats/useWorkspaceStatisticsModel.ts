'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { KpiCardTrend } from '@/components/ui/KpiCard';

import type {
  ReviewOverviewDto,
} from '@/lib/api/dto/reviews';
import type {
  WorkspacePublicCityActivityItemDto,
  WorkspaceStatisticsActivityMetricsDto,
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
  funnel: WorkspaceStatisticsFunnelItemView[];
  funnelPeriodLabel: string;
  funnelSummary: string;
  hasFunnelData: boolean;
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

function formatInsightMetricKey(key: string, locale: Locale): string {
  if (key === 'requests') return locale === 'de' ? 'Anfragen' : 'Requests';
  if (key === 'providers') return locale === 'de' ? 'Anbieter' : 'Providers';
  if (key === 'ratio') return locale === 'de' ? 'Verhältnis' : 'Ratio';
  if (key === 'sharePercent') return locale === 'de' ? 'Anteil' : 'Share';
  if (key === 'responseMinutes') return locale === 'de' ? 'Antwortzeit' : 'Response time';
  if (key === 'successRatePercent') return locale === 'de' ? 'Erfolgsquote' : 'Success rate';
  if (key === 'profileCompleteness') return locale === 'de' ? 'Profil' : 'Profile';
  if (key === 'providerSearchCount') return locale === 'de' ? 'Anbieter-Suchen' : 'Provider searches';
  if (key === 'unansweredRequests24h') return locale === 'de' ? 'Offen >24h' : 'Open >24h';
  return key;
}

function formatInsightEvidence(
  metrics: Array<{ key: string; value: string | number }> | undefined,
  locale: Locale,
  formatNumber: Intl.NumberFormat,
): string | undefined {
  if (!Array.isArray(metrics) || metrics.length === 0) return undefined;
  const tokens = metrics.slice(0, 3).map((metric) => {
    const label = formatInsightMetricKey(metric.key, locale);
    const value = typeof metric.value === 'number' ? formatNumber.format(metric.value) : metric.value;
    return `${label}: ${value}`;
  });

  return tokens.length > 0 ? tokens.join(' · ') : undefined;
}

type InsightGroup = 'market' | 'performance' | 'growth' | 'risk' | 'promotion' | 'other';

function inferInsightType(insight: WorkspaceStatisticsInsightDto): NonNullable<WorkspaceStatisticsInsightDto['type']> | 'other' {
  if (insight.type) return insight.type;
  if (insight.code.includes('opportunity')) return 'opportunity';
  if (insight.code.includes('profile_')) return 'growth';
  if (insight.code.includes('response') || insight.code.includes('conversion')) return 'performance';
  if (insight.code.includes('risk') || insight.code.includes('unanswered')) return 'risk';
  if (insight.code.includes('promotion') || insight.code.includes('ads')) return 'promotion';
  if (insight.code.includes('demand') || insight.code.includes('city') || insight.code.includes('category')) return 'demand';
  return 'other';
}

function toInsightGroup(insight: WorkspaceStatisticsInsightDto): InsightGroup {
  const type = inferInsightType(insight);
  if (type === 'demand' || type === 'opportunity') return 'market';
  if (type === 'performance') return 'performance';
  if (type === 'growth') return 'growth';
  if (type === 'risk') return 'risk';
  if (type === 'promotion') return 'promotion';
  return 'other';
}

function toInsightContextBucket(insight: WorkspaceStatisticsInsightDto): string {
  const context = (insight.context ?? '').trim().toLowerCase();
  if (!context) return `${insight.code}:none`;
  if (insight.code.includes('city')) return `city:${context}`;
  if (insight.code.includes('category')) return `category:${context}`;
  return `${insight.code}:${context}`;
}

function mergeInsightsByIdentity(insights: WorkspaceStatisticsInsightDto[]): WorkspaceStatisticsInsightDto[] {
  const map = new Map<string, WorkspaceStatisticsInsightDto>();
  for (const item of insights) {
    const key = `${item.code}:${(item.context ?? '').trim().toLowerCase()}`;
    const existing = map.get(key);
    if (!existing || (item.score ?? 0) > (existing.score ?? 0)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

function selectInsightsForDisplay(
  insights: WorkspaceStatisticsInsightDto[],
  mode: 'platform' | 'personalized',
): WorkspaceStatisticsInsightDto[] {
  if (insights.length === 0) return insights;

  const ranked = insights.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const selected: WorkspaceStatisticsInsightDto[] = [];
  const contextCounts = new Map<string, number>();
  let promotionCount = 0;
  let riskCount = 0;

  const canTake = (candidate: WorkspaceStatisticsInsightDto): boolean => {
    const type = inferInsightType(candidate);
    const bucket = toInsightContextBucket(candidate);
    const bucketCount = contextCounts.get(bucket) ?? 0;
    if (bucketCount >= 2) return false;
    if (type === 'promotion' && promotionCount >= 1) return false;
    if (type === 'risk' && riskCount >= 1) return false;
    return true;
  };

  const take = (candidate: WorkspaceStatisticsInsightDto) => {
    const bucket = toInsightContextBucket(candidate);
    contextCounts.set(bucket, (contextCounts.get(bucket) ?? 0) + 1);
    const type = inferInsightType(candidate);
    if (type === 'promotion') promotionCount += 1;
    if (type === 'risk') riskCount += 1;
    selected.push(candidate);
  };

  const targetGroups: InsightGroup[] =
    mode === 'personalized'
      ? ['market', 'performance', 'growth', 'promotion']
      : ['market', 'market', 'risk', 'promotion'];

  for (const group of targetGroups) {
    if (selected.length >= 4) break;
    const candidate = ranked.find((item) => !selected.includes(item) && toInsightGroup(item) === group && canTake(item));
    if (candidate) take(candidate);
  }

  for (const candidate of ranked) {
    if (selected.length >= 4) break;
    if (selected.includes(candidate)) continue;
    if (!canTake(candidate)) continue;
    take(candidate);
  }

  return selected.slice(0, 4);
}

function buildSupplementalInsights(params: {
  data: WorkspaceStatisticsOverviewSourceDto;
  mode: 'platform' | 'personalized';
}): WorkspaceStatisticsInsightDto[] {
  const { data, mode } = params;
  const list: WorkspaceStatisticsInsightDto[] = [];
  const topCategory = data.demand.categories[0];
  const topCity = data.demand.cities[0];

  if (topCategory && topCategory.requestCount > 0) {
    list.push({
      level: 'trend',
      code: 'top_category_demand',
      context: topCategory.categoryName,
      type: 'demand',
      priority: 'medium',
      score: 60,
      title: `Hohe Nachfrage in ${topCategory.categoryName}`,
      body: `Die Kategorie ${topCategory.categoryName} zeigt aktuell besonders hohe Nachfrage.`,
      metrics: [
        { key: 'requests', value: topCategory.requestCount },
        { key: 'sharePercent', value: topCategory.sharePercent },
      ],
    });
  }

  if (topCity && topCity.requestCount > 0) {
    const auftragSuchenCount = Math.max(0, Math.round(topCity.auftragSuchenCount ?? 0));
    const anbieterSuchenCount = Math.max(0, Math.round(topCity.anbieterSuchenCount ?? 0));
    const marketBalanceRatio = auftragSuchenCount > 0
      ? anbieterSuchenCount / Math.max(1, auftragSuchenCount)
      : null;
    list.push({
      level: 'info',
      code: 'top_city_demand',
      context: topCity.cityName,
      type: 'demand',
      priority: 'medium',
      score: 58,
      title: `Starke Nachfrage in ${topCity.cityName}`,
      body: `In ${topCity.cityName} ist die Nachfrage aktuell am höchsten.`,
      metrics: [
        { key: 'requests', value: topCity.requestCount },
        ...(marketBalanceRatio !== null ? [{ key: 'ratio', value: Number(marketBalanceRatio.toFixed(2)) }] : []),
      ],
    });

    if (marketBalanceRatio !== null && marketBalanceRatio >= 1.4) {
      list.push({
        level: 'trend',
        code: 'best_market_chance',
        context: topCity.cityName,
        type: 'opportunity',
        priority: 'high',
        score: 72,
        title: 'Beste Marktchance',
        body: `${topCity.cityName} zeigt aktuell die beste Kombination aus Nachfrage und geringer Konkurrenz.`,
        metrics: [
          { key: 'ratio', value: Number(marketBalanceRatio.toFixed(2)) },
          { key: 'requests', value: topCity.requestCount },
        ],
      });
    }
  }

  if (mode === 'personalized' && (data.kpis.successRate ?? 0) >= 70) {
    list.push({
      level: 'trend',
      code: 'high_completion_rate',
      context: String(data.kpis.successRate ?? 0),
      type: 'performance',
      priority: 'medium',
      score: 68,
      title: 'Hohe Erfolgsquote',
      body: 'Nach Vertragsabschluss werden deine Aufträge sehr häufig erfolgreich abgeschlossen.',
      metrics: [{ key: 'successRatePercent', value: data.kpis.successRate ?? 0 }],
    });
  }

  return list;
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
  const demandActivity = Math.max(0, params.anbieterSuchenCount) || Math.max(0, params.requestCount);
  const supplyActivity = Math.max(0, params.auftragSuchenCount);
  if (demandActivity <= 0 && supplyActivity <= 0) return 'none';
  const pressure = demandActivity / Math.max(1, supplyActivity);
  if (pressure >= 1.25) return 'high';
  if (pressure <= 0.8) return 'low';
  return 'medium';
}

function resolveMarketBalanceRatio(params: {
  requestCount: number;
  auftragSuchenCount: number;
  anbieterSuchenCount: number;
}): number {
  const demandActivity = Math.max(0, params.anbieterSuchenCount) || Math.max(0, params.requestCount);
  const supplyActivity = Math.max(0, params.auftragSuchenCount);
  if (demandActivity <= 0 && supplyActivity <= 0) return 0;
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

function formatFallbackRangeLabel(range: WorkspaceStatisticsRange): string {
  if (range === '24h') return '24h';
  if (range === '7d') return '7 Tage';
  if (range === '90d') return '90 Tage';
  return '30 Tage';
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

function toFallbackActivityMetrics(params: {
  totals: WorkspaceStatisticsActivityTotalsDto;
  completedJobs: number;
  takeRatePercent?: number;
}): WorkspaceStatisticsActivityMetricsDto {
  const takeRatePercent = Number.isFinite(params.takeRatePercent ?? Number.NaN)
    ? Math.max(0, Number(params.takeRatePercent))
    : 10;
  const offerRatePercent = clampPercent(
    (params.totals.offersTotal / Math.max(1, params.totals.requestsTotal)) * 100,
  );
  const completedJobs = Math.max(0, Math.round(params.completedJobs));
  const gmvAmount = 0;
  return {
    offerRatePercent,
    responseMedianMinutes: null,
    unansweredRequests24h: 0,
    cancellationRatePercent: 0,
    completedJobs,
    gmvAmount,
    platformRevenueAmount: 0,
    takeRatePercent,
  };
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
    next.push({
      level: 'warning',
      code: 'profile_incomplete',
      context: String(params.profileCompleteness),
      title: 'Profil verbessern',
    });
  }
  if (params.mode === 'personalized' && params.successRate < 25) {
    next.push({
      level: 'warning',
      code: 'low_success_rate',
      context: String(params.successRate),
      title: 'Potenzial bei Abschlüssen',
    });
  }
  if (params.mode === 'personalized' && params.avgResponseMinutes !== null) {
    if (params.avgResponseMinutes <= 30) {
      next.push({
        level: 'trend',
        code: 'strong_response_time',
        context: String(Math.round(params.avgResponseMinutes)),
        title: 'Schnelle Reaktionszeit',
      });
    } else {
      next.push({
        level: 'info',
        code: 'slow_response_time',
        context: String(Math.round(params.avgResponseMinutes)),
        title: 'Antwortzeit optimieren',
      });
    }
  }
  if (params.topCategoryName) {
    next.push({
      level: 'trend',
      code: 'high_category_demand',
      context: params.topCategoryName,
      title: 'Hohe Nachfrage in Kategorie',
    });
  }
  if (params.topCityName) {
    next.push({
      level: 'info',
      code: 'top_city_demand',
      context: params.topCityName,
      title: 'Starke Nachfrage nach Stadt',
    });
  }

  if (next.length === 0) {
    return [{ level: 'info', code: 'insufficient_data', context: null, title: 'Noch nicht genug Daten' }];
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
  const requestsFunnelTotal = privateOverview ? privateOverview.kpis.myOpenRequests : activityTotals.requestsTotal;
  const offersFunnelTotal = privateOverview ? privateOverview.providerOffersByStatus.sent : activityTotals.offersTotal;
  const confirmedResponsesTotal = privateOverview ? privateOverview.providerOffersByStatus.accepted : activityTotals.offersTotal;
  const closedContractsTotal = privateOverview ? completedJobs : 0;
  const completedFunnelTotal = privateOverview ? completedJobs : 0;
  const profitAmount = 0;
  const offerResponseRatePercent = clampPercent((offersFunnelTotal / Math.max(1, requestsFunnelTotal)) * 100);
  const confirmationRatePercent = clampPercent((confirmedResponsesTotal / Math.max(1, offersFunnelTotal)) * 100);
  const contractClosureRatePercent = clampPercent((closedContractsTotal / Math.max(1, confirmedResponsesTotal)) * 100);
  const completionRatePercent = clampPercent((completedFunnelTotal / Math.max(1, closedContractsTotal)) * 100);
  const conversionRate = clampPercent((completedFunnelTotal / Math.max(1, requestsFunnelTotal)) * 100);
  const widths = {
    requests: 100,
    offers: Math.max(0, Math.min(100, Number(((offersFunnelTotal / Math.max(1, requestsFunnelTotal)) * 100).toFixed(2)))),
    confirmations: Math.max(0, Math.min(100, Number(((confirmedResponsesTotal / Math.max(1, requestsFunnelTotal)) * 100).toFixed(2)))),
    contracts: Math.max(0, Math.min(100, Number(((closedContractsTotal / Math.max(1, requestsFunnelTotal)) * 100).toFixed(2)))),
    completed: Math.max(0, Math.min(100, Number(((completedFunnelTotal / Math.max(1, requestsFunnelTotal)) * 100).toFixed(2)))),
  };
  const revenueWidth = widths.completed;
  const fallbackStages = [
    {
      id: 'requests' as const,
      label: 'Anfragen',
      value: requestsFunnelTotal,
      displayValue: `${requestsFunnelTotal}`,
      widthPercent: widths.requests,
      rateLabel: 'Basis',
      ratePercent: 100,
      helperText: null,
    },
    {
      id: 'offers' as const,
      label: 'Angebote von Anbietern',
      value: offersFunnelTotal,
      displayValue: `${offersFunnelTotal}`,
      widthPercent: widths.offers,
      rateLabel: 'Antwortquote',
      ratePercent: offerResponseRatePercent,
      helperText: null,
    },
    {
      id: 'confirmations' as const,
      label: 'Bestätigte Rückmeldungen',
      value: confirmedResponsesTotal,
      displayValue: `${confirmedResponsesTotal}`,
      widthPercent: widths.confirmations,
      rateLabel: 'Zustimmungsrate',
      ratePercent: confirmationRatePercent,
      helperText: null,
    },
    {
      id: 'contracts' as const,
      label: 'Geschlossene Verträge',
      value: closedContractsTotal,
      displayValue: `${closedContractsTotal}`,
      widthPercent: widths.contracts,
      rateLabel: 'Abschlussrate',
      ratePercent: contractClosureRatePercent,
      helperText: null,
    },
    {
      id: 'completed' as const,
      label: 'Erfolgreich abgeschlossen',
      value: completedFunnelTotal,
      displayValue: `${completedFunnelTotal}`,
      widthPercent: widths.completed,
      rateLabel: 'Erfüllungsquote',
      ratePercent: completionRatePercent,
      helperText: null,
    },
    {
      id: 'revenue' as const,
      label: 'Gewinnsumme',
      value: profitAmount,
      displayValue: '0 €',
      widthPercent: revenueWidth,
      rateLabel: 'Ø Umsatz / Auftrag',
      ratePercent: null,
      helperText: '—',
    },
  ];

  const insights = buildInsightsFromFallback({
    mode,
    profileCompleteness,
    successRate,
    avgResponseMinutes: privateOverview?.kpis.avgResponseMinutes ?? null,
    topCategoryName: null,
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
      metrics: toFallbackActivityMetrics({
        totals: activityTotals,
        completedJobs: privateOverview ? completedJobs : 0,
      }),
    },
    demand: {
      categories: [],
      cities: demandCities,
    },
    profileFunnel: {
      periodLabel: formatFallbackRangeLabel(range),
      stage1: requestsFunnelTotal,
      stage2: offersFunnelTotal,
      stage3: confirmedResponsesTotal,
      stage4: closedContractsTotal,
      requestsTotal: requestsFunnelTotal,
      offersTotal: offersFunnelTotal,
      confirmedResponsesTotal,
      closedContractsTotal,
      completedJobsTotal: completedFunnelTotal,
      profitAmount,
      offerResponseRatePercent,
      confirmationRatePercent,
      contractClosureRatePercent,
      completionRatePercent,
      conversionRate,
      totalConversionPercent: conversionRate,
      summaryText: `Von ${requestsFunnelTotal} Anfragen wurden ${completedFunnelTotal} erfolgreich abgeschlossen.`,
      stages: fallbackStages,
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
