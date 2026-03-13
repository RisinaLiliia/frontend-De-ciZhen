/** @vitest-environment happy-dom */
import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import { useWorkspaceStatsViewModel } from './useWorkspaceStatsViewModel';

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
      stages: [],
    },
    insights: [],
    growthCards: [],
  };
}

function Probe({
  data,
  isLoading,
  isError,
}: {
  data: WorkspaceStatisticsOverviewSourceDto | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const model = useWorkspaceStatsViewModel({
    locale: 'de',
    range: '30d',
    setRange: () => undefined,
    data,
    isLoading,
    isError,
  });

  return (
    <div
      data-testid="probe"
      data-loading={String(model.isLoading)}
      data-error={String(model.isError)}
      data-demand-order={model.demandRows.map((row) => row.categoryKey).join(',')}
      data-opportunity-order={model.opportunityRadar.map((row) => row.rank).join(',')}
      data-opportunity-categories={model.opportunityRadar.map((row) => row.category).join('|')}
      data-first-opportunity-href={model.opportunityRadar[0]?.href ?? ''}
      data-price-context={model.priceIntelligence.contextLabel ?? ''}
      data-price-range={model.priceIntelligence.recommendedRangeLabel ?? ''}
      data-price-average={model.priceIntelligence.marketAverageLabel ?? ''}
    />
  );
}

describe('useWorkspaceStatsViewModel', () => {
  it('maps and sorts demand/opportunity sections from backend dto', () => {
    render(<Probe data={createOverviewData()} isLoading={false} isError={false} />);

    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-demand-order')).toBe('cleaning,plumbing');
    expect(probe.getAttribute('data-opportunity-order')).toBe('1,2,3');
    expect(probe.getAttribute('data-opportunity-categories')).toContain('Generalistisch');
    expect(probe.getAttribute('data-first-opportunity-href')).toContain('cityId=berlin-id');
    expect(probe.getAttribute('data-first-opportunity-href')).toContain('categoryKey=cleaning');
    expect(probe.getAttribute('data-price-context')).toBe('Cleaning & Housekeeping · Berlin');
    expect(probe.getAttribute('data-price-range')).toContain('65');
    expect(probe.getAttribute('data-price-range')).toContain('90');
    expect(probe.getAttribute('data-price-average')).toContain('78');
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

  it('formats range and average labels as empty when price data is missing', () => {
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
    expect(probe.getAttribute('data-price-context')).toBe('');
    expect(probe.getAttribute('data-price-range')).toBe('');
    expect(probe.getAttribute('data-price-average')).toBe('');
    expect(probe.getAttribute('data-opportunity-categories')).toBe('Generalistisch');
  });
});
