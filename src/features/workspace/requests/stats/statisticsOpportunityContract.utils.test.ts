import { describe, expect, it } from 'vitest';

import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import { ensureStatisticsOpportunityContract } from './statisticsOpportunityContract.utils';

function createSourcePayload(): WorkspaceStatisticsOverviewSourceDto {
  return {
    __source: 'fallback',
    updatedAt: '2026-03-14T10:00:00.000Z',
    mode: 'platform',
    range: '30d',
    summary: {
      totalPublishedRequests: 149,
      totalActiveProviders: 44,
      totalActiveCities: 12,
      platformRatingAvg: 4.8,
      platformRatingCount: 126,
    },
    kpis: {
      requestsTotal: 149,
      offersTotal: 99,
      completedJobsTotal: 38,
      successRate: 26,
      avgResponseMinutes: 18,
      profileCompleteness: null,
      openRequests: null,
      recentOffers7d: null,
    },
    activity: {
      range: '30d',
      interval: 'day',
      points: [],
      totals: {
        requestsTotal: 149,
        offersTotal: 99,
        latestRequests: 48,
        latestOffers: 31,
        previousRequests: 44,
        previousOffers: 28,
        peakTimestamp: null,
        bestWindowTimestamp: null,
      },
      metrics: {
        offerRatePercent: 70,
        responseMedianMinutes: 18,
        unansweredRequests24h: 56,
        cancellationRatePercent: 7,
        completedJobs: 38,
        gmvAmount: 15200,
        platformRevenueAmount: 1520,
        takeRatePercent: 10,
        offerRateTone: 'positive',
        responseMedianTone: 'positive',
        unansweredTone: 'warning',
        cancellationTone: 'neutral',
        completedTone: 'positive',
        revenueTone: 'positive',
      },
    },
    demand: {
      categories: [
        {
          categoryKey: 'cleaning',
          categoryName: 'Cleaning & Housekeeping',
          requestCount: 126,
          sharePercent: 22,
        },
      ],
      cities: [
        {
          citySlug: 'berlin',
          cityName: 'Berlin',
          cityId: 'berlin-id',
          requestCount: 126,
          auftragSuchenCount: 1,
          anbieterSuchenCount: 126,
          marketBalanceRatio: 3,
          signal: 'high',
          lat: 52.52,
          lng: 13.405,
        },
        {
          citySlug: 'bremen',
          cityName: 'Bremen',
          cityId: 'bremen-id',
          requestCount: 30,
          auftragSuchenCount: 12,
          anbieterSuchenCount: 30,
          marketBalanceRatio: 1.2,
          signal: 'medium',
          lat: 53.0793,
          lng: 8.8017,
        },
      ],
    },
    profileFunnel: {
      periodLabel: '30 Tage',
      stage1: 149,
      stage2: 99,
      stage3: 69,
      stage4: 38,
      requestsTotal: 149,
      offersTotal: 99,
      confirmedResponsesTotal: 69,
      closedContractsTotal: 50,
      completedJobsTotal: 38,
      profitAmount: 1520,
      offerResponseRatePercent: 68,
      confirmationRatePercent: 70,
      contractClosureRatePercent: 72,
      completionRatePercent: 76,
      conversionRate: 26,
      totalConversionPercent: 26,
      summaryText: 'Von 149 Anfragen wurden 38 erfolgreich abgeschlossen.',
      stages: [],
    },
    insights: [],
    growthCards: [],
  };
}

describe('ensureStatisticsOpportunityContract', () => {
  it('derives backend-style price intelligence fields when missing from payload', () => {
    const payload = createSourcePayload();

    const result = ensureStatisticsOpportunityContract(payload);
    const priceIntelligence = result.priceIntelligence;
    const opportunityRadar = result.opportunityRadar ?? [];

    expect(opportunityRadar).toHaveLength(2);
    expect(opportunityRadar[0]?.peerContext?.reason).toBe('top_ranked');
    expect(opportunityRadar[0]?.priceIntelligence?.city).toBe('Berlin');
    expect(priceIntelligence).toBeDefined();
    expect(priceIntelligence?.city).toBe('Berlin');
    expect(priceIntelligence?.category).toBe('Cleaning & Housekeeping');
    expect(priceIntelligence?.recommendedMin).toBe(385);
    expect(priceIntelligence?.recommendedMax).toBe(495);
    expect(priceIntelligence?.marketAverage).toBe(440);
    expect(priceIntelligence?.optimalMin).toBe(420);
    expect(priceIntelligence?.optimalMax).toBe(460);
    expect(priceIntelligence?.smartRecommendedPrice).toBe(440);
    expect(priceIntelligence?.smartSignalTone).toBe('balanced');
    expect(priceIntelligence?.analyzedRequestsCount).toBe(137);
    expect(priceIntelligence?.confidenceLevel).toBe('high');
    expect(priceIntelligence?.profitPotentialStatus).toBe('high');
  });
});
