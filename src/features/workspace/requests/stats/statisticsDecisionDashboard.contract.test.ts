import { describe, expect, it } from 'vitest';

import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import { normalizeWorkspaceDecisionDashboardResponse } from './statisticsDecisionDashboard.contract';
import { workspaceStatisticsDecisionDashboardSchema } from './workspaceStatisticsDecisionDashboard.schema';

function createPayload(): WorkspaceStatisticsOverviewSourceDto {
  return {
    __source: 'bff',
    updatedAt: '2026-03-15T10:00:00.000Z',
    mode: 'platform',
    range: '30d',
    summary: {
      totalPublishedRequests: 24,
      totalActiveProviders: 9,
      totalActiveCities: 3,
      platformRatingAvg: 4.6,
      platformRatingCount: 12,
    },
    kpis: {
      requestsTotal: 24,
      offersTotal: 11,
      completedJobsTotal: 5,
      successRate: 21,
      avgResponseMinutes: 40,
      profileCompleteness: null,
      openRequests: null,
      recentOffers7d: null,
    },
    activity: {
      range: '30d',
      interval: 'day',
      points: [],
      totals: {
        requestsTotal: 11,
        offersTotal: 6,
        latestRequests: 6,
        latestOffers: 4,
        previousRequests: 5,
        previousOffers: 2,
        peakTimestamp: '2026-03-14T09:00:00.000Z',
        bestWindowTimestamp: '2026-03-14T09:00:00.000Z',
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
          auftragSuchenCount: 4,
          anbieterSuchenCount: 4,
          marketBalanceRatio: 1,
          signal: 'medium',
          lat: 49.4875,
          lng: 8.466,
        },
      ],
    },
    opportunityRadar: [
      {
        rank: 2,
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
      stages: [],
    },
    insights: [],
    growthCards: [],
  };
}

describe('normalizeWorkspaceDecisionDashboardResponse', () => {
  it('trusts backend decision dashboard fields when the full contract is already present', () => {
    const payload = {
      ...createPayload(),
      decisionContext: {
        mode: 'focus',
        period: '30d',
        city: { value: 'berlin-id', label: 'Berlin' },
        region: { value: null, label: 'Alle Regionen' },
        category: { value: 'cleaning', label: 'Cleaning & Housekeeping' },
        service: { value: null, label: 'Alle Services' },
        scopeLabel: 'Berlin · Cleaning & Housekeeping',
        title: 'Berlin · Cleaning & Housekeeping',
        subtitle: 'Server generated context.',
        stickyLabel: '30 Tage · Berlin · Cleaning & Housekeeping',
        health: [
          { key: 'demand', value: 'rising', tone: 'positive' },
          { key: 'competition', value: 'high', tone: 'warning' },
          { key: 'activity', value: 'stable', tone: 'neutral' },
        ],
        lowData: { isLowData: false, title: null, body: null },
      },
      filterOptions: {
        cities: [{ value: 'berlin-id', label: 'Berlin' }],
        categories: [{ value: 'cleaning', label: 'Cleaning & Housekeeping' }],
        services: [{ value: 'home_cleaning', label: 'Home cleaning' }],
      },
      sectionMeta: {
        opportunityTitle: 'Opportunity Radar für Berlin',
      },
      exportMeta: {
        filename: 'server-generated.csv',
      },
    } satisfies WorkspaceStatisticsOverviewSourceDto;

    const result = normalizeWorkspaceDecisionDashboardResponse(payload, {
      period: '30d',
      cityId: 'berlin-id',
      categoryKey: 'cleaning',
    });

    expect(result).toBe(payload);
    expect(result.decisionContext.subtitle).toBe('Server generated context.');
    expect(result.exportMeta.filename).toBe('server-generated.csv');
  });

  it('builds fallback decision context and filter options from legacy payload', () => {
    const result = normalizeWorkspaceDecisionDashboardResponse(createPayload(), {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    expect(result.filterOptions.cities.map((item) => item.value)).toEqual(['berlin-id', 'mannheim-id']);
    expect(result.filterOptions.categories.map((item) => item.value)).toEqual(['cleaning', 'plumbing']);
    expect(result.decisionContext.mode).toBe('global');
    expect(result.decisionContext.city.label).toBe('Alle Städte');
    expect(result.decisionContext.category.label).toBe('Alle Kategorien');
    expect(result.decisionContext.health).toHaveLength(3);
    expect(result.exportMeta.filename).toContain('workspace-statistics-30d');
    expect(() => workspaceStatisticsDecisionDashboardSchema.parse(result)).not.toThrow();
  });

  it('scopes legacy sections to the selected focus when backend context is absent', () => {
    const result = normalizeWorkspaceDecisionDashboardResponse(createPayload(), {
      period: '30d',
      cityId: 'berlin-id',
      categoryKey: 'cleaning',
    });

    expect(result.decisionContext.mode).toBe('focus');
    expect(result.decisionContext.city.label).toBe('Berlin');
    expect(result.decisionContext.category.label).toBe('Cleaning & Housekeeping');
    expect(result.demand.categories).toHaveLength(1);
    expect(result.demand.cities).toHaveLength(1);
    expect(result.opportunityRadar).toHaveLength(1);
    expect(result.priceIntelligence?.city).toBe('Berlin');
    expect(result.priceIntelligence?.categoryKey).toBe('cleaning');
    expect(() => workspaceStatisticsDecisionDashboardSchema.parse(result)).not.toThrow();
  });
});
