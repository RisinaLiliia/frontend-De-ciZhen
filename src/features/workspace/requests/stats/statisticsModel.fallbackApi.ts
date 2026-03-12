import { getPlatformActivity } from '@/lib/api/analytics';
import type { ReviewOverviewDto } from '@/lib/api/dto/reviews';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { getPlatformReviewsOverview } from '@/lib/api/reviews';
import { getWorkspacePrivateOverview, getWorkspacePublicOverview } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { getAccessToken } from '@/lib/auth/token';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import {
  buildInsightsFromFallback,
  clampPercent,
  formatFallbackRangeLabel,
  normalizeLegacyRange,
  toActivityTotals,
  toFallbackActivityMetrics,
} from './statisticsModel.mappers';

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

export async function getWorkspaceStatisticsFallback(
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
