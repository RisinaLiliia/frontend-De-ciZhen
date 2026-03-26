import type {
  WorkspaceStatisticsActivityMetricsDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import {
  formatMinutes,
  formatPercent,
  formatReviewCountHint,
  toHint,
} from './statisticsModel.mappers';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type {
  WorkspaceStatisticsActivitySignalView,
  WorkspaceStatisticsActivityTrendView,
  WorkspaceStatisticsKpiView,
} from './workspaceStatistics.model';

export const DEFAULT_ACTIVITY_METRICS: WorkspaceStatisticsActivityMetricsDto = {
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

export function buildActivityTrend(params: {
  copy: WorkspaceStatisticsCopy;
  latestRequests: number;
  previousRequests: number;
}): WorkspaceStatisticsActivityTrendView {
  const { copy, latestRequests, previousRequests } = params;
  const safePrevious = Math.max(0, previousRequests);

  if (safePrevious === 0 && latestRequests === 0) {
    return {
      label: copy.contextTrendLabel,
      value: '→ 0%',
      tone: 'neutral',
    };
  }

  if (safePrevious === 0) {
    return {
      label: copy.contextTrendLabel,
      value: '↑ +100%',
      tone: 'positive',
    };
  }

  const deltaPercent = Math.round(((latestRequests - safePrevious) / safePrevious) * 100);
  if (deltaPercent > 0) {
    return {
      label: copy.contextTrendLabel,
      value: `↑ +${deltaPercent}%`,
      tone: 'positive',
    };
  }
  if (deltaPercent < 0) {
    return {
      label: copy.contextTrendLabel,
      value: `↓ ${deltaPercent}%`,
      tone: 'warning',
    };
  }

  return {
    label: copy.contextTrendLabel,
    value: '→ 0%',
    tone: 'neutral',
  };
}

export function buildActivitySignals(params: {
  activityMetrics: WorkspaceStatisticsActivityMetricsDto;
  copy: WorkspaceStatisticsCopy;
  formatCurrency: Intl.NumberFormat;
  formatNumber: Intl.NumberFormat;
  locale: Locale;
}): WorkspaceStatisticsActivitySignalView[] {
  const { activityMetrics, copy, formatCurrency, formatNumber, locale } = params;
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
      hint: locale === 'de'
        ? (activityMetrics.offerRatePercent >= 50 ? 'Signal: Nachfrage wird solide in Angebote umgewandelt' : 'Risiko: Zu wenig Nachfrage wird in Angebote überführt')
        : (activityMetrics.offerRatePercent >= 50 ? 'Signal: demand is converting into offers' : 'Risk: too little demand is converting into offers'),
      tone: activityMetrics.offerRateTone,
    },
    {
      key: 'response-median',
      label: copy.activityResponseMedianLabel,
      value: responseValue,
      hint: responseValue === '—'
        ? responseHint
        : (locale === 'de' ? 'Aktion: erstes Angebot möglichst unter 2h senden' : 'Action: keep the first offer below 2h'),
      tone: activityMetrics.responseMedianTone,
    },
    {
      key: 'unanswered',
      label: copy.activityUnansweredLabel,
      value: formatNumber.format(activityMetrics.unansweredRequests24h),
      hint: locale === 'de' ? 'Risiko: verlorene Aufträge ohne schnelle Reaktion' : 'Risk: lost jobs without a fast response',
      tone: activityMetrics.unansweredTone,
    },
    {
      key: 'cancellation',
      label: copy.activityCancellationLabel,
      value: formatPercent(activityMetrics.cancellationRatePercent),
      hint: locale === 'de'
        ? (activityMetrics.cancellationRatePercent <= 10 ? 'Signal: stabile Abschlussqualität' : 'Risiko: instabile Abschlussqualität')
        : (activityMetrics.cancellationRatePercent <= 10 ? 'Signal: stable close quality' : 'Risk: unstable close quality'),
      tone: activityMetrics.cancellationTone,
    },
    {
      key: 'completed',
      label: copy.activityCompletedLabel,
      value: formatNumber.format(activityMetrics.completedJobs),
      hint: locale === 'de' ? 'Signal: bewiesene Lieferfähigkeit im aktuellen Markt' : 'Signal: proven delivery capacity in the current market',
      tone: activityMetrics.completedTone,
    },
    {
      key: 'revenue',
      label: copy.activityRevenueLabel,
      value: formatCurrency.format(activityMetrics.platformRevenueAmount),
      hint: locale === 'de'
        ? `Signal: Monetarisierung funktioniert. ${revenueHint}`
        : `Signal: monetization is working. ${revenueHint}`,
      tone: activityMetrics.revenueTone,
    },
  ];
}

