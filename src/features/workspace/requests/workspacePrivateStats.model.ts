'use client';

import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { formatMoMDeltaLabel, type DeltaResult } from '@/features/workspace/requests/metrics';
import { getClientHint, getProviderHint } from '@/features/workspace/requests/workspace.content';
import {
  clampPercent,
  mapMonthlySeries,
  type StatsPayload,
} from '@/features/workspace/requests/workspaceState.metrics';

type Translator = (key: I18nKey) => string;

export type WorkspacePrivateStatsInput = {
  requestsByStatusTotal: WorkspacePrivateOverviewDto['requestsByStatus']['total'];
  providerOffersSent: WorkspacePrivateOverviewDto['providerOffersByStatus']['sent'];
  providerOffersAccepted: WorkspacePrivateOverviewDto['providerOffersByStatus']['accepted'];
  providerOffersDeclined: WorkspacePrivateOverviewDto['providerOffersByStatus']['declined'];
  providerContractsCompleted: WorkspacePrivateOverviewDto['providerContractsByStatus']['completed'];
  myOpenRequestsCount: WorkspacePrivateOverviewDto['kpis']['myOpenRequests'];
  recentOffers7d: WorkspacePrivateOverviewDto['kpis']['recentOffers7d'];
  providerActiveContractsCount: WorkspacePrivateOverviewDto['kpis']['providerActiveContracts'];
  clientActiveContractsCount: WorkspacePrivateOverviewDto['kpis']['clientActiveContracts'];
  clientContractsCompleted: WorkspacePrivateOverviewDto['clientContractsByStatus']['completed'];
  acceptanceRate: WorkspacePrivateOverviewDto['kpis']['acceptanceRate'];
  avgResponseMinutes: WorkspacePrivateOverviewDto['kpis']['avgResponseMinutes'];
  providerProfileCompleteness: WorkspacePrivateOverviewDto['profiles']['providerCompleteness'];
  clientProfileCompleteness: WorkspacePrivateOverviewDto['profiles']['clientCompleteness'];
  providerCompletedThisMonth: WorkspacePrivateOverviewDto['insights']['providerCompletedThisMonth'];
  providerCompletedDeltaKind: WorkspacePrivateOverviewDto['insights']['providerCompletedDeltaKind'];
  providerCompletedDeltaPercent: WorkspacePrivateOverviewDto['insights']['providerCompletedDeltaPercent'];
  providerMonthlySeries: WorkspacePrivateOverviewDto['providerMonthlySeries'];
  clientMonthlySeries: WorkspacePrivateOverviewDto['clientMonthlySeries'];
};

type BuildWorkspacePrivateStatsModelArgs = {
  t: Translator;
  locale: Locale;
  statsInput: WorkspacePrivateStatsInput;
  chartMonthLabel: Intl.DateTimeFormat;
  formatNumber: Intl.NumberFormat;
};

export function resolveWorkspacePrivateStatsInput(
  overview: WorkspacePrivateOverviewDto,
): WorkspacePrivateStatsInput {
  return {
    requestsByStatusTotal: overview.requestsByStatus.total,
    providerOffersSent: overview.providerOffersByStatus.sent,
    providerOffersAccepted: overview.providerOffersByStatus.accepted,
    providerOffersDeclined: overview.providerOffersByStatus.declined,
    providerContractsCompleted: overview.providerContractsByStatus.completed,
    myOpenRequestsCount: overview.kpis.myOpenRequests,
    recentOffers7d: overview.kpis.recentOffers7d,
    providerActiveContractsCount: overview.kpis.providerActiveContracts,
    clientActiveContractsCount: overview.kpis.clientActiveContracts,
    clientContractsCompleted: overview.clientContractsByStatus.completed,
    acceptanceRate: overview.kpis.acceptanceRate,
    avgResponseMinutes: overview.kpis.avgResponseMinutes,
    providerProfileCompleteness: overview.profiles.providerCompleteness,
    clientProfileCompleteness: overview.profiles.clientCompleteness,
    providerCompletedThisMonth: overview.insights.providerCompletedThisMonth,
    providerCompletedDeltaKind: overview.insights.providerCompletedDeltaKind,
    providerCompletedDeltaPercent: overview.insights.providerCompletedDeltaPercent,
    providerMonthlySeries: overview.providerMonthlySeries,
    clientMonthlySeries: overview.clientMonthlySeries,
  };
}

