import { describe, expect, it } from 'vitest';

import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import { hydrateAuthenticatedStatisticsPayload } from './statisticsAuthenticatedPayload.utils';
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
        {
          citySlug: 'karlsruhe',
          cityName: 'Karlsruhe',
          cityId: 'karlsruhe-id',
          requestCount: 8,
          auftragSuchenCount: 3,
          anbieterSuchenCount: 8,
          marketBalanceRatio: 2.67,
          signal: 'high',
          lat: 49.0069,
          lng: 8.4037,
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
      {
        rank: 3,
        cityId: 'karlsruhe-id',
        city: 'Karlsruhe',
        categoryKey: 'cleaning',
        category: 'Cleaning & Housekeeping',
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
      stages: [],
    },
    insights: [],
    growthCards: [],
  };
}

function createPrivateOverview(): WorkspacePrivateOverviewDto {
  return {
    updatedAt: '2026-03-15T10:00:00.000Z',
    user: {
      userId: 'user-1',
      role: 'provider',
    },
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
    providerMonthlySeries: [],
    clientMonthlySeries: [],
  };
}

describe('normalizeWorkspaceDecisionDashboardResponse', () => {
  it('does not synthesize personalized funnel data from private overview when backend has not sent a contextual personalized contract', () => {
    const hydrated = hydrateAuthenticatedStatisticsPayload({
      payload: createPayload() as unknown as import('@/lib/api/dto/workspace').WorkspaceStatisticsOverviewDto,
      privateOverview: createPrivateOverview(),
    });

    expect(hydrated).toEqual(createPayload());
  });

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
    const opportunityRadar = result.opportunityRadar ?? [];

    expect(result.decisionContext.subtitle).toBe('Server generated context.');
    expect(result.exportMeta.filename).toBe('server-generated.csv');
    expect(opportunityRadar[0]?.priceIntelligence?.city).toBe('Berlin');
    expect(opportunityRadar[1]?.peerContext?.reason).toBe('nearby_competitor');
  });

  it('builds fallback decision context and filter options from legacy payload', () => {
    const result = normalizeWorkspaceDecisionDashboardResponse(createPayload(), {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    expect(result.filterOptions.cities.map((item) => item.value)).toEqual(['berlin-id', 'karlsruhe-id', 'mannheim-id']);
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
    const opportunityRadar = result.opportunityRadar ?? [];

    expect(result.decisionContext.mode).toBe('focus');
    expect(result.decisionContext.city.label).toBe('Berlin');
    expect(result.decisionContext.category.label).toBe('Cleaning & Housekeeping');
    expect(result.demand.categories).toHaveLength(1);
    expect(result.demand.cities).toHaveLength(1);
    expect(opportunityRadar).toHaveLength(3);
    expect(opportunityRadar.map((item) => item.city)).toEqual(['Berlin', 'Mannheim', 'Karlsruhe']);
    expect(opportunityRadar[0]?.peerContext?.reason).toBe('selected_city');
    expect(result.priceIntelligence?.city).toBe('Berlin');
    expect(result.priceIntelligence?.categoryKey).toBe('cleaning');
    expect(() => workspaceStatisticsDecisionDashboardSchema.parse(result)).not.toThrow();
  });

  it('adds compatibility user intelligence for personalized payloads when backend has not sent it yet', () => {
    const personalized = createPayload();
    personalized.mode = 'personalized';
    personalized.kpis.requestsTotal = 58;
    personalized.kpis.offersTotal = 18;
    personalized.kpis.completedJobsTotal = 7;
    personalized.kpis.successRate = 39;
    personalized.kpis.avgResponseMinutes = 930;
    personalized.kpis.profileCompleteness = 62;
    personalized.kpis.openRequests = 28;
    personalized.kpis.recentOffers7d = 3;
    personalized.profileFunnel.requestsTotal = 58;
    personalized.profileFunnel.offersTotal = 18;
    personalized.profileFunnel.confirmedResponsesTotal = 11;
    personalized.profileFunnel.completedJobsTotal = 7;
    personalized.profileFunnel.profitAmount = 3150;
    personalized.profileFunnel.confirmationRatePercent = 61;

    const normalized = normalizeWorkspaceDecisionDashboardResponse(personalized, {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    expect(normalized.userIntelligence?.formulaMetrics).toHaveLength(8);
    expect(normalized.userIntelligence?.decisionMetrics).toHaveLength(3);
    expect(normalized.userIntelligence?.signals.length).toBeGreaterThan(0);
    expect(normalized.userIntelligence?.signals.some((item) => item.code === 'slow_response')).toBe(true);
    expect(normalized.userIntelligence?.signals.some((item) => item.actionCode === 'respond_faster')).toBe(true);
    expect(normalized.decisionLayer?.metrics).toHaveLength(6);
    expect(normalized.decisionLayer?.primaryAction?.code).toBeTruthy();
    expect(normalized.personalizedPricing?.position).toBeTruthy();
    expect(normalized.categoryFit?.items.length).toBeGreaterThan(0);
    expect(normalized.cityComparison?.items.length).toBeGreaterThan(0);
    expect(normalized.funnelComparison?.stages).toHaveLength(5);
    expect(normalized.funnelComparison?.summary).toContain('Du verlierst aktuell');
    expect(normalized.funnelComparison?.largestDropOffStage).toBeTruthy();
    expect(normalized.funnelComparison?.nextAction).toBeTruthy();
    expect(normalized.userIntelligence?.performancePosition.percentile).not.toBeNull();
    expect(normalized.userIntelligence?.risks.length).toBeGreaterThan(0);
    expect(normalized.userIntelligence?.opportunities.length).toBeGreaterThan(0);
    expect(normalized.userIntelligence?.nextSteps.length).toBeGreaterThan(0);
    expect(() => workspaceStatisticsDecisionDashboardSchema.parse(normalized)).not.toThrow();
  });

  it('aligns decision layer offer rate and completed jobs with canonical funnel comparison values', () => {
    const personalized = createPayload();
    personalized.mode = 'personalized';
    personalized.decisionLayer = {
      title: 'Decision Layer',
      subtitle: 'Server section',
      metrics: [
        {
          id: 'offer_rate',
          label: 'Angebotsquote',
          marketValue: 12,
          userValue: 99,
          gapAbsolute: 87,
          gapPercent: 87,
          unit: 'percent',
          direction: 'better',
          status: 'good',
          signalCodes: [],
          primaryActionCode: null,
          summary: 'Old values',
        },
        {
          id: 'completed_jobs',
          label: 'Abgeschlossene Aufträge',
          marketValue: 999,
          userValue: 888,
          gapAbsolute: -111,
          gapPercent: null,
          unit: 'count',
          direction: 'neutral',
          status: 'neutral',
          signalCodes: [],
          primaryActionCode: null,
          summary: 'Old values',
        },
      ],
      primaryInsight: 'Insight',
      primaryAction: null,
    };
    personalized.funnelComparison = {
      comparisonLabel: 'User vs Markt',
      summary: 'Canonical funnel',
      largestGapStage: 'offers',
      largestDropOffStage: 'responses',
      primaryBottleneck: 'Responses',
      nextAction: 'respond_faster',
      stages: [
        {
          key: 'requests',
          label: 'Requests',
          marketCount: 79,
          userCount: 3,
          marketRateFromPrev: 100,
          userRateFromPrev: 100,
          gapRate: 0,
          status: 'at_market',
          dropOffSeverity: null,
          recommendation: null,
        },
        {
          key: 'offers',
          label: 'Offers',
          marketCount: 53,
          userCount: 2,
          marketRateFromPrev: 67,
          userRateFromPrev: 100,
          gapRate: 33,
          status: 'above_market',
          dropOffSeverity: 'low',
          recommendation: null,
        },
        {
          key: 'responses',
          label: 'Responses',
          marketCount: 24,
          userCount: 0,
          marketRateFromPrev: 45,
          userRateFromPrev: 0,
          gapRate: -45,
          status: 'below_market',
          dropOffSeverity: 'high',
          recommendation: 'respond_faster',
        },
        {
          key: 'contracts',
          label: 'Contracts',
          marketCount: 19,
          userCount: 0,
          marketRateFromPrev: 79,
          userRateFromPrev: null,
          gapRate: null,
          status: 'insufficient_data',
          dropOffSeverity: null,
          recommendation: null,
        },
        {
          key: 'completed',
          label: 'Completed',
          marketCount: 18,
          userCount: 0,
          marketRateFromPrev: 95,
          userRateFromPrev: null,
          gapRate: null,
          status: 'insufficient_data',
          dropOffSeverity: null,
          recommendation: null,
        },
      ],
    };

    const normalized = normalizeWorkspaceDecisionDashboardResponse(personalized, {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    const offerRate = normalized.decisionLayer?.metrics.find((metric) => metric.id === 'offer_rate');
    const completedJobs = normalized.decisionLayer?.metrics.find((metric) => metric.id === 'completed_jobs');

    expect(offerRate?.marketValue).toBe(67);
    expect(offerRate?.userValue).toBe(100);
    expect(offerRate?.gapPercent).toBe(33);
    expect(completedJobs?.marketValue).toBe(18);
    expect(completedJobs?.userValue).toBe(0);
    expect(completedJobs?.gapAbsolute).toBe(-18);
  });

  it('reuses canonical personalized sections as compatibility sources for userIntelligence', () => {
    const personalized = createPayload();
    personalized.mode = 'personalized';
    personalized.personalizedPricing = {
      title: 'Preisstrategie',
      subtitle: 'Server pricing',
      contextLabel: 'Berlin · Cleaning',
      marketAverage: 78,
      recommendedMin: 65,
      recommendedMax: 90,
      userPrice: 95,
      gapAbsolute: 17,
      comparisonReliability: 'high',
      position: 'above',
      effect: 'warning',
      actionCode: 'adjust_price',
      summary: 'Server-side pricing summary',
    };
    personalized.risks = {
      title: 'Risiken',
      subtitle: 'Server risks',
      hasReliableItems: true,
      items: [{
        code: 'high_unanswered_requests',
        type: 'risk',
        priority: 'high',
        title: 'Zu viele offene Anfragen',
        description: 'Mehrere Vorgänge warten zu lange.',
        confidence: 0.86,
        reliability: 'high',
        context: '18 offen',
        actionCode: 'follow_up_unanswered',
        action: {
          code: 'follow_up_unanswered',
          label: 'Offene Vorgänge priorisieren',
          target: '/workspace?tab=my-requests',
        },
      }],
    };
    personalized.opportunities = {
      title: 'Chancen',
      subtitle: 'Server opportunities',
      hasReliableItems: true,
      items: [{
        code: 'city_opportunity_high',
        type: 'opportunity',
        priority: 'medium',
        title: 'Berlin hat Nachfrage',
        description: 'Hier gibt es aktuell Spielraum.',
        confidence: 0.79,
        reliability: 'medium',
        context: 'Berlin',
        actionCode: 'focus_market',
        action: {
          code: 'focus_market',
          label: 'Marktfokus schärfen',
          target: '/workspace?section=stats&focus=cities',
        },
      }],
    };
    personalized.nextSteps = {
      title: 'Nächste Schritte',
      subtitle: 'Server steps',
      hasReliableItems: true,
      items: [{
        code: 'respond_faster',
        type: 'performance',
        priority: 'high',
        title: 'Antworte schneller',
        description: 'Halte die Reaktionszeit niedrig.',
        confidence: 0.82,
        reliability: 'high',
        context: 'Berlin',
        actionCode: 'respond_faster',
        action: {
          code: 'respond_faster',
          label: 'Schneller reagieren',
          target: '/workspace?tab=my-requests',
        },
      }],
    };

    const normalized = normalizeWorkspaceDecisionDashboardResponse(personalized, {
      period: '30d',
      cityId: null,
      categoryKey: null,
    });

    expect(normalized.userIntelligence?.pricing?.status).toBe('above');
    expect(normalized.userIntelligence?.pricing?.conversionImpact).toBe('warning');
    expect(normalized.userIntelligence?.risks[0]?.code).toBe('high_unanswered');
    expect(normalized.userIntelligence?.opportunities[0]?.code).toBe('high_demand_city');
    expect(normalized.userIntelligence?.nextSteps[0]?.code).toBe('respond_faster');
  });
});
