/** @vitest-environment happy-dom */
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type {
  WorkspaceStatisticsOverviewDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import * as workspaceApi from '@/lib/api/workspace';

vi.mock('@/lib/api/workspace', () => ({
  getWorkspaceStatistics: vi.fn(),
}));

const getWorkspaceStatisticsMock = vi.mocked(workspaceApi.getWorkspaceStatistics);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });
}

function createStatsOverview(range: WorkspaceStatisticsRange): WorkspaceStatisticsOverviewDto {
  return {
    updatedAt: '2026-03-11T10:00:00.000Z',
    mode: 'platform',
    range,
    summary: {
      totalPublishedRequests: 18,
      totalActiveProviders: 9,
      totalActiveCities: 3,
      platformRatingAvg: 4.8,
      platformRatingCount: 8,
    },
    kpis: {
      requestsTotal: 18,
      offersTotal: 11,
      completedJobsTotal: 4,
      successRate: 36,
      avgResponseMinutes: 29,
      profileCompleteness: null,
      openRequests: null,
      recentOffers7d: null,
    },
    activity: {
      range,
      interval: range === '24h' ? 'hour' : 'day',
      points: [
        { timestamp: '2026-03-10T09:00:00.000Z', requests: 4, offers: 2 },
        { timestamp: '2026-03-11T09:00:00.000Z', requests: 6, offers: 3 },
      ],
      totals: {
        requestsTotal: 10,
        offersTotal: 5,
        latestRequests: 6,
        latestOffers: 3,
        previousRequests: 4,
        previousOffers: 2,
        peakTimestamp: '2026-03-11T09:00:00.000Z',
        bestWindowTimestamp: '2026-03-11T09:00:00.000Z',
      },
      metrics: {
        offerRatePercent: 55,
        responseMedianMinutes: 29,
        unansweredRequests24h: 1,
        cancellationRatePercent: 5,
        completedJobs: 4,
        gmvAmount: 1500,
        platformRevenueAmount: 150,
        takeRatePercent: 10,
        offerRateTone: 'neutral',
        responseMedianTone: 'positive',
        unansweredTone: 'warning',
        cancellationTone: 'positive',
        completedTone: 'positive',
        revenueTone: 'positive',
      },
    },
    demand: {
      categories: [
        {
          categoryKey: 'cleaning',
          categoryName: 'Cleaning & Housekeeping',
          requestCount: 9,
          sharePercent: 50,
        },
      ],
      cities: [
        {
          citySlug: 'berlin',
          cityName: 'Berlin',
          cityId: 'berlin-id',
          requestCount: 9,
          auftragSuchenCount: 6,
          anbieterSuchenCount: 12,
          marketBalanceRatio: 2,
          signal: 'high',
          lat: 52.52,
          lng: 13.405,
        },
      ],
    },
    opportunityRadar: [
      {
        rank: 1,
        cityId: 'berlin-id',
        city: 'Berlin',
        categoryKey: 'cleaning',
        category: 'Cleaning & Housekeeping',
        demand: 12,
        providers: 6,
        marketBalanceRatio: 2,
        score: 8.2,
        demandScore: 10,
        competitionScore: 9.5,
        growthScore: 5.5,
        activityScore: 8.4,
        status: 'good',
        tone: 'high',
        summaryKey: 'good',
        metrics: [
          { key: 'demand', value: 10, semanticTone: 'very-high', semanticKey: 'very_high' },
          { key: 'competition', value: 3.2, semanticTone: 'low', semanticKey: 'low' },
          { key: 'growth', value: 5.5, semanticTone: 'medium', semanticKey: 'medium' },
          { key: 'activity', value: 8.4, semanticTone: 'very-high', semanticKey: 'very_high' },
        ],
      },
    ],
    priceIntelligence: {
      citySlug: 'berlin',
      city: 'Berlin',
      categoryKey: 'cleaning',
      category: 'Cleaning & Housekeeping',
      recommendedMin: 300,
      recommendedMax: 430,
      marketAverage: 375,
      optimalMin: 345,
      optimalMax: 400,
      smartRecommendedPrice: 375,
      smartSignalTone: 'balanced',
      analyzedRequestsCount: 126,
      confidenceLevel: 'high',
      recommendation: 'Preise im Bereich von 345 € – 400 € erzielen aktuell die höchste Abschlussrate in Berlin.',
      profitPotentialScore: 8.1,
      profitPotentialStatus: 'high',
    },
    profileFunnel: {
      periodLabel: '30 Tage',
      stage1: 18,
      stage2: 11,
      stage3: 8,
      stage4: 4,
      requestsTotal: 18,
      offersTotal: 11,
      confirmedResponsesTotal: 8,
      closedContractsTotal: 4,
      completedJobsTotal: 4,
      profitAmount: 1200,
      offerResponseRatePercent: 61,
      confirmationRatePercent: 72,
      contractClosureRatePercent: 50,
      completionRatePercent: 100,
      conversionRate: 22,
      totalConversionPercent: 22,
      summaryText: 'Von 18 Anfragen wurden 4 erfolgreich abgeschlossen.',
      stages: [],
    },
    insights: [],
    growthCards: [],
  };
}