export function buildKpis(params: {
  copy: WorkspaceStatisticsCopy;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  formatNumber: Intl.NumberFormat;
  locale: Locale;
  mode: 'platform' | 'personalized';
  range: WorkspaceStatisticsRange;
}): WorkspaceStatisticsKpiView[] {
  const { copy, data, formatNumber, locale, mode, range } = params;
  if (!data) return [];

  const totals = data.activity.totals;
  const shared: WorkspaceStatisticsKpiView[] = [
    {
      key: 'requests-total',
      label: copy.requestsLabel,
      value: formatNumber.format(data.kpis.requestsTotal),
      hint: toHint(totals.latestRequests, totals.previousRequests, range, locale),
      tone: totals.latestRequests >= totals.previousRequests ? 'positive' : 'neutral',
    },
    {
      key: 'offers-total',
      label: copy.offersLabel,
      value: formatNumber.format(data.kpis.offersTotal),
      hint: toHint(totals.latestOffers, totals.previousOffers, range, locale),
      tone: totals.latestOffers >= totals.previousOffers ? 'positive' : 'neutral',
    },
    {
      key: 'completed-total',
      label: copy.stage4LabelPlatform,
      value: formatNumber.format(data.kpis.completedJobsTotal),
      hint: data.kpis.completedJobsTotal > 0
        ? `${copy.kpiSuccessRateLabel} ${formatPercent(data.kpis.successRate)}`
        : copy.kpiNoCompletedJobs,
      tone: data.kpis.completedJobsTotal > 0 && data.kpis.successRate >= 25 ? 'positive' : 'neutral',
    },
    {
      key: 'active-providers',
      label: copy.kpiActiveProvidersLabel,
      value: formatNumber.format(data.summary.totalActiveProviders),
      hint: `${formatNumber.format(data.summary.totalPublishedRequests)} ${copy.kpiActiveRequestsHintSuffix}`,
      tone: 'neutral',
    },
    {
      key: 'active-cities',
      label: copy.kpiActiveCitiesLabel,
      value: formatNumber.format(data.summary.totalActiveCities),
      hint: copy.kpiWithDemandHint,
      tone: 'neutral',
    },
    {
      key: 'rating-avg',
      label: copy.kpiAverageRatingLabel,
      value: data.summary.platformRatingAvg > 0 ? data.summary.platformRatingAvg.toFixed(1) : '—',
      hint: formatReviewCountHint(data.summary.platformRatingCount, locale, formatNumber),
      tone: data.summary.platformRatingAvg >= 4 ? 'positive' : 'neutral',
    },
  ];

  if (mode !== 'personalized') return shared;

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
    },
    {
      key: 'recent-offers',
      label: copy.stage2LabelPersonalized,
      value: formatNumber.format(data.kpis.offersTotal),
      hint: recentOffers7d > 0
        ? `${formatNumber.format(recentOffers7d)} ${copy.kpiLast7DaysHintSuffix}`
        : copy.kpiNoRecentOffers7d,
      tone: recentOffers7d > 0 ? 'positive' : 'neutral',
    },
    {
      key: 'completed-personal',
      label: copy.stage4LabelPersonalized,
      value: formatNumber.format(completedJobs),
      hint: completedJobs > 0
        ? `${copy.kpiSuccessRateLabel} ${formatPercent(data.kpis.successRate)}`
        : copy.kpiNoCompletedJobs,
      tone: completedJobs > 0 && data.kpis.successRate >= 30 ? 'positive' : 'neutral',
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
    },
    {
      key: 'success-rate',
      label: copy.kpiSuccessRateLabel,
      value: sentOffers > 0 ? formatPercent(data.kpis.successRate) : '—',
      hint: sentOffers > 0
        ? `${formatNumber.format(acceptedOffers)} ${copy.kpiAcceptedOffersHintSuffix}`
        : copy.kpiNoSentOffers,
      tone: sentOffers > 0 && data.kpis.successRate >= 30 ? 'positive' : 'neutral',
    },
    {
      key: 'profile-completeness',
      label: copy.kpiProfileCompletenessLabel,
      value: formatPercent(profileCompleteness),
      hint: profileCompleteness >= 80 ? copy.kpiStrongProfileHint : copy.kpiImproveProfileHint,
      tone: profileCompleteness >= 80 ? 'positive' : 'neutral',
    },
  ];
}
