import { describe, expect, it } from 'vitest';

import type {
  WorkspaceStatisticsActivityPointDto,
  WorkspaceStatisticsInsightDto,
} from '@/lib/api/dto/workspace';
import {
  buildInsightsFromFallback,
  buildSupplementalInsights,
  clampPercent,
  formatPercent,
  normalizeLegacyRange,
  resolveCitySignal,
  resolveMarketBalanceRatio,
  toActivityTotals,
  toFallbackActivityMetrics,
  toHint,
  toTrend,
} from './statisticsModel.mappers';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';

describe('statisticsModel.mappers', () => {
  it('normalizes legacy range for platform activity API', () => {
    expect(normalizeLegacyRange('24h')).toBe('24h');
    expect(normalizeLegacyRange('7d')).toBe('7d');
    expect(normalizeLegacyRange('30d')).toBe('30d');
    expect(normalizeLegacyRange('90d')).toBe('30d');
  });

  it('clamps percent and formats percent safely', () => {
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(44.6)).toBe(45);
    expect(clampPercent(999)).toBe(100);
    expect(formatPercent(Number.NaN)).toBe('0%');
    expect(formatPercent(13.2)).toBe('13%');
  });

  it('builds trend hint and trend direction for KPI deltas', () => {
    expect(toHint(12, 0, '7d', 'de')).toContain('neu');
    expect(toHint(10, 14, '30d', 'de')).toContain('seit letzter Periode');
    expect(toTrend(20, 10)).toEqual({ direction: 'up', percent: 100 });
    expect(toTrend(10, 20)).toEqual({ direction: 'down', percent: -50 });
    expect(toTrend(0, 0)).toEqual({ direction: 'flat', percent: 0 });
  });

  it('computes city signal and market balance ratio', () => {
    expect(resolveCitySignal({ requestCount: 10, auftragSuchenCount: 3, anbieterSuchenCount: 9 })).toBe('high');
    expect(resolveCitySignal({ requestCount: 2, auftragSuchenCount: 10, anbieterSuchenCount: 2 })).toBe('low');
    expect(resolveCitySignal({ requestCount: 0, auftragSuchenCount: 0, anbieterSuchenCount: 0 })).toBe('none');
    expect(resolveMarketBalanceRatio({ requestCount: 6, auftragSuchenCount: 3, anbieterSuchenCount: 6 })).toBe(2);
  });

  it('builds activity totals and fallback metrics', () => {
    const points: WorkspaceStatisticsActivityPointDto[] = [
      { timestamp: '2026-03-01T10:00:00.000Z', requests: 2, offers: 1 },
      { timestamp: '2026-03-02T10:00:00.000Z', requests: 8, offers: 4 },
      { timestamp: '2026-03-03T10:00:00.000Z', requests: 3, offers: 2 },
    ];
    const totals = toActivityTotals(points);
    expect(totals.requestsTotal).toBe(13);
    expect(totals.offersTotal).toBe(7);
    expect(totals.latestRequests).toBe(3);
    expect(totals.previousRequests).toBe(8);
    expect(totals.peakTimestamp).toBe('2026-03-02T10:00:00.000Z');
    expect(totals.bestWindowTimestamp).toBe('2026-03-02T10:00:00.000Z');

    const metrics = toFallbackActivityMetrics({ totals, completedJobs: 5, takeRatePercent: 12 });
    expect(metrics.offerRatePercent).toBe(54);
    expect(metrics.completedJobs).toBe(5);
    expect(metrics.takeRatePercent).toBe(12);
    expect(metrics.offerRateTone).toBe('neutral');
    expect(metrics.completedTone).toBe('positive');
  });

  it('builds fallback insights and truncates list to four', () => {
    const insights = buildInsightsFromFallback({
      mode: 'personalized',
      profileCompleteness: 60,
      successRate: 10,
      avgResponseMinutes: 45,
      topCategoryName: 'Cleaning',
      topCityName: 'Berlin',
    });

    expect(insights).toHaveLength(4);
    const codes = insights.map((item) => item.code);
    expect(codes).toContain('profile_incomplete');
    expect(codes).toContain('low_success_rate');
    expect(codes).toContain('slow_response_time');
  });

  it('builds supplemental insights with market chance signal', () => {
    const data = {
      __source: 'bff',
      updatedAt: '2026-03-11T10:00:00.000Z',
      mode: 'platform',
      range: '30d',
      summary: {
        totalPublishedRequests: 10,
        totalActiveProviders: 5,
        totalActiveCities: 2,
        platformRatingAvg: 5,
        platformRatingCount: 2,
      },
      kpis: {
        requestsTotal: 10,
        offersTotal: 8,
        completedJobsTotal: 3,
        successRate: 72,
        avgResponseMinutes: 20,
        profileCompleteness: null,
        openRequests: null,
        recentOffers7d: null,
      },
      activity: {
        range: '30d',
        interval: 'day',
        points: [],
        totals: {
          requestsTotal: 10,
          offersTotal: 8,
          latestRequests: 4,
          latestOffers: 3,
          previousRequests: 3,
          previousOffers: 2,
          peakTimestamp: null,
          bestWindowTimestamp: null,
        },
        metrics: {
          offerRatePercent: 80,
          responseMedianMinutes: 20,
          unansweredRequests24h: 1,
          cancellationRatePercent: 3,
          completedJobs: 3,
          gmvAmount: 1000,
          platformRevenueAmount: 100,
          takeRatePercent: 10,
          offerRateTone: 'positive',
          responseMedianTone: 'positive',
          unansweredTone: 'warning',
          cancellationTone: 'positive',
          completedTone: 'positive',
          revenueTone: 'positive',
        },
      },
      demand: {
        categories: [{ categoryKey: 'cleaning', categoryName: 'Cleaning', requestCount: 7, sharePercent: 70 }],
        cities: [{
          citySlug: 'berlin',
          cityName: 'Berlin',
          cityId: 'berlin-id',
          requestCount: 7,
          lat: 52.52,
          lng: 13.405,
          auftragSuchenCount: 2,
          anbieterSuchenCount: 6,
        }],
      },
      profileFunnel: {
        periodLabel: '30 Tage',
        stage1: 10,
        stage2: 8,
        stage3: 5,
        stage4: 3,
        requestsTotal: 10,
        offersTotal: 8,
        confirmedResponsesTotal: 5,
        closedContractsTotal: 3,
        completedJobsTotal: 3,
        profitAmount: 200,
        offerResponseRatePercent: 80,
        confirmationRatePercent: 62,
        contractClosureRatePercent: 60,
        completionRatePercent: 100,
        conversionRate: 30,
        totalConversionPercent: 30,
        summaryText: 'summary',
        stages: [],
      },
      insights: [] as WorkspaceStatisticsInsightDto[],
      growthCards: [],
    } satisfies WorkspaceStatisticsOverviewSourceDto;

    const supplemental = buildSupplementalInsights({ data, mode: 'personalized' });
    const codes = supplemental.map((item) => item.code);
    expect(codes).toContain('top_category_demand');
    expect(codes).toContain('top_city_demand');
    expect(codes).toContain('best_market_chance');
    expect(codes).toContain('high_completion_rate');
  });
});
