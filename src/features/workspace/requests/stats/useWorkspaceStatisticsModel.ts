'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import type {
  RequestResponseDto,
} from '@/lib/api/dto/requests';
import type {
  ReviewOverviewDto,
} from '@/lib/api/dto/reviews';
import type {
  WorkspacePublicCityActivityDto,
  WorkspacePublicSummaryDto,
  WorkspaceStatisticsActivityPointDto,
  WorkspaceStatisticsActivityTotalsDto,
  WorkspaceStatisticsCategoryDemandDto,
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

const ENABLE_STATISTICS_BFF = process.env.NEXT_PUBLIC_WORKSPACE_STATS_BFF === 'true';
let isStatisticsBffAvailable: boolean | null = ENABLE_STATISTICS_BFF ? null : false;

export type WorkspaceStatisticsKpiView = {
  key: string;
  label: string;
  value: string;
  hint: string;
  tone: 'positive' | 'neutral';
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
  cityRows: Array<{ key: string; name: string; count: number }>;
  cityMapPayload: {
    cityActivity: WorkspacePublicCityActivityDto;
    summary: WorkspacePublicSummaryDto;
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

function toHint(value: number, baseline: number, locale: Locale) {
  if (baseline <= 0) {
    if (value <= 0) return locale === 'de' ? '0% stabil' : '0% stable';
    return locale === 'de' ? `+${value} neu` : `+${value} new`;
  }
  const pct = Math.round(((value - baseline) / baseline) * 100);
  if (pct === 0) return locale === 'de' ? '0% stabil' : '0% stable';
  return locale === 'de' ? `${pct > 0 ? '+' : ''}${pct}% ggü. vorher` : `${pct > 0 ? '+' : ''}${pct}% vs previous`;
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

async function getWorkspaceStatisticsFallback(
  range: WorkspaceStatisticsRange,
): Promise<WorkspaceStatisticsOverviewDto> {
  const legacyRange = normalizeLegacyRange(range);

  const [publicOverview, activity, reviews, privateOverview] = await Promise.all([
    getWorkspacePublicOverview({
      sort: 'date_desc',
      page: 1,
      limit: 80,
      activityRange: legacyRange,
      cityActivityLimit: 25,
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
    withStatusFallback(() => getWorkspacePrivateOverview(), null, [401, 403, 404]),
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
    .slice(0, 8);

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

  const query = useQuery({
    queryKey: ['workspace-statistics-overview', range],
    queryFn: async () => {
      if (isStatisticsBffAvailable === false) {
        return getWorkspaceStatisticsFallback(range);
      }

      try {
        const payload = await getWorkspaceStatistics(range);
        isStatisticsBffAvailable = true;
        return payload;
      } catch (error) {
        if (!hasAnyStatus(error, [400, 404])) {
          throw error;
        }
        isStatisticsBffAvailable = false;
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
        hint: toHint(totals.latestRequests, totals.previousRequests, locale),
        tone: totals.latestRequests >= totals.previousRequests ? 'positive' : 'neutral',
      },
      {
        key: 'offers-total',
        label: copy.offersLabel,
        value: formatNumber.format(data.kpis.offersTotal),
        hint: toHint(totals.latestOffers, totals.previousOffers, locale),
        tone: totals.latestOffers >= totals.previousOffers ? 'positive' : 'neutral',
      },
      {
        key: 'completed-total',
        label: copy.stage4LabelPlatform,
        value: formatNumber.format(data.kpis.completedJobsTotal),
        hint: formatPercent(data.kpis.successRate),
        tone: data.kpis.successRate >= 25 ? 'positive' : 'neutral',
      },
      {
        key: 'active-providers',
        label: locale === 'de' ? 'Aktive Anbieter' : 'Active providers',
        value: formatNumber.format(data.summary.totalActiveProviders),
        hint: formatNumber.format(data.summary.totalPublishedRequests),
        tone: 'neutral',
      },
      {
        key: 'active-cities',
        label: locale === 'de' ? 'Aktive Städte' : 'Active cities',
        value: formatNumber.format(data.summary.totalActiveCities),
        hint: locale === 'de' ? 'mit Nachfrage' : 'with demand',
        tone: 'neutral',
      },
      {
        key: 'rating-avg',
        label: locale === 'de' ? 'Durchschnittsbewertung' : 'Average rating',
        value:
          data.summary.platformRatingAvg > 0
            ? data.summary.platformRatingAvg.toFixed(1)
            : '—',
        hint: `${formatNumber.format(data.summary.platformRatingCount)} ${copy.reviewsLabel}`,
        tone: data.summary.platformRatingAvg >= 4 ? 'positive' : 'neutral',
      },
    ];

    if (mode === 'personalized') {
      return [
        {
          key: 'open-requests',
          label: copy.stage1LabelPersonalized,
          value: formatNumber.format(data.kpis.openRequests ?? 0),
          hint: formatNumber.format(data.kpis.requestsTotal),
          tone: 'neutral',
        },
        {
          key: 'recent-offers',
          label: copy.stage2LabelPersonalized,
          value: formatNumber.format(data.kpis.offersTotal),
          hint: `${formatNumber.format(data.kpis.recentOffers7d ?? 0)} ${locale === 'de' ? 'letzte 7 Tage' : 'last 7 days'}`,
          tone: (data.kpis.recentOffers7d ?? 0) > 0 ? 'positive' : 'neutral',
        },
        {
          key: 'completed-personal',
          label: copy.stage4LabelPersonalized,
          value: formatNumber.format(data.kpis.completedJobsTotal),
          hint: formatPercent(data.kpis.successRate),
          tone: data.kpis.successRate >= 30 ? 'positive' : 'neutral',
        },
        {
          key: 'response-time',
          label: locale === 'de' ? 'Antwortzeit' : 'Response time',
          value: formatMinutes(data.kpis.avgResponseMinutes, locale),
          hint:
            typeof data.kpis.avgResponseMinutes === 'number' && data.kpis.avgResponseMinutes <= 30
              ? locale === 'de'
                ? 'Schnell'
                : 'Fast'
              : locale === 'de'
                ? 'Optimieren'
                : 'Needs improvement',
          tone:
            typeof data.kpis.avgResponseMinutes === 'number' && data.kpis.avgResponseMinutes <= 30
              ? 'positive'
              : 'neutral',
        },
        {
          key: 'success-rate',
          label: locale === 'de' ? 'Erfolgsquote' : 'Success rate',
          value: formatPercent(data.kpis.successRate),
          hint: formatNumber.format(data.profileFunnel.stage3),
          tone: data.kpis.successRate >= 30 ? 'positive' : 'neutral',
        },
        {
          key: 'profile-completeness',
          label: locale === 'de' ? 'Profil Vollständigkeit' : 'Profile completeness',
          value: formatPercent(data.kpis.profileCompleteness ?? 0),
          hint:
            (data.kpis.profileCompleteness ?? 0) >= 80
              ? locale === 'de'
                ? 'Starkes Profil'
                : 'Strong profile'
              : locale === 'de'
                ? 'Potenzial'
                : 'Growth potential',
          tone: (data.kpis.profileCompleteness ?? 0) >= 80 ? 'positive' : 'neutral',
        },
      ];
    }

    return shared;
  }, [copy, data, formatNumber, locale, mode]);

  const cityRows = React.useMemo(
    () =>
      (data?.demand.cities ?? []).map((item) => ({
        key: item.citySlug,
        name: item.cityName,
        count: item.requestCount,
      })),
    [data?.demand.cities],
  );

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
      ...cityRows.map((item) => ['city-demand', item.name, String(item.count)]),
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

  const cityMapPayload = React.useMemo(
    () => ({
      cityActivity: {
        totalActiveCities: data?.summary.totalActiveCities ?? 0,
        totalActiveRequests: (data?.demand.cities ?? []).reduce((sum, item) => sum + item.requestCount, 0),
        items: data?.demand.cities ?? [],
      },
      summary: {
        totalPublishedRequests: data?.summary.totalPublishedRequests ?? 0,
        totalActiveProviders: data?.summary.totalActiveProviders ?? 0,
      },
    }),
    [data?.demand.cities, data?.summary.totalActiveCities, data?.summary.totalActiveProviders, data?.summary.totalPublishedRequests],
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
    cityMapPayload,
    funnel,
    conversion: formatPercent(data?.profileFunnel.conversionRate ?? 0),
    insights,
    growthCards,
    onExport,
  };
}
