/** @vitest-environment happy-dom */
import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import type {
  WorkspacePrivateOverviewDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import { normalizeWorkspaceDecisionDashboardResponse } from './statisticsDecisionDashboard.contract';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import { useWorkspaceStatsViewModel } from './useWorkspaceStatsViewModel';
import type { WorkspaceStatisticsFilters } from './workspaceStatistics.model';

afterEach(() => {
  cleanup();
});

function createOverviewData(): WorkspaceStatisticsOverviewSourceDto {
  return {
    __source: 'bff',
    updatedAt: '2026-03-12T10:00:00.000Z',
    mode: 'platform',
    range: '30d',
    summary: {
      totalPublishedRequests: 24,
      totalActiveProviders: 11,
      totalActiveCities: 3,
      platformRatingAvg: 4.6,
      platformRatingCount: 14,
    },
    kpis: {
      requestsTotal: 24,
      offersTotal: 13,
      completedJobsTotal: 5,
      successRate: 21,
      avgResponseMinutes: 31,
      profileCompleteness: null,
      openRequests: null,
      recentOffers7d: null,
    },
    activity: {
      range: '30d',
      interval: 'day',
      points: [
        { timestamp: '2026-03-10T09:00:00.000Z', requests: 5, offers: 2 },
        { timestamp: '2026-03-11T09:00:00.000Z', requests: 6, offers: 4 },
      ],
      totals: {
        requestsTotal: 11,
        offersTotal: 6,
        latestRequests: 6,
        latestOffers: 4,
        previousRequests: 5,
        previousOffers: 2,
        peakTimestamp: '2026-03-11T09:00:00.000Z',
        bestWindowTimestamp: '2026-03-11T09:00:00.000Z',
      },
      metrics: {
        offerRatePercent: 55,
        responseMedianMinutes: 45,
        unansweredRequests24h: 2,
        cancellationRatePercent: 8,
        completedJobs: 5,
        gmvAmount: 1510,
        platformRevenueAmount: 151,
        takeRatePercent: 10,
        offerRateTone: 'neutral',
        responseMedianTone: 'neutral',
        unansweredTone: 'warning',
        cancellationTone: 'positive',
        completedTone: 'positive',
        revenueTone: 'positive',
      },
    },
    demand: {
      categories: [
        {
          categoryKey: 'plumbing',
          categoryName: 'Plumbing & Heating',
          requestCount: 6,
          sharePercent: 35,
        },
        {
          categoryKey: 'cleaning',
          categoryName: 'Cleaning & Housekeeping',
          requestCount: 10,
          sharePercent: 62,
        },
      ],
      cities: [
        {
          citySlug: 'berlin',
          cityName: 'Berlin',
          cityId: 'berlin-id',
          requestCount: 12,
          auftragSuchenCount: 5,
          anbieterSuchenCount: 12,
          marketBalanceRatio: 2.4,
          signal: 'high',
          lat: 52.52,
          lng: 13.405,
        },
        {
          citySlug: 'mannheim',
          cityName: 'Mannheim',
          cityId: 'mannheim-id',
          requestCount: 4,
          lat: 49.4875,
          lng: 8.466,
        },
      ],
    },
    opportunityRadar: [
      {
        rank: 3,
        cityId: 'mannheim-id',
        city: 'Mannheim',
        categoryKey: null,
        category: null,
        demand: 4,
        providers: 2,
        marketBalanceRatio: 2,
        score: 5.4,
        demandScore: 6.0,
        competitionScore: 5.0,
        growthScore: 5.2,
        activityScore: 4.8,
        status: 'balanced',
        tone: 'balanced',
        summaryKey: 'balanced',
        metrics: [
          { key: 'demand', value: 6.0, semanticTone: 'high', semanticKey: 'high' },
          { key: 'competition', value: 5.0, semanticTone: 'medium', semanticKey: 'medium' },
          { key: 'growth', value: 5.2, semanticTone: 'medium', semanticKey: 'medium' },
          { key: 'activity', value: 4.8, semanticTone: 'medium', semanticKey: 'medium' },
        ],
      },
      {
        rank: 1,
        cityId: 'berlin-id',
        city: 'Berlin',
        categoryKey: 'cleaning',
        category: 'Cleaning & Housekeeping',
        demand: 12,
        providers: 5,
        marketBalanceRatio: 2.4,
        score: 8.2,
        demandScore: 10,
        competitionScore: 7.5,
        growthScore: 6.2,
        activityScore: 5.6,
        status: 'good',
        tone: 'high',
        summaryKey: 'good',
        metrics: [
          { key: 'demand', value: 10, semanticTone: 'very-high', semanticKey: 'very_high' },
          { key: 'competition', value: 7.5, semanticTone: 'high', semanticKey: 'high' },
          { key: 'growth', value: 6.2, semanticTone: 'high', semanticKey: 'high' },
          { key: 'activity', value: 5.6, semanticTone: 'medium', semanticKey: 'medium' },
        ],
      },
      {
        rank: 2,
        cityId: 'karlsruhe-id',
        city: 'Karlsruhe',
        categoryKey: 'plumbing',
        category: 'Plumbing & Heating',
        demand: 8,
        providers: 3,
        marketBalanceRatio: 2.67,
        score: 7.4,
        demandScore: 7.9,
        competitionScore: 7.1,
        growthScore: 6,
        activityScore: 5.1,
        status: 'good',
        tone: 'high',
        summaryKey: 'good',
        metrics: [
          { key: 'demand', value: 7.9, semanticTone: 'high', semanticKey: 'high' },
          { key: 'competition', value: 7.1, semanticTone: 'high', semanticKey: 'high' },
          { key: 'growth', value: 6, semanticTone: 'high', semanticKey: 'high' },
          { key: 'activity', value: 5.1, semanticTone: 'medium', semanticKey: 'medium' },
        ],
      },
    ],
    priceIntelligence: {
      citySlug: 'berlin',
      city: 'Berlin',
      categoryKey: 'cleaning',
      category: 'Cleaning & Housekeeping',
      recommendedMin: 65,
      recommendedMax: 90,
      marketAverage: 78,
      optimalMin: 74,
      optimalMax: 83,
      smartRecommendedPrice: 80,
      smartSignalTone: 'balanced',
      analyzedRequestsCount: 126,
      confidenceLevel: 'high',
      recommendation: 'Preise im Bereich von 74 € – 83 € erzielen aktuell die höchste Abschlussrate in Berlin.',
      profitPotentialScore: 7.4,
      profitPotentialStatus: 'medium',
    },
    profileFunnel: {
      periodLabel: '30 Tage',
      stage1: 24,
      stage2: 13,
      stage3: 8,
      stage4: 5,
      requestsTotal: 24,
      offersTotal: 13,
      confirmedResponsesTotal: 8,
      closedContractsTotal: 5,
      completedJobsTotal: 5,
      profitAmount: 1510,
      offerResponseRatePercent: 54,
      confirmationRatePercent: 62,
      contractClosureRatePercent: 63,
      completionRatePercent: 100,
      conversionRate: 21,
      totalConversionPercent: 21,
      summaryText: 'Von 24 Anfragen wurden 5 erfolgreich abgeschlossen.',
      stages: [
        {
          id: 'requests',
          label: 'Anfragen',
          value: 24,
          displayValue: '24',
          widthPercent: 100,
          rateLabel: 'Basis',
          ratePercent: 100,
          helperText: null,
        },
        {
          id: 'offers',
          label: 'Angebote',
          value: 13,
          displayValue: '13',
          widthPercent: 54,
          rateLabel: 'Angebotsquote',
          ratePercent: 54,
          helperText: '54%',
        },
        {
          id: 'confirmations',
          label: 'Bestätigungen',
          value: 8,
          displayValue: '8',
          widthPercent: 33,
          rateLabel: 'Antwortquote',
          ratePercent: 62,
          helperText: '62%',
        },
        {
          id: 'contracts',
          label: 'Verträge',
          value: 5,
          displayValue: '5',
          widthPercent: 21,
          rateLabel: 'Abschlussrate',
          ratePercent: 63,
          helperText: '63%',
        },
        {
          id: 'completed',
          label: 'Abgeschlossen',
          value: 5,
          displayValue: '5',
          widthPercent: 21,
          rateLabel: 'Erfüllungsquote',
          ratePercent: 100,
          helperText: '100%',
        },
        {
          id: 'revenue',
          label: 'Gewinn',
          value: 1510,
          displayValue: '1.510 €',
          widthPercent: 21,
          rateLabel: 'Ø Umsatz / Auftrag',
          ratePercent: null,
          helperText: '302 €',
        },
      ],
    },
    insights: [],
    growthCards: [],
  };
}

function createPersonalizedOverviewData(): WorkspaceStatisticsOverviewSourceDto {
  const data = createOverviewData();
  return {
    ...data,
    mode: 'personalized',
    kpis: {
      ...data.kpis,
      requestsTotal: 58,
      offersTotal: 18,
      completedJobsTotal: 7,
      successRate: 39,
      avgResponseMinutes: 930,
      profileCompleteness: 62,
      openRequests: 28,
      recentOffers7d: 3,
    },
    profileFunnel: {
      ...data.profileFunnel,
      stage1: 58,
      stage2: 18,
      stage3: 11,
      stage4: 7,
      requestsTotal: 58,
      offersTotal: 18,
      confirmedResponsesTotal: 11,
      closedContractsTotal: 7,
      completedJobsTotal: 7,
      profitAmount: 3150,
      confirmationRatePercent: 61,
      conversionRate: 12,
      totalConversionPercent: 12,
      summaryText: 'Von 58 Anfragen wurden 7 erfolgreich abgeschlossen.',
      stages: [
        {
          id: 'requests',
          label: 'Anfragen',
          value: 58,
          displayValue: '58',
          widthPercent: 100,
          rateLabel: 'Basis',
          ratePercent: 100,
          helperText: null,
        },
        {
          id: 'offers',
          label: 'Angebote',
          value: 18,
          displayValue: '18',
          widthPercent: 31,
          rateLabel: 'Angebotsquote',
          ratePercent: 31,
          helperText: '31%',
        },
        {
          id: 'confirmations',
          label: 'Bestätigungen',
          value: 11,
          displayValue: '11',
          widthPercent: 19,
          rateLabel: 'Antwortquote',
          ratePercent: 61,
          helperText: '61%',
        },
        {
          id: 'contracts',
          label: 'Verträge',
          value: 7,
          displayValue: '7',
          widthPercent: 12,
          rateLabel: 'Abschlussrate',
          ratePercent: 64,
          helperText: '64%',
        },
        {
          id: 'completed',
          label: 'Abgeschlossen',
          value: 7,
          displayValue: '7',
          widthPercent: 12,
          rateLabel: 'Erfüllungsquote',
          ratePercent: 100,
          helperText: '100%',
        },
        {
          id: 'revenue',
          label: 'Gewinn',
          value: 3150,
          displayValue: '3.150 €',
          widthPercent: 12,
          rateLabel: 'Ø Umsatz / Auftrag',
          ratePercent: null,
          helperText: '450 €',
        },
      ],
    },
  };
}

function createPrivateOverview(): WorkspacePrivateOverviewDto {
  return {
    updatedAt: '2026-03-12T10:00:00.000Z',
    user: {
      userId: 'user-1',
      role: 'provider',
    },
    preferredRole: 'provider',
    requestsByStatus: {
      draft: 1,
      published: 14,
      paused: 0,
      matched: 3,
      closed: 5,
      cancelled: 1,
      total: 24,
    },
    providerOffersByStatus: {
      sent: 9,
      accepted: 4,
      declined: 2,
      withdrawn: 1,
      total: 16,
    },
    clientOffersByStatus: {
      sent: 0,
      accepted: 0,
      declined: 0,
      withdrawn: 0,
      total: 0,
    },
    providerContractsByStatus: {
      pending: 1,
      confirmed: 1,
      in_progress: 2,
      completed: 3,
      cancelled: 0,
      total: 7,
    },
    clientContractsByStatus: {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 1,
      cancelled: 0,
      total: 1,
    },
    favorites: {
      requests: 0,
      providers: 0,
    },
    reviews: {
      asProvider: 0,
      asClient: 0,
    },
    profiles: {
      providerCompleteness: 82,
      clientCompleteness: 56,
    },
    kpis: {
      myOpenRequests: 18,
      providerActiveContracts: 3,
      clientActiveContracts: 0,
      acceptanceRate: 44,
      activityProgress: 61,
      avgResponseMinutes: 1766,
      recentOffers7d: 3,
    },
    insights: {
      providerCompletedThisMonth: 3,
      providerCompletedLastMonth: 2,
      providerCompletedDeltaKind: 'percent',
      providerCompletedDeltaPercent: 50,
    },
    providerMonthlySeries: [
      { monthStart: '2025-11-01T00:00:00.000Z', bars: 1, line: 120 },
      { monthStart: '2025-12-01T00:00:00.000Z', bars: 3, line: 320 },
      { monthStart: '2026-01-01T00:00:00.000Z', bars: 2, line: 240 },
      { monthStart: '2026-02-01T00:00:00.000Z', bars: 5, line: 510 },
      { monthStart: '2026-03-01T00:00:00.000Z', bars: 4, line: 430 },
    ],
    clientMonthlySeries: [],
  };
}

function Probe({
  data,
  isLoading,
  isError,
  hasBackgroundError = false,
  range = '30d',
  filters,
  privateOverview = null,
}: {
  data: WorkspaceStatisticsOverviewSourceDto | undefined;
  isLoading: boolean;
  isError: boolean;
  hasBackgroundError?: boolean;
  range?: WorkspaceStatisticsRange;
  filters?: WorkspaceStatisticsFilters;
  privateOverview?: WorkspacePrivateOverviewDto | null;
}) {
  const resolvedFilters: WorkspaceStatisticsFilters = filters ?? {
    period: range,
    cityId: null,
    categoryKey: null,
  };
  const normalizedData = data
    ? normalizeWorkspaceDecisionDashboardResponse(data, resolvedFilters)
    : undefined;
  const model = useWorkspaceStatsViewModel({
    locale: 'de',
    privateOverview,
    filters: resolvedFilters,
    range,
    setRange: () => undefined,
    setCityId: () => undefined,
    setCategoryKey: () => undefined,
    cityListPage: 1,
    setCityListPage: () => undefined,
    setViewerMode: () => undefined,
    resetFilters: () => undefined,
    data: normalizedData,
    isLoading,
    isError,
    hasBackgroundError,
    isFetching: false,
    isPendingFilters: false,
  });

  return (
    <div
      data-testid="probe"
      data-loading={String(model.isLoading)}
      data-error={String(model.isError)}
      data-background-error={String(model.hasBackgroundError)}
      data-demand-order={model.demandRows.map((row) => row.categoryKey).join(',')}
      data-opportunity-order={model.opportunityRadar.map((row) => row.rank).join(',')}
      data-opportunity-cities={model.opportunityRadar.map((row) => row.city).join('|')}
      data-opportunity-categories={model.opportunityRadar.map((row) => row.category).join('|')}
      data-first-opportunity-href={model.opportunityRadar[0]?.href ?? ''}
      data-price-context={model.priceIntelligence.contextLabel ?? ''}
      data-price-range={model.priceIntelligence.recommendedRangeLabel ?? ''}
      data-price-average={model.priceIntelligence.marketAverageLabel ?? ''}
      data-context-mode={model.context.mode}
      data-context-sticky={model.context.stickyLabel}
      data-context-low-data={String(model.context.isLowData)}
      data-activity-trend={model.activityTrend.value}
      data-activity-title={model.activityTitle}
      data-activity-subtitle={model.activitySubtitle}
      data-activity-summary={model.activitySummary ?? ''}
      data-activity-meta-peak={model.activityMeta.peak}
      data-activity-meta-best-window={model.activityMeta.bestWindow}
      data-activity-meta-updated={model.activityMeta.updatedAt}
      data-activity-client-series={model.activityPoints.map((item) => String(item.clientActivity ?? '')).join('|')}
      data-activity-provider-series={model.activityPoints.map((item) => String(item.providerActivity ?? '')).join('|')}
      data-has-funnel={String(model.hasFunnelData)}
      data-funnel-requests={String(model.funnel.find((row) => row.key === 'requests')?.count ?? 0)}
      data-funnel-offers={String(model.funnel.find((row) => row.key === 'offers')?.count ?? 0)}
      data-funnel-requests-compare={[
        model.funnel.find((row) => row.key === 'requests')?.compare?.userCount ?? '',
        model.funnel.find((row) => row.key === 'requests')?.compare?.userRate ?? '',
        model.funnel.find((row) => row.key === 'requests')?.compare?.gapRate ?? '',
      ].join('|')}
      data-funnel-offers-compare={[
        model.funnel.find((row) => row.key === 'offers')?.compare?.userCount ?? '',
        model.funnel.find((row) => row.key === 'offers')?.compare?.userRate ?? '',
        model.funnel.find((row) => row.key === 'offers')?.compare?.gapRate ?? '',
      ].join('|')}
      data-funnel-summary={model.funnelSummary}
      data-funnel-conversion={model.conversion}
      data-funnel-dropoff={model.funnelDropoff?.value ?? ''}
      data-funnel-dropoff-hint={model.funnelDropoff?.hint ?? ''}
      data-decision-insight={model.decisionInsight}
      data-activity-signal-labels={model.activitySignals.map((item) => item.label).join('|')}
      data-activity-signal-values={model.activitySignals.map((item) => `${item.marketValue ?? ''}|${item.userValue ?? ''}|${item.value}`).join(';')}
      data-activity-signal-hints={model.activitySignals.map((item) => item.hint).join('|')}
      data-user-comparison={model.userIntelligence?.comparisonLabel ?? ''}
      data-user-formulas={model.userIntelligence?.formulaMetrics.map((item) => item.key).join('|') ?? ''}
      data-user-signals={model.userIntelligence?.signals.map((item) => item.code).join('|') ?? ''}
      data-funnel-comparison-stages={model.funnelComparison?.stages.map((item) => item.key).join('|') ?? ''}
      data-funnel-comparison-summary={model.funnelComparison?.summary ?? ''}
      data-funnel-comparison-action={model.funnelComparison?.nextAction ?? ''}
      data-user-funnel-signals={model.userIntelligence?.funnelSignals.map((item) => item.label).join('|') ?? ''}
      data-user-funnel-hints={model.userIntelligence?.funnelSignals.map((item) => item.hint).join('|') ?? ''}
      data-user-pricing-gap={model.userIntelligence?.pricing?.gap ?? ''}
      data-user-pricing-action={model.userIntelligence?.pricing?.action ?? ''}
      data-user-position={model.userIntelligence?.performancePosition?.headline ?? ''}
      data-user-actions={model.userIntelligence?.nextSteps.map((item) => item.title).join('|') ?? ''}
      data-right-rail-risks-title={model.rightRailRisks?.title ?? ''}
      data-right-rail-opportunities-title={model.rightRailOpportunities?.title ?? ''}
      data-right-rail-next-steps-title={model.rightRailNextSteps?.title ?? ''}
      data-right-rail-next-steps-items={model.rightRailNextSteps?.steps.map((item) => item.title).join('|') ?? ''}
    />
  );
}

function NormalizedProbe({
  data,
  filters,
  privateOverview = null,
}: {
  data: WorkspaceStatisticsDecisionDashboardDto;
  filters: WorkspaceStatisticsFilters;
  privateOverview?: WorkspacePrivateOverviewDto | null;
}) {
  const model = useWorkspaceStatsViewModel({
    locale: 'de',
    privateOverview,
    filters,
    range: filters.period,
    setRange: () => undefined,
    setCityId: () => undefined,
    setCategoryKey: () => undefined,
    cityListPage: 1,
    setCityListPage: () => undefined,
    setViewerMode: () => undefined,
    resetFilters: () => undefined,
    data,
    isLoading: false,
    isError: false,
    hasBackgroundError: false,
    isFetching: false,
    isPendingFilters: false,
  });

  return (
    <div
      data-testid="normalized-probe"
      data-city-options={model.cityOptions.map((item) => `${item.value}:${item.label}`).join('|')}
      data-category-options={model.categoryOptions.map((item) => `${item.value}:${item.label}`).join('|')}
    />
  );
}

describe('useWorkspaceStatsViewModel', () => {
  it('maps and sorts demand/opportunity sections from backend dto', () => {
    render(<Probe data={createOverviewData()} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-demand-order')).toBe('cleaning,plumbing');
    expect(probe.getAttribute('data-opportunity-order')).toBe('1,2,3');
    expect(probe.getAttribute('data-opportunity-cities')).toBe('Berlin|Karlsruhe|Mannheim');
    expect(probe.getAttribute('data-opportunity-categories')).toBe(
      'Cleaning & Housekeeping|Cleaning & Housekeeping|Cleaning & Housekeeping',
    );
    expect(probe.getAttribute('data-first-opportunity-href')).toContain('cityId=berlin-id');
    expect(probe.getAttribute('data-first-opportunity-href')).toContain('categoryKey=cleaning');
    expect(probe.getAttribute('data-price-context')).toBe('Cleaning & Housekeeping · Berlin');
    expect(probe.getAttribute('data-price-range')).toContain('65');
    expect(probe.getAttribute('data-price-range')).toContain('90');
    expect(probe.getAttribute('data-price-average')).toContain('78');
    expect(probe.getAttribute('data-activity-trend')).toBe('↑ +20%');
    expect(probe.getAttribute('data-funnel-dropoff')).toBe('46%');
    expect(probe.getAttribute('data-funnel-dropoff-hint')).toContain('Angebote');
    expect(probe.getAttribute('data-decision-insight')).toContain('Kennzahlen');
  });

  it('keeps loading/error flags when no data is available', () => {
    const { rerender } = render(<Probe data={undefined} isLoading={true} isError={false} />);

    let probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-loading')).toBe('true');
    expect(probe.getAttribute('data-error')).toBe('false');

    rerender(<Probe data={undefined} isLoading={false} isError={true} />);
    probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-loading')).toBe('false');
    expect(probe.getAttribute('data-error')).toBe('true');
  });

  it('builds personalized decision signals from formula metrics and rule signals', () => {
    render(<Probe data={createPersonalizedOverviewData()} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-user-formulas')).toContain('offer_rate');
    expect(probe.getAttribute('data-user-formulas')).toContain('avg_response_time');
    expect(probe.getAttribute('data-user-signals')).toContain('slow_response');
    expect(probe.getAttribute('data-user-signals')).toContain('high_unanswered');
    expect(probe.getAttribute('data-funnel-comparison-stages')).toBe('requests|offers|responses|contracts|completed');
    expect(probe.getAttribute('data-funnel-comparison-summary')).toContain('Du verlierst');
    expect(probe.getAttribute('data-funnel-comparison-action')).toContain('Marktfokus schärfen');
    expect((probe.getAttribute('data-activity-signal-labels') ?? '').split('|')).toHaveLength(6);
    expect(probe.getAttribute('data-activity-signal-labels')).toContain('Offer rate');
    expect(probe.getAttribute('data-activity-signal-labels')).toContain('Average response time');
    expect(probe.getAttribute('data-activity-signal-labels')).toContain('Completed jobs');
    expect(probe.getAttribute('data-activity-signal-labels')).toContain('Revenue');
    expect(probe.getAttribute('data-activity-signal-values')).toContain('55%|31%|31%');
    expect(probe.getAttribute('data-activity-signal-values')).toContain('45 Min.|930 Min.|930 Min.');
    expect(probe.getAttribute('data-activity-signal-hints')).toContain('unter dem Markt');
    expect(probe.getAttribute('data-activity-signal-hints')).toContain('langsamer als der Markt');
    expect(probe.getAttribute('data-user-funnel-signals')).toContain('Median Antwortzeit');
    expect(probe.getAttribute('data-user-funnel-signals')).toContain('Gap Analysis');
    expect(probe.getAttribute('data-user-funnel-hints')).toContain('Du verlierst');
    expect(probe.getAttribute('data-user-pricing-gap')).toContain('+');
    expect(probe.getAttribute('data-user-pricing-action')).toContain('Preis anpassen');
    expect(probe.getAttribute('data-user-actions')).toContain('Antworte schneller');
  });

  it('prefers backend recommendation sections for the personalized right rail', () => {
    const data = normalizeWorkspaceDecisionDashboardResponse(createPersonalizedOverviewData(), {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    data.risks = {
      title: 'Backend Risiken',
      subtitle: 'Server-defined risk section',
      hasReliableItems: true,
      items: [
        {
          code: 'high_unanswered_requests',
          type: 'risk',
          priority: 'high',
          title: 'Offene Anfragen stauen sich',
          description: 'Mehrere Vorgänge warten zu lange auf Reaktion.',
          confidence: 0.86,
          reliability: 'high',
          context: '18 offen',
          actionCode: 'follow_up_unanswered',
          action: {
            code: 'follow_up_unanswered',
            label: 'Offene Vorgänge priorisieren',
            target: '/workspace?tab=my-requests',
          },
        },
      ],
    };
    data.opportunities = {
      title: 'Backend Chancen',
      subtitle: 'Server-defined opportunity section',
      hasReliableItems: true,
      items: [
        {
          code: 'city_opportunity_high',
          type: 'opportunity',
          priority: 'medium',
          title: 'Berlin hat aktuell Nachfrage',
          description: 'Im aktuellen Kontext entstehen hier zusätzliche Chancen.',
          confidence: 0.78,
          reliability: 'medium',
          context: 'Berlin',
          actionCode: 'focus_market',
          action: {
            code: 'focus_market',
            label: 'Marktfokus schärfen',
            target: '/workspace?section=stats&focus=cities',
          },
        },
      ],
    };
    data.nextSteps = {
      title: 'Backend Nächste Schritte',
      subtitle: 'Server-defined action section',
      hasReliableItems: true,
      items: [
        {
          code: 'respond_faster',
          type: 'performance',
          priority: 'high',
          title: 'Antworte unter 2 Stunden',
          description: 'Schnellere Reaktionen erhöhen die Abschlusschance.',
          confidence: 0.82,
          reliability: 'high',
          context: '2h Ziel',
          actionCode: 'respond_faster',
          action: {
            code: 'respond_faster',
            label: 'Schneller reagieren',
            target: '/workspace?tab=my-requests',
          },
        },
      ],
    };

    render(<Probe data={data} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-right-rail-risks-title')).toBe('Backend Risiken');
    expect(probe.getAttribute('data-right-rail-opportunities-title')).toBe('Backend Chancen');
    expect(probe.getAttribute('data-right-rail-next-steps-title')).toBe('Backend Nächste Schritte');
    expect(probe.getAttribute('data-right-rail-next-steps-items')).toContain('Antworte unter 2 Stunden');
  });

  it('prefers canonical funnelComparison summary over legacy profile gap fallback', () => {
    const data = normalizeWorkspaceDecisionDashboardResponse(createPersonalizedOverviewData(), {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    if (!data.funnelComparison) {
      throw new Error('fixture should expose funnelComparison');
    }

    data.funnelComparison = {
      ...data.funnelComparison,
      summary: 'Backend funnel summary',
      primaryBottleneck: 'Responses',
      nextAction: 'respond_faster',
    };

    render(<Probe data={data} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-funnel-comparison-summary')).toBe('Backend funnel summary');
    expect(probe.getAttribute('data-funnel-comparison-action')).toBe('Antworte schneller');
  });

  it('derives personalized funnel summary and conversion from canonical funnelComparison stages', () => {
    const data = normalizeWorkspaceDecisionDashboardResponse(createPersonalizedOverviewData(), {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    data.profileFunnel = {
      ...data.profileFunnel,
      summaryText: 'Legacy summary should not win',
      totalConversionPercent: 99,
      conversionRate: 99,
    };

    render(<Probe data={data} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-funnel-summary')).toBe('Von 58 Anfragen wurden 7 erfolgreich abgeschlossen.');
    expect(probe.getAttribute('data-funnel-conversion')).toBe('12%');
  });

  it('builds personalized funnel shape from canonical funnelComparison market stages', () => {
    const data = normalizeWorkspaceDecisionDashboardResponse(createPersonalizedOverviewData(), {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    data.profileFunnel = {
      ...data.profileFunnel,
      requestsTotal: 1,
      offersTotal: 0,
      confirmedResponsesTotal: 0,
      closedContractsTotal: 0,
      completedJobsTotal: 0,
      stages: data.profileFunnel.stages.map((stage) => ({
        ...stage,
        value: 0,
        displayValue: '0',
        widthPercent: 0,
      })),
    };

    render(<Probe data={data} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    const marketRequests = data.funnelComparison?.stages.find((stage) => stage.key === 'requests')?.marketCount ?? 0;
    const marketOffers = data.funnelComparison?.stages.find((stage) => stage.key === 'offers')?.marketCount ?? 0;
    expect(probe.getAttribute('data-funnel-requests')).toBe(String(marketRequests));
    expect(probe.getAttribute('data-funnel-offers')).toBe(String(marketOffers));
  });

  it('surfaces background refetch errors without switching the whole screen into blocking error mode', () => {
    render(
      <Probe
        data={createOverviewData()}
        isLoading={false}
        isError={false}
        hasBackgroundError
      />,
    );

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-error')).toBe('false');
    expect(probe.getAttribute('data-background-error')).toBe('true');
    expect(probe.getAttribute('data-demand-order')).toBe('cleaning,plumbing');
  });

  it('derives price context from opportunity data when legacy price intelligence is missing', () => {
    const data = createOverviewData();
    const firstOpportunity = data.opportunityRadar?.[0];
    if (!firstOpportunity) throw new Error('fixture should contain at least one opportunity');
    const dataWithoutPrice: WorkspaceStatisticsOverviewSourceDto = {
      ...data,
      priceIntelligence: {
        citySlug: null,
        city: null,
        categoryKey: null,
        category: null,
        recommendedMin: null,
        recommendedMax: null,
        marketAverage: null,
        optimalMin: null,
        optimalMax: null,
        smartRecommendedPrice: null,
        smartSignalTone: null,
        analyzedRequestsCount: null,
        confidenceLevel: null,
        recommendation: null,
        profitPotentialScore: null,
        profitPotentialStatus: null,
      },
      opportunityRadar: [
        {
          ...firstOpportunity,
          category: null,
          categoryKey: null,
        },
      ],
    };

    render(<Probe data={dataWithoutPrice} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-price-context')).toBe('Cleaning & Housekeeping · Berlin');
    expect(probe.getAttribute('data-price-range')).not.toBe('');
    expect(probe.getAttribute('data-price-average')).not.toBe('');
    expect(probe.getAttribute('data-opportunity-categories')).toBe('Cleaning & Housekeeping|Cleaning & Housekeeping');
  });

  it('filters context-sensitive sections by selected city and category', () => {
    render(
      <Probe
        data={createOverviewData()}
        isLoading={false}
        isError={false}
        filters={{
          period: '30d',
          cityId: 'berlin-id',
          categoryKey: 'cleaning',
        }}
      />,
    );

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-opportunity-order')).toBe('1,2,3');
    expect(probe.getAttribute('data-opportunity-cities')).toBe('Berlin|Mannheim|Karlsruhe');
    expect(probe.getAttribute('data-price-context')).toBe('Cleaning & Housekeeping · Berlin');
    expect(probe.getAttribute('data-context-mode')).toBe('focus');
    expect(probe.getAttribute('data-context-sticky')).toContain('Berlin');
    expect(probe.getAttribute('data-context-low-data')).toBe('false');
  });

  it('surfaces low-data context when selected scope has no direct price or opportunity match', () => {
    render(
      <Probe
        data={createOverviewData()}
        isLoading={false}
        isError={false}
        filters={{
          period: '30d',
          cityId: 'unknown-city',
          categoryKey: 'cleaning',
        }}
      />,
    );

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-opportunity-order')).toBe('');
    expect(probe.getAttribute('data-price-range')).toBe('');
    expect(probe.getAttribute('data-context-low-data')).toBe('true');
    expect(probe.getAttribute('data-decision-insight')).toContain('Erweitern');
  });

  it('keeps selected city and category available in options when backend returns sparse filter lists', () => {
    const normalized = normalizeWorkspaceDecisionDashboardResponse(createOverviewData(), {
      period: '30d',
      cityId: 'mannheim-id',
      categoryKey: 'cleaning',
    });
    const sparseOptionsData: WorkspaceStatisticsDecisionDashboardDto = {
      ...normalized,
      filterOptions: {
        ...normalized.filterOptions,
        cities: [{ value: 'berlin-id', label: 'Berlin' }],
        categories: [{ value: 'plumbing', label: 'Plumbing & Heating' }],
      },
      decisionContext: {
        ...normalized.decisionContext,
        city: {
          value: 'mannheim-id',
          label: 'Mannheim',
        },
        category: {
          value: 'cleaning',
          label: 'Cleaning & Housekeeping',
        },
      },
    };

    render(
      <NormalizedProbe
        data={sparseOptionsData}
        filters={{
          period: '30d',
          cityId: 'mannheim-id',
          categoryKey: 'cleaning',
        }}
      />,
    );

    const probe = screen.getByTestId('normalized-probe');
    expect(probe.getAttribute('data-city-options')).toContain('mannheim-id:Mannheim');
    expect(probe.getAttribute('data-category-options')).toContain('cleaning:Cleaning & Housekeeping');
  });

  it('keeps funnel hidden when backend returns zero stages for platform 24h', () => {
    const data = createOverviewData();
    const data24h: WorkspaceStatisticsOverviewSourceDto = {
      ...data,
      range: '24h',
      summary: {
        ...data.summary,
        totalPublishedRequests: 149,
      },
      profileFunnel: {
        ...data.profileFunnel,
        periodLabel: '24h',
        stage1: 0,
        stage2: 0,
        stage3: 0,
        stage4: 0,
        requestsTotal: 0,
        offersTotal: 0,
        confirmedResponsesTotal: 0,
        closedContractsTotal: 0,
        completedJobsTotal: 0,
        profitAmount: 0,
        totalConversionPercent: 0,
        conversionRate: 0,
        summaryText: 'Von 0 Anfragen wurden 0 erfolgreich abgeschlossen.',
        stages: [
          {
            id: 'requests',
            label: 'Anfragen',
            value: 0,
            displayValue: '0',
            widthPercent: 0,
            rateLabel: 'Basis',
            ratePercent: 100,
            helperText: null,
          },
          {
            id: 'offers',
            label: 'Angebote von Anbietern',
            value: 0,
            displayValue: '0',
            widthPercent: 0,
            rateLabel: 'Antwortquote',
            ratePercent: 0,
            helperText: null,
          },
          {
            id: 'confirmations',
            label: 'Bestätigte Rückmeldungen',
            value: 0,
            displayValue: '0',
            widthPercent: 0,
            rateLabel: 'Zustimmungsrate',
            ratePercent: 0,
            helperText: null,
          },
          {
            id: 'contracts',
            label: 'Geschlossene Verträge',
            value: 0,
            displayValue: '0',
            widthPercent: 0,
            rateLabel: 'Abschlussrate',
            ratePercent: 0,
            helperText: null,
          },
          {
            id: 'completed',
            label: 'Erfolgreich abgeschlossen',
            value: 0,
            displayValue: '0',
            widthPercent: 0,
            rateLabel: 'Erfüllungsquote',
            ratePercent: 0,
            helperText: null,
          },
          {
            id: 'revenue',
            label: 'Gewinnsumme',
            value: 0,
            displayValue: '0 €',
            widthPercent: 0,
            rateLabel: 'Ø Umsatz / Auftrag',
            ratePercent: null,
            helperText: '—',
          },
        ],
      },
    };

    render(<Probe data={data24h} isLoading={false} isError={false} range="24h" />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-has-funnel')).toBe('false');
    expect(probe.getAttribute('data-funnel-requests')).toBe('0');
    expect(probe.getAttribute('data-funnel-summary')).toContain('0');
  });

  it('maps compatibility user intelligence for personalized analysis mode', () => {
    render(<Probe data={createPersonalizedOverviewData()} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-user-comparison')).toBe('User vs Markt');
    expect(probe.getAttribute('data-user-position')).not.toBe('');
    expect(probe.getAttribute('data-user-actions')).toContain('Preis');
    expect(probe.getAttribute('data-funnel-requests-compare')).toBe('58||');
    expect(probe.getAttribute('data-funnel-offers-compare')).toBe('18|31%|-23 pp');
  });

  it('adds client and provider activity overlay series when private overview is available', () => {
    render(
      <Probe
        data={createPersonalizedOverviewData()}
        privateOverview={createPrivateOverview()}
        isLoading={false}
        isError={false}
      />,
    );

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-activity-client-series')).toBe('26|32');
    expect(probe.getAttribute('data-activity-provider-series')).toBe('6|12');
  });

  it('prefers backend activityComparison series over private overview fallback overlays', () => {
    const data = normalizeWorkspaceDecisionDashboardResponse(createPersonalizedOverviewData(), {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    data.activityComparison = {
      title: 'Aktivität der Plattform',
      subtitle: 'Server-defined activity comparison',
      summary: 'Server-defined activity summary',
      peakTimestamp: '2026-03-15T09:00:00.000Z',
      bestWindowTimestamp: '2026-03-16T10:00:00.000Z',
      updatedAt: '2026-03-26T19:19:00.000Z',
      hasReliableSeries: true,
      points: [
        {
          timestamp: data.activity.points[0]?.timestamp ?? '2026-03-10T09:00:00.000Z',
          clientActivity: 5,
          providerActivity: 1,
        },
        {
          timestamp: data.activity.points[1]?.timestamp ?? '2026-03-11T09:00:00.000Z',
          clientActivity: 8,
          providerActivity: 3,
        },
      ],
    };

    render(
      <Probe
        data={data}
        privateOverview={createPrivateOverview()}
        isLoading={false}
        isError={false}
      />,
    );

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-activity-title')).toBe('Aktivität der Plattform');
    expect(probe.getAttribute('data-activity-subtitle')).toBe('Server-defined activity comparison');
    expect(probe.getAttribute('data-activity-summary')).toBe('Server-defined activity summary');
    expect(probe.getAttribute('data-activity-meta-peak')).toContain('15.');
    expect(probe.getAttribute('data-activity-meta-best-window')).toContain('16.');
    expect(probe.getAttribute('data-activity-meta-updated')).toContain('26.');
    expect(probe.getAttribute('data-activity-client-series')).toBe('5|8');
    expect(probe.getAttribute('data-activity-provider-series')).toBe('1|3');
  });
});
