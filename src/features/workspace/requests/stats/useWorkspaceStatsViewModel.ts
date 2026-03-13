'use client';

import * as React from 'react';

import type {
  WorkspaceStatisticsActivityMetricsDto,
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsGrowthCardDto,
  WorkspaceStatisticsPriceIntelligenceDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import {
  getWorkspaceStatisticsCopy,
  resolveGrowthCard,
  resolveInsightText,
} from './workspaceStatistics.copy';
import {
  inferInsightType,
} from './statisticsInsights.utils';
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatInsightEvidence,
  formatMinutes,
  formatPercent,
  formatReviewCountHint,
  toHint,
  toTrend,
} from './statisticsModel.mappers';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import type {
  WorkspaceStatisticsActivitySignalView,
  WorkspaceStatisticsCityRowView,
  WorkspaceStatisticsFunnelItemView,
  WorkspaceStatisticsGrowthCardView,
  WorkspaceStatisticsInsightView,
  WorkspaceStatisticsKpiView,
  WorkspaceStatisticsModel,
  WorkspaceStatisticsOpportunityRadarItemView,
  WorkspaceStatisticsPriceIntelligenceView,
} from './workspaceStatistics.model';

const DEFAULT_ACTIVITY_METRICS: WorkspaceStatisticsActivityMetricsDto = {
  offerRatePercent: 0,
  responseMedianMinutes: null,
  unansweredRequests24h: 0,
  cancellationRatePercent: 0,
  completedJobs: 0,
  gmvAmount: 0,
  platformRevenueAmount: 0,
  takeRatePercent: 10,
  offerRateTone: 'neutral',
  responseMedianTone: 'neutral',
  unansweredTone: 'positive',
  cancellationTone: 'neutral',
  completedTone: 'neutral',
  revenueTone: 'neutral',
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

type UseWorkspaceStatsViewModelParams = {
  locale: Locale;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  data: WorkspaceStatisticsOverviewSourceDto | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function useWorkspaceStatsViewModel({
  locale,
  range,
  setRange,
  data,
  isLoading,
  isError,
}: UseWorkspaceStatsViewModelParams): WorkspaceStatisticsModel {
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

  const activityMetrics: WorkspaceStatisticsActivityMetricsDto = React.useMemo(
    () => data?.activity.metrics ?? DEFAULT_ACTIVITY_METRICS,
    [data?.activity.metrics],
  );

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
        tone: activityMetrics.offerRateTone,
      },
      {
        key: 'response-median',
        label: copy.activityResponseMedianLabel,
        value: responseValue,
        hint: responseHint,
        tone: activityMetrics.responseMedianTone,
      },
      {
        key: 'unanswered',
        label: copy.activityUnansweredLabel,
        value: formatNumber.format(activityMetrics.unansweredRequests24h),
        hint: locale === 'de' ? 'Offene Nachfrage ohne Angebot' : 'Open demand without offers',
        tone: activityMetrics.unansweredTone,
      },
      {
        key: 'cancellation',
        label: copy.activityCancellationLabel,
        value: formatPercent(activityMetrics.cancellationRatePercent),
        hint: locale === 'de' ? 'Stornos aus Abschlüssen + Stornos' : 'Cancels from completions + cancels',
        tone: activityMetrics.cancellationTone,
      },
      {
        key: 'completed',
        label: copy.activityCompletedLabel,
        value: formatNumber.format(activityMetrics.completedJobs),
        hint: locale === 'de' ? 'Gelöste Aufträge im Zeitraum' : 'Completed jobs in range',
        tone: activityMetrics.completedTone,
      },
      {
        key: 'revenue',
        label: copy.activityRevenueLabel,
        value: formatCurrency.format(activityMetrics.platformRevenueAmount),
        hint: revenueHint,
        tone: activityMetrics.revenueTone,
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
          ? `${copy.kpiSuccessRateLabel} ${formatPercent(data.kpis.successRate)}`
          : copy.kpiNoCompletedJobs,
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
        label: copy.kpiActiveProvidersLabel,
        value: formatNumber.format(data.summary.totalActiveProviders),
        hint: `${formatNumber.format(data.summary.totalPublishedRequests)} ${copy.kpiActiveRequestsHintSuffix}`,
        tone: 'neutral',
        trend: { direction: 'flat', percent: 0 },
      },
      {
        key: 'active-cities',
        label: copy.kpiActiveCitiesLabel,
        value: formatNumber.format(data.summary.totalActiveCities),
        hint: copy.kpiWithDemandHint,
        tone: 'neutral',
        trend: { direction: 'flat', percent: 0 },
      },
      {
        key: 'rating-avg',
        label: copy.kpiAverageRatingLabel,
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
            ? `${formatNumber.format(data.kpis.requestsTotal)} ${copy.kpiTotalInRangeHintSuffix}`
            : copy.kpiNoOpenRequests,
          tone: 'neutral',
          trend: { direction: 'flat', percent: 0 },
        },
        {
          key: 'recent-offers',
          label: copy.stage2LabelPersonalized,
          value: formatNumber.format(data.kpis.offersTotal),
          hint: recentOffers7d > 0
            ? `${formatNumber.format(recentOffers7d)} ${copy.kpiLast7DaysHintSuffix}`
            : copy.kpiNoRecentOffers7d,
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
            ? `${copy.kpiSuccessRateLabel} ${formatPercent(data.kpis.successRate)}`
            : copy.kpiNoCompletedJobs,
          tone: completedJobs > 0 && data.kpis.successRate >= 30 ? 'positive' : 'neutral',
          trend: completedJobs > 0
            ? { direction: data.kpis.successRate >= 30 ? 'up' : 'down', percent: Math.round(data.kpis.successRate) }
            : { direction: 'flat', percent: 0 },
        },
        {
          key: 'response-time',
          label: copy.kpiResponseTimeLabel,
          value: formatMinutes(data.kpis.avgResponseMinutes, locale),
          hint: typeof avgResponseMinutes !== 'number'
            ? copy.kpiNoResponseTimeData
            : isFastResponse
              ? copy.kpiFastResponseHint
              : copy.kpiResponseTargetHint,
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
          label: copy.kpiSuccessRateLabel,
          value: sentOffers > 0 ? formatPercent(data.kpis.successRate) : '—',
          hint: sentOffers > 0
            ? `${formatNumber.format(acceptedOffers)} ${copy.kpiAcceptedOffersHintSuffix}`
            : copy.kpiNoSentOffers,
          tone: sentOffers > 0 && data.kpis.successRate >= 30 ? 'positive' : 'neutral',
          trend: sentOffers > 0
            ? { direction: data.kpis.successRate >= 30 ? 'up' : 'down', percent: Math.round(data.kpis.successRate) }
            : { direction: 'flat', percent: 0 },
        },
        {
          key: 'profile-completeness',
          label: copy.kpiProfileCompletenessLabel,
          value: formatPercent(profileCompleteness),
          hint: profileCompleteness >= 80
            ? copy.kpiStrongProfileHint
            : copy.kpiImproveProfileHint,
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
    return source.map((item) => ({
      key: item.citySlug,
      cityId: item.cityId ?? null,
      name: item.cityName,
      count: Math.max(0, Math.round(item.requestCount ?? 0)),
      auftragSuchenCount:
        typeof item.auftragSuchenCount === 'number' && Number.isFinite(item.auftragSuchenCount)
          ? Math.max(0, Math.round(item.auftragSuchenCount))
          : null,
      anbieterSuchenCount:
        typeof item.anbieterSuchenCount === 'number' && Number.isFinite(item.anbieterSuchenCount)
          ? Math.max(0, Math.round(item.anbieterSuchenCount))
          : null,
      marketBalanceRatio:
        typeof item.marketBalanceRatio === 'number' && Number.isFinite(item.marketBalanceRatio)
          ? item.marketBalanceRatio
          : null,
      signal: item.signal ?? 'none',
    }));
  }, [data?.demand.cities]);

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
    const source = data?.opportunityRadar ?? [];
    if (source.length === 0) return [];

    const fallbackCategory = locale === 'de' ? 'Generalistisch' : 'General';
    return source
      .slice()
      .sort((a, b) => (a.rank - b.rank))
      .slice(0, 3)
      .map((item, index) => {
        const hrefParams = new URLSearchParams({ section: 'requests' });
        if (item.cityId) hrefParams.set('cityId', item.cityId);
        if (item.categoryKey) hrefParams.set('categoryKey', item.categoryKey);
        return {
          rank: (item.rank ?? (index + 1)) as 1 | 2 | 3,
          cityId: item.cityId ?? null,
          city: item.city,
          categoryKey: item.categoryKey ?? null,
          category: item.category ?? fallbackCategory,
          demand: Math.max(0, Math.round(item.demand ?? 0)),
          providers:
            typeof item.providers === 'number' && Number.isFinite(item.providers)
              ? Math.max(0, Math.round(item.providers))
              : null,
          marketBalanceRatio:
            typeof item.marketBalanceRatio === 'number' && Number.isFinite(item.marketBalanceRatio)
              ? item.marketBalanceRatio
              : null,
          score: Number(item.score ?? 0),
          demandScore: Number(item.demandScore ?? 0),
          competitionScore: Number(item.competitionScore ?? 0),
          growthScore: Number(item.growthScore ?? 0),
          activityScore: Number(item.activityScore ?? 0),
          status: item.status,
          summaryKey: item.summaryKey,
          metrics: item.metrics ?? [],
          tone: item.tone,
          href: `/workspace?${hrefParams.toString()}`,
        };
      });
  }, [data?.opportunityRadar, locale]);

  const priceIntelligence = React.useMemo<WorkspaceStatisticsPriceIntelligenceView>(() => {
    const source: WorkspaceStatisticsPriceIntelligenceDto | undefined = data?.priceIntelligence;
    if (!source) {
      return {
        cityLabel: null,
        categoryLabel: null,
        contextLabel: null,
        recommendedRangeLabel: null,
        marketAverageLabel: null,
        recommendedMin: null,
        recommendedMax: null,
        marketAverage: null,
        optimalMin: null,
        optimalMax: null,
        optimalMinLabel: null,
        optimalMaxLabel: null,
        recommendation: null,
        profitPotentialScore: null,
        profitPotentialStatus: null,
        profitPotentialLabel: null,
      };
    }

    const cityLabel = source.city ?? null;
    const categoryLabel = source.category ?? null;
    const contextLabel =
      source.category && source.city
        ? `${source.category} · ${source.city}`
        : source.city ?? source.category ?? null;
    const recommendedRangeLabel =
      typeof source.recommendedMin === 'number' &&
      Number.isFinite(source.recommendedMin) &&
      typeof source.recommendedMax === 'number' &&
      Number.isFinite(source.recommendedMax)
        ? `${formatCurrency.format(source.recommendedMin)} – ${formatCurrency.format(source.recommendedMax)}`
        : null;
    const marketAverageLabel =
      typeof source.marketAverage === 'number' && Number.isFinite(source.marketAverage)
        ? formatCurrency.format(source.marketAverage)
        : null;
    const recommendedMin =
      typeof source.recommendedMin === 'number' && Number.isFinite(source.recommendedMin)
        ? source.recommendedMin
        : null;
    const recommendedMax =
      typeof source.recommendedMax === 'number' && Number.isFinite(source.recommendedMax)
        ? source.recommendedMax
        : null;
    const marketAverage =
      typeof source.marketAverage === 'number' && Number.isFinite(source.marketAverage)
        ? source.marketAverage
        : null;
    const optimalMinValue =
      typeof source.optimalMin === 'number' && Number.isFinite(source.optimalMin)
        ? source.optimalMin
        : null;
    const optimalMaxValue =
      typeof source.optimalMax === 'number' && Number.isFinite(source.optimalMax)
        ? source.optimalMax
        : null;
    const optimalMinLabel =
      optimalMinValue !== null && Number.isFinite(optimalMinValue)
        ? formatCurrency.format(optimalMinValue)
        : null;
    const optimalMaxLabel =
      optimalMaxValue !== null && Number.isFinite(optimalMaxValue)
        ? formatCurrency.format(optimalMaxValue)
        : null;
    const recommendation = typeof source.recommendation === 'string' ? source.recommendation : null;
    const profitPotentialScore =
      typeof source.profitPotentialScore === 'number' && Number.isFinite(source.profitPotentialScore)
        ? source.profitPotentialScore
        : null;
    const profitPotentialStatus = source.profitPotentialStatus ?? null;
    const profitPotentialLabel =
      profitPotentialStatus === 'high'
        ? copy.priceProfitHighLabel
        : profitPotentialStatus === 'medium'
          ? copy.priceProfitMediumLabel
          : profitPotentialStatus === 'low'
            ? copy.priceProfitLowLabel
            : null;

    return {
      cityLabel,
      categoryLabel,
      contextLabel,
      recommendedRangeLabel,
      marketAverageLabel,
      recommendedMin,
      recommendedMax,
      marketAverage,
      optimalMin: optimalMinValue,
      optimalMax: optimalMaxValue,
      optimalMinLabel,
      optimalMaxLabel,
      recommendation,
      profitPotentialScore,
      profitPotentialStatus,
      profitPotentialLabel,
    };
  }, [copy.priceProfitHighLabel, copy.priceProfitLowLabel, copy.priceProfitMediumLabel, data?.priceIntelligence, formatCurrency]);

  const funnel = React.useMemo<WorkspaceStatisticsFunnelItemView[]>(() => {
    if (!data) return [];
    const stages = data.profileFunnel.stages;
    if (!Array.isArray(stages) || stages.length === 0) return [];
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
  }, [data]);

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
      return (data.insights ?? []).slice(0, 4).map((item, index) => ({
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
    [copy, data, formatNumber, locale],
  );

  const decisionInsight = React.useMemo(() => {
    const backendDecisionInsight = typeof data?.decisionInsight === 'string'
      ? data.decisionInsight.trim()
      : '';
    if (backendDecisionInsight.length > 0) return backendDecisionInsight;

    return copy.decisionKiFallbackInsight;
  }, [copy.decisionKiFallbackInsight, data]);

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
    isLoading: isLoading && !data,
    isError: isError && !data,
    mode,
    modeLabel: mode === 'personalized' ? copy.modePersonalized : copy.modePlatform,
    kpis,
    activityPoints,
    activityMeta,
    decisionInsight,
    activitySignals,
    demandRows,
    cityRows,
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