export function resolveCompletedMoMDelta(statsInput: WorkspacePrivateStatsInput): DeltaResult {
  if (
    statsInput.providerCompletedDeltaKind === 'percent' &&
    typeof statsInput.providerCompletedDeltaPercent === 'number'
  ) {
    return {
      kind: 'percent',
      value: statsInput.providerCompletedDeltaPercent,
    };
  }
  if (statsInput.providerCompletedDeltaKind === 'new') return { kind: 'new' };
  return { kind: 'none' };
}

export function buildWorkspacePrivateStatsModel({
  t,
  locale,
  statsInput,
  chartMonthLabel,
  formatNumber,
}: BuildWorkspacePrivateStatsModelArgs) {
  const myRequestsTotal = statsInput.requestsByStatusTotal;
  const sentCount = statsInput.providerOffersSent;
  const acceptedCount = statsInput.providerOffersAccepted;
  const declinedCount = statsInput.providerOffersDeclined;
  const completedJobsCount = statsInput.providerContractsCompleted;
  const myOpenRequestsCount = statsInput.myOpenRequestsCount;
  const recentOffers7d = statsInput.recentOffers7d;
  const providerActiveContractsCount = statsInput.providerActiveContractsCount;
  const clientActiveContractsCount = statsInput.clientActiveContractsCount;
  const clientCompletedContractsCount = statsInput.clientContractsCompleted;
  const acceptanceRate = clampPercent(statsInput.acceptanceRate);
  const avgResponseMinutes = statsInput.avgResponseMinutes;
  const providerProfileCompleteness = statsInput.providerProfileCompleteness;
  const clientProfileCompleteness = statsInput.clientProfileCompleteness;

  const completedMoMDelta = resolveCompletedMoMDelta(statsInput);
  const completedMoMLabel = formatMoMDeltaLabel(completedMoMDelta, locale);
  const insightText = `${t(I18N_KEYS.requestsPage.navInsightClosedPrefix)} ${statsInput.providerCompletedThisMonth} ${t(
    I18N_KEYS.requestsPage.navInsightClosedSuffix,
  )} ${completedMoMLabel}`;

  const providerChartPoints = mapMonthlySeries(statsInput.providerMonthlySeries, chartMonthLabel);
  const clientChartPoints = mapMonthlySeries(statsInput.clientMonthlySeries, chartMonthLabel);
  const providerHint = getProviderHint(t, providerProfileCompleteness, recentOffers7d, acceptanceRate);
  const clientHint = getClientHint(t, myRequestsTotal, myOpenRequestsCount);

  const providerActivityCount =
    sentCount +
    acceptedCount +
    declinedCount +
    providerActiveContractsCount +
    completedJobsCount;
  const clientActivityCount =
    myRequestsTotal +
    myOpenRequestsCount +
    clientActiveContractsCount +
    clientCompletedContractsCount;
  const hasAnyStatsActivity = providerActivityCount + clientActivityCount > 0;

  const providerPriorityScore = providerProfileCompleteness + providerActivityCount * 5;
  const clientPriorityScore = clientProfileCompleteness + clientActivityCount * 5;
  const providerDelta =
    completedMoMDelta.kind === 'percent'
      ? `${Math.round(completedMoMDelta.value) >= 0 ? '+' : ''}${Math.round(completedMoMDelta.value)}%`
      : undefined;

  const providerStatsPayload: StatsPayload = {
    kpis: [],
    showKpis: false,
    hasData: hasAnyStatsActivity,
    chartTitle: t(I18N_KEYS.requestsPage.statsProviderChartTitle),
    chartDelta: providerDelta,
    chartPoints: providerChartPoints,
    secondary: {
      leftLabel: t(I18N_KEYS.requestsPage.statsLabelSent),
      leftValue: formatNumber.format(sentCount),
      centerLabel: t(I18N_KEYS.requestsPage.statsLabelAccepted),
      centerValue: formatNumber.format(acceptedCount),
      rightLabel: t(I18N_KEYS.requestsPage.statsLabelActive),
      rightValue: formatNumber.format(providerActiveContractsCount),
      progressLabel: t(I18N_KEYS.requestsPage.statsLabelAcceptanceRate),
      progressValue: acceptanceRate,
      responseLabel: t(I18N_KEYS.requestsPage.statsLabelResponseTime),
      responseValue:
        typeof avgResponseMinutes === 'number'
          ? `${avgResponseMinutes} ${t(I18N_KEYS.requestsPage.statsMinutesSuffix)}`
          : '—',
    },
    hint: providerHint,
    emptyTitle: t(I18N_KEYS.requestsPage.statsProviderEmptyTitle),
    emptyCtaLabel: t(I18N_KEYS.requestsPage.statsProviderEmptyCta),
    emptyCtaHref: '/workspace?section=requests',
  };

  const clientStatsPayload: StatsPayload = {
    kpis: [
      {
        key: 'requests-total',
        label: t(I18N_KEYS.requestsPage.statsKpiMyRequests),
        value: formatNumber.format(myRequestsTotal),
      },
      {
        key: 'requests-open',
        label: t(I18N_KEYS.requestsPage.statsKpiOpen),
        value: formatNumber.format(myOpenRequestsCount),
      },
      {
        key: 'contracts-active',
        label: t(I18N_KEYS.requestsPage.statsKpiInProgress),
        value: formatNumber.format(clientActiveContractsCount),
      },
      {
        key: 'contracts-completed',
        label: t(I18N_KEYS.requestsPage.statsKpiCompleted),
        value: formatNumber.format(clientCompletedContractsCount),
      },
    ],
    chartTitle: t(I18N_KEYS.requestsPage.statsClientChartTitle),
    chartPoints: clientChartPoints,
    secondary: {
      leftLabel: t(I18N_KEYS.requestsPage.statsLabelTotal),
      leftValue: formatNumber.format(myRequestsTotal),
      centerLabel: t(I18N_KEYS.requestsPage.statsLabelOpen),
      centerValue: formatNumber.format(myOpenRequestsCount),
      rightLabel: t(I18N_KEYS.requestsPage.statsKpiInProgress),
      rightValue: formatNumber.format(clientActiveContractsCount),
      progressLabel: t(I18N_KEYS.requestsPage.statsLabelCompletionRate),
      progressValue: clampPercent(
        Math.round((clientCompletedContractsCount / Math.max(1, myRequestsTotal)) * 100),
      ),
      responseLabel: t(I18N_KEYS.requestsPage.statsLabelCompletedJobs),
      responseValue: formatNumber.format(clientCompletedContractsCount),
    },
    hint: clientHint,
    emptyTitle: t(I18N_KEYS.requestsPage.statsClientEmptyTitle),
    emptyCtaLabel: t(I18N_KEYS.requestsPage.statsClientEmptyCta),
    emptyCtaHref: '/request/create',
  };

  const statsOrder =
    providerPriorityScore >= clientPriorityScore
      ? [
          {
            tab: 'provider' as const,
            title: t(I18N_KEYS.requestsPage.statsProviderTitle),
            payload: providerStatsPayload,
          },
          {
            tab: 'client' as const,
            title: t(I18N_KEYS.requestsPage.statsClientTitle),
            payload: clientStatsPayload,
          },
        ]
      : [
          {
            tab: 'client' as const,
            title: t(I18N_KEYS.requestsPage.statsClientTitle),
            payload: clientStatsPayload,
          },
          {
            tab: 'provider' as const,
            title: t(I18N_KEYS.requestsPage.statsProviderTitle),
            payload: providerStatsPayload,
          },
        ];

  return {
    insightText,
    hasAnyStatsActivity,
    providerStatsPayload,
    clientStatsPayload,
    statsOrder,
  };
}
