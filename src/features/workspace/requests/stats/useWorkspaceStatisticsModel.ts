'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import type {
  WorkspacePublicCityActivityDto,
  WorkspacePublicSummaryDto,
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsGrowthCardDto,
  WorkspaceStatisticsInsightDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import { getWorkspaceStatistics } from '@/lib/api/workspace';
import type { Locale } from '@/lib/i18n/t';
import {
  getWorkspaceStatisticsCopy,
  resolveGrowthCard,
  resolveInsightText,
  type WorkspaceStatisticsCopy,
} from './workspaceStatistics.copy';

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
    queryFn: () => getWorkspaceStatistics(range),
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
        label: locale === 'de' ? 'Aktive Stadte' : 'Active cities',
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
          label: locale === 'de' ? 'Profil Vollstandigkeit' : 'Profile completeness',
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
