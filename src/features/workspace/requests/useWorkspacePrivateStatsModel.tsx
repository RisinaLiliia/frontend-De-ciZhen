'use client';

import * as React from 'react';

import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { DeltaResult } from '@/features/workspace/requests/metrics';
import { formatMoMDeltaLabel } from '@/features/workspace/requests/metrics';
import { getClientHint, getProviderHint } from '@/features/workspace/requests/workspace.content';
import {
  clampPercent,
  mapMonthlySeries,
  type StatsPayload,
} from '@/features/workspace/requests/workspaceState.shared';

type Translator = (key: I18nKey) => string;

type Params = {
  t: Translator;
  locale: string;
  overview: WorkspacePrivateOverviewDto;
  chartMonthLabel: Intl.DateTimeFormat;
  formatNumber: Intl.NumberFormat;
};

export function resolveCompletedMoMDelta(overview: WorkspacePrivateOverviewDto): DeltaResult {
  if (
    overview.insights.providerCompletedDeltaKind === 'percent' &&
    typeof overview.insights.providerCompletedDeltaPercent === 'number'
  ) {
    return {
      kind: 'percent',
      value: overview.insights.providerCompletedDeltaPercent,
    };
  }
  if (overview.insights.providerCompletedDeltaKind === 'new') return { kind: 'new' };
  return { kind: 'none' };
}

export function useWorkspacePrivateStatsModel({
  t,
  locale,
  overview,
  chartMonthLabel,
  formatNumber,
}: Params) {
  const myRequestsTotal = overview.requestsByStatus.total;
  const sentCount = overview.providerOffersByStatus.sent;
  const acceptedCount = overview.providerOffersByStatus.accepted;
  const declinedCount = overview.providerOffersByStatus.declined;
  const completedJobsCount = overview.providerContractsByStatus.completed;

  const completedMoMDelta = React.useMemo(() => resolveCompletedMoMDelta(overview), [overview]);
  const completedMoMLabel = React.useMemo(
    () => formatMoMDeltaLabel(completedMoMDelta, locale),
    [completedMoMDelta, locale],
  );
  const insightText = `${t(I18N_KEYS.requestsPage.navInsightClosedPrefix)} ${overview.insights.providerCompletedThisMonth} ${t(
    I18N_KEYS.requestsPage.navInsightClosedSuffix,
  )} ${completedMoMLabel}`;

  const providerChartPoints = React.useMemo(
    () => mapMonthlySeries(overview.providerMonthlySeries, chartMonthLabel),
    [chartMonthLabel, overview.providerMonthlySeries],
  );
  const clientChartPoints = React.useMemo(
    () => mapMonthlySeries(overview.clientMonthlySeries, chartMonthLabel),
    [chartMonthLabel, overview.clientMonthlySeries],
  );

  const myOpenRequestsCount = overview.kpis.myOpenRequests;
  const recentOffers7d = overview.kpis.recentOffers7d;
  const providerActiveContractsCount = overview.kpis.providerActiveContracts;
  const clientActiveContractsCount = overview.kpis.clientActiveContracts;
  const clientCompletedContractsCount = overview.clientContractsByStatus.completed;
  const acceptanceRate = clampPercent(overview.kpis.acceptanceRate);
  const avgResponseMinutes = overview.kpis.avgResponseMinutes;
  const providerProfileCompleteness = overview.profiles.providerCompleteness;
  const clientProfileCompleteness = overview.profiles.clientCompleteness;

  const providerHint = React.useMemo(
    () => getProviderHint(t, providerProfileCompleteness, recentOffers7d, acceptanceRate),
    [acceptanceRate, providerProfileCompleteness, recentOffers7d, t],
  );
  const clientHint = React.useMemo(
    () => getClientHint(t, myRequestsTotal, myOpenRequestsCount),
    [myOpenRequestsCount, myRequestsTotal, t],
  );

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

  const providerDelta = React.useMemo(() => {
    if (completedMoMDelta.kind === 'percent') {
      const delta = Math.round(completedMoMDelta.value);
      return `${delta >= 0 ? '+' : ''}${delta}%`;
    }
    return undefined;
  }, [completedMoMDelta]);

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