type StatsHook = (args: { locale: 'de' }) => {
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  isLoading: boolean;
  isError: boolean;
  cityRows: Array<unknown>;
  opportunityRadar: Array<unknown>;
  priceIntelligence: { contextLabel: string | null };
};

function createProbe(useWorkspaceStatisticsModel: StatsHook) {
  return function Probe() {
    const model = useWorkspaceStatisticsModel({ locale: 'de' });
    return (
      <div>
        <div
          data-testid="probe"
          data-range={model.range}
          data-loading={String(model.isLoading)}
          data-error={String(model.isError)}
          data-city-count={String(model.cityRows.length)}
          data-opportunity-count={String(model.opportunityRadar.length)}
          data-price-context={model.priceIntelligence.contextLabel ?? ''}
        />
        <button type="button" onClick={() => model.setRange('7d')}>set-7d</button>
        <button type="button" onClick={() => model.setRange('90d')}>set-90d</button>
      </div>
    );
  };
}

afterEach(() => {
  cleanup();
});

describe('useWorkspaceStatisticsModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads statistics from BFF and refetches by selected range', async () => {
    getWorkspaceStatisticsMock
      .mockResolvedValueOnce(createStatsOverview('30d'))
      .mockResolvedValueOnce(createStatsOverview('7d'))
      .mockResolvedValueOnce(createStatsOverview('90d'));

    const { useWorkspaceStatisticsModel } = await import('./useWorkspaceStatisticsModel');
    const Probe = createProbe(useWorkspaceStatisticsModel as StatsHook);
    const queryClient = createQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Probe />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('probe').getAttribute('data-loading')).toBe('false');
    });
    expect(getWorkspaceStatisticsMock).toHaveBeenNthCalledWith(1, {
      range: '30d',
      cityId: null,
      categoryKey: null,
    });
    expect(screen.getByTestId('probe').getAttribute('data-price-context')).toContain('Berlin');

    fireEvent.click(screen.getByRole('button', { name: 'set-7d' }));

    await waitFor(() => {
      expect(getWorkspaceStatisticsMock).toHaveBeenNthCalledWith(2, {
        range: '7d',
        cityId: null,
        categoryKey: null,
      });
    });
    expect(screen.getByTestId('probe').getAttribute('data-range')).toBe('7d');

    fireEvent.click(screen.getByRole('button', { name: 'set-90d' }));

    await waitFor(() => {
      expect(getWorkspaceStatisticsMock).toHaveBeenNthCalledWith(3, {
        range: '90d',
        cityId: null,
        categoryKey: null,
      });
    });
    expect(screen.getByTestId('probe').getAttribute('data-range')).toBe('90d');
  });

  it('surfaces error state when BFF request fails', async () => {
    getWorkspaceStatisticsMock.mockRejectedValueOnce(new Error('failed'));

    const { useWorkspaceStatisticsModel } = await import('./useWorkspaceStatisticsModel');
    const Probe = createProbe(useWorkspaceStatisticsModel as StatsHook);
    const queryClient = createQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Probe />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('probe').getAttribute('data-loading')).toBe('false');
      expect(screen.getByTestId('probe').getAttribute('data-error')).toBe('true');
    });
    expect(getWorkspaceStatisticsMock).toHaveBeenCalledTimes(1);
  });
});
