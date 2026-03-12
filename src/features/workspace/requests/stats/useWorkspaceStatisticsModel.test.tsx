/** @vitest-environment happy-dom */
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { ReviewOverviewDto } from '@/lib/api/dto/reviews';
import type {
  WorkspacePublicOverviewDto,
  WorkspaceStatisticsOverviewDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import * as analyticsApi from '@/lib/api/analytics';
import * as reviewsApi from '@/lib/api/reviews';
import * as workspaceApi from '@/lib/api/workspace';
import * as tokenApi from '@/lib/auth/token';

vi.mock('@/lib/api/workspace', () => ({
  getWorkspaceStatistics: vi.fn(),
  getWorkspacePublicOverview: vi.fn(),
  getWorkspacePrivateOverview: vi.fn(),
}));

vi.mock('@/lib/api/analytics', () => ({
  getPlatformActivity: vi.fn(),
}));

vi.mock('@/lib/api/reviews', () => ({
  getPlatformReviewsOverview: vi.fn(),
}));

vi.mock('@/lib/auth/token', () => ({
  getAccessToken: vi.fn(),
}));

const getWorkspaceStatisticsMock = vi.mocked(workspaceApi.getWorkspaceStatistics);
const getWorkspacePublicOverviewMock = vi.mocked(workspaceApi.getWorkspacePublicOverview);
const getWorkspacePrivateOverviewMock = vi.mocked(workspaceApi.getWorkspacePrivateOverview);
const getPlatformActivityMock = vi.mocked(analyticsApi.getPlatformActivity);
const getPlatformReviewsOverviewMock = vi.mocked(reviewsApi.getPlatformReviewsOverview);
const getAccessTokenMock = vi.mocked(tokenApi.getAccessToken);

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

function createPublicOverview(range: WorkspaceStatisticsRange): WorkspacePublicOverviewDto {
  return {
    updatedAt: '2026-03-11T10:00:00.000Z',
    summary: {
      totalPublishedRequests: 12,
      totalActiveProviders: 7,
    },
    activity: {
      range,
      interval: range === '24h' ? 'hour' : 'day',
      source: 'real',
      data: [
        { timestamp: '2026-03-10T09:00:00.000Z', requests: 2, offers: 1 },
        { timestamp: '2026-03-11T09:00:00.000Z', requests: 3, offers: 2 },
      ],
      updatedAt: '2026-03-11T10:00:00.000Z',
    },
    cityActivity: {
      totalActiveCities: 2,
      totalActiveRequests: 12,
      items: [
        {
          citySlug: 'berlin',
          cityName: 'Berlin',
          cityId: 'berlin-id',
          requestCount: 7,
          lat: 52.52,
          lng: 13.405,
        },
        {
          citySlug: 'hamburg',
          cityName: 'Hamburg',
          cityId: 'hamburg-id',
          requestCount: 5,
          lat: 53.5511,
          lng: 9.9937,
        },
      ],
    },
    requests: {
      items: [],
      total: 0,
      page: 1,
      limit: 80,
    },
  };
}

function createReviewsOverview(): ReviewOverviewDto {
  return {
    items: [],
    total: 1,
    limit: 1,
    offset: 0,
    summary: {
      total: 1,
      averageRating: 5,
      distribution: {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 1,
      },
    },
  };
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
  cityRows: Array<unknown>;
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
          data-city-count={String(model.cityRows.length)}
        />
        <button type="button" onClick={() => model.setRange('7d')}>set-7d</button>
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
    delete process.env.NEXT_PUBLIC_WORKSPACE_STATS_BFF;

    getWorkspacePublicOverviewMock.mockImplementation(async (params) =>
      createPublicOverview((params?.activityRange ?? '30d') as WorkspaceStatisticsRange),
    );
    getPlatformActivityMock.mockImplementation(async (range) => ({
      range,
      interval: range === '24h' ? 'hour' : 'day',
      source: 'real',
      data: [{ timestamp: '2026-03-11T09:00:00.000Z', requests: 3, offers: 2 }],
      updatedAt: '2026-03-11T10:00:00.000Z',
    }));
    getPlatformReviewsOverviewMock.mockResolvedValue(createReviewsOverview());
    getWorkspacePrivateOverviewMock.mockResolvedValue(null as never);
    getAccessTokenMock.mockReturnValue(null);
  });

  it.each([404, 405, 501])(
    'falls back on BFF status %s and keeps BFF disabled after range change',
    async (statusCode) => {
      getWorkspaceStatisticsMock.mockRejectedValue({ status: statusCode });

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

      expect(getWorkspaceStatisticsMock).toHaveBeenCalledTimes(1);
      expect(getWorkspaceStatisticsMock).toHaveBeenCalledWith('30d');

      fireEvent.click(screen.getByRole('button', { name: 'set-7d' }));

      await waitFor(() => {
        expect(screen.getByTestId('probe').getAttribute('data-range')).toBe('7d');
      });
      await waitFor(() => {
        expect(getWorkspaceStatisticsMock).toHaveBeenCalledTimes(1);
      });

      const hasFallbackRequestForNewRange = getWorkspacePublicOverviewMock.mock.calls.some(
        ([params]) => params?.activityRange === '7d' && params?.limit === 80,
      );
      expect(hasFallbackRequestForNewRange).toBe(true);
    },
  );

  it('uses BFF again for next range when endpoint responds successfully', async () => {
    getWorkspaceStatisticsMock
      .mockResolvedValueOnce(createStatsOverview('30d'))
      .mockResolvedValueOnce(createStatsOverview('7d'));

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
    expect(getWorkspaceStatisticsMock).toHaveBeenCalledWith('30d');

    fireEvent.click(screen.getByRole('button', { name: 'set-7d' }));

    await waitFor(() => {
      expect(getWorkspaceStatisticsMock).toHaveBeenCalledWith('7d');
    });
    expect(getWorkspaceStatisticsMock).toHaveBeenCalledTimes(2);
  });
});
