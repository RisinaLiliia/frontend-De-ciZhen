import type {
  WorkspaceStatisticsCategoryFitDto,
  WorkspaceStatisticsCityComparisonDto,
  WorkspaceStatisticsDecisionLayerDto,
  WorkspaceStatisticsDecisionLayerMetricDto,
  WorkspaceStatisticsFunnelComparisonDto,
  WorkspaceStatisticsFunnelComparisonStageDto,
  WorkspaceStatisticsPersonalizedPricingDto,
  WorkspaceStatisticsPriceIntelligenceDto,
  WorkspaceStatisticsRecommendationItemDto,
  WorkspaceStatisticsRecommendationSectionDto,
  WorkspaceStatisticsUserActionStepDto,
  WorkspaceStatisticsUserComparisonMetricDto,
  WorkspaceStatisticsUserFormulaMetricDto,
  WorkspaceStatisticsUserIntelligenceDto,
  WorkspaceStatisticsUserPerformancePositionDto,
  WorkspaceStatisticsUserPriorityItemDto,
  WorkspaceStatisticsUserPricingDto,
  WorkspaceStatisticsUserProfileGapDto,
  WorkspaceStatisticsUserSignalDto,
} from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function roundMetric(value: number | null): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(value * 10) / 10;
}

function safeDivide(numerator: number | null | undefined, denominator: number | null | undefined): number | null {
  if (typeof numerator !== 'number' || !Number.isFinite(numerator)) return null;
  if (typeof denominator !== 'number' || !Number.isFinite(denominator) || denominator <= 0) return null;
  return numerator / denominator;
}

function toPercent(value: number | null): number | null {
  if (value === null) return null;
  return value * 100;
}

function roundGap(userValue: number | null, marketValue: number | null): number | null {
  if (userValue === null || marketValue === null) return null;
  return roundMetric(userValue - marketValue);
}

function resolveDirection(params: {
  userValue: number | null;
  marketValue: number | null;
  lowerIsBetter?: boolean;
}): 'up' | 'down' | 'flat' {
  const { userValue, marketValue, lowerIsBetter = false } = params;
  if (userValue === null || marketValue === null) return 'flat';
  if (Math.abs(userValue - marketValue) < 0.01) return 'flat';
  if (lowerIsBetter) {
    return userValue < marketValue ? 'up' : 'down';
  }
  return userValue > marketValue ? 'up' : 'down';
}

function resolveTone(params: {
  userValue: number | null;
  marketValue: number | null;
  lowerIsBetter?: boolean;
  warningThreshold?: number;
}): 'positive' | 'neutral' | 'warning' {
  const { userValue, marketValue, lowerIsBetter = false, warningThreshold = 0 } = params;
  if (userValue === null || marketValue === null) return 'neutral';

  const delta = lowerIsBetter ? marketValue - userValue : userValue - marketValue;
  if (delta > warningThreshold) return 'positive';
  if (delta < -warningThreshold) return 'warning';
  return 'neutral';
}

function resolveSeverityFromThresholds(value: number, thresholds: { high: number; medium: number }): 'high' | 'medium' | 'low' {
  if (value >= thresholds.high) return 'high';
  if (value >= thresholds.medium) return 'medium';
  return 'low';
}

function resolveFormulaMetric(params: {
  key: WorkspaceStatisticsUserFormulaMetricDto['key'];
  formula: WorkspaceStatisticsUserFormulaMetricDto['formula'];
  unit: WorkspaceStatisticsUserFormulaMetricDto['unit'];
  userValue: number | null;
  marketValue: number | null;
  lowerIsBetter?: boolean;
  warningThreshold?: number;
}): WorkspaceStatisticsUserFormulaMetricDto {
  const {
    key,
    formula,
    unit,
    userValue,
    marketValue,
    lowerIsBetter = false,
    warningThreshold = 0,
  } = params;

  return {
    key,
    formula,
    unit,
    userValue: roundMetric(userValue),
    marketValue: roundMetric(marketValue),
    gap: roundGap(userValue, marketValue),
    direction: resolveDirection({ userValue, marketValue, lowerIsBetter }),
    tone: resolveTone({ userValue, marketValue, lowerIsBetter, warningThreshold }),
  };
}

function deriveFormulaMetrics(payload: WorkspaceStatisticsOverviewSourceDto): WorkspaceStatisticsUserFormulaMetricDto[] {
  const requests = payload.profileFunnel.requestsTotal;
  const offers = payload.profileFunnel.offersTotal;
  const responses = payload.profileFunnel.confirmedResponsesTotal;
  const contracts = payload.profileFunnel.closedContractsTotal;
  const completed = payload.profileFunnel.completedJobsTotal;
  const revenue = payload.profileFunnel.profitAmount;
  const marketRevenue = payload.activity.metrics.platformRevenueAmount;
  const marketCompleted = payload.activity.metrics.completedJobs;

  return [
    resolveFormulaMetric({
      key: 'offer_rate',
      formula: 'offers / requests',
      unit: 'percent',
      userValue: toPercent(safeDivide(offers, requests)),
      marketValue: payload.activity.metrics.offerRatePercent,
      warningThreshold: 3,
    }),
    resolveFormulaMetric({
      key: 'response_rate',
      formula: 'responses / offers',
      unit: 'percent',
      userValue: toPercent(safeDivide(responses, offers)),
      marketValue: null,
      warningThreshold: 5,
    }),
    resolveFormulaMetric({
      key: 'conversion_rate',
      formula: 'contracts / requests',
      unit: 'percent',
      userValue: toPercent(safeDivide(contracts, requests)),
      marketValue: null,
      warningThreshold: 3,
    }),
    resolveFormulaMetric({
      key: 'completion_rate',
      formula: 'completed / contracts',
      unit: 'percent',
      userValue: toPercent(safeDivide(completed, contracts)),
      marketValue: null,
      warningThreshold: 3,
    }),
    resolveFormulaMetric({
      key: 'cancellation_rate',
      formula: 'cancellations / contracts',
      unit: 'percent',
      userValue: null,
      marketValue: payload.activity.metrics.cancellationRatePercent,
      lowerIsBetter: true,
      warningThreshold: 3,
    }),
    resolveFormulaMetric({
      key: 'avg_response_time',
      formula: 'sum(response_time) / responses',
      unit: 'minutes',
      userValue: payload.kpis.avgResponseMinutes ?? null,
      marketValue: payload.activity.metrics.responseMedianMinutes,
      lowerIsBetter: true,
      warningThreshold: 30,
    }),
    resolveFormulaMetric({
      key: 'revenue',
      formula: 'sum(order_price * platform_fee)',
      unit: 'currency',
      userValue: revenue,
      marketValue: marketRevenue,
      warningThreshold: 25,
    }),
    resolveFormulaMetric({
      key: 'avg_order_value',
      formula: 'total_revenue / completed_orders',
      unit: 'currency',
      userValue: safeDivide(revenue, completed),
      marketValue: safeDivide(marketRevenue, marketCompleted),
      warningThreshold: 10,
    }),
  ];
}

function deriveDecisionMetrics(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  formulaMetrics: WorkspaceStatisticsUserFormulaMetricDto[];
}): WorkspaceStatisticsUserComparisonMetricDto[] {
  const { payload, formulaMetrics } = params;
  const offerMetric = formulaMetrics.find((metric) => metric.key === 'offer_rate');
  const responseMetric = formulaMetrics.find((metric) => metric.key === 'avg_response_time');
  const userUnanswered = Math.max(
    0,
    (payload.kpis.openRequests ?? payload.profileFunnel.requestsTotal) - payload.profileFunnel.offersTotal,
  );

  return [
    {
      key: 'offer_rate',
      unit: 'percent',
      userValue: offerMetric?.userValue ?? null,
      marketValue: offerMetric?.marketValue ?? null,
      direction: offerMetric?.direction ?? 'flat',
      tone: offerMetric?.tone ?? 'neutral',
      status: null,
    },
    {
      key: 'response_time',
      unit: 'minutes',
      userValue: responseMetric?.userValue ?? null,
      marketValue: responseMetric?.marketValue ?? null,
      direction: responseMetric?.direction ?? 'flat',
      tone: responseMetric?.tone ?? 'neutral',
      status: null,
    },
    {
      key: 'unanswered',
      unit: 'count',
      userValue: userUnanswered,
      marketValue: payload.activity.metrics.unansweredRequests24h,
      direction: resolveDirection({
        userValue: userUnanswered,
        marketValue: payload.activity.metrics.unansweredRequests24h,
        lowerIsBetter: true,
      }),
      tone: resolveTone({
        userValue: userUnanswered,
        marketValue: payload.activity.metrics.unansweredRequests24h,
        lowerIsBetter: true,
        warningThreshold: 2,
      }),
      status: userUnanswered >= 20 ? 'high' : userUnanswered >= 8 ? 'medium' : userUnanswered > 0 ? 'low' : null,
    },
  ];
}

function derivePerformancePosition(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  formulaMetrics: WorkspaceStatisticsUserFormulaMetricDto[];
}): WorkspaceStatisticsUserPerformancePositionDto {
  const { payload, formulaMetrics } = params;
  const offerMetric = formulaMetrics.find((item) => item.key === 'offer_rate');
  const responseMetric = formulaMetrics.find((item) => item.key === 'avg_response_time');
  const conversionMetric = formulaMetrics.find((item) => item.key === 'conversion_rate');
  const profileScore = clampPercent(payload.kpis.profileCompleteness ?? 55) / 100;
  const successScore = clampPercent(payload.kpis.successRate) / 100;
  const offerScore = offerMetric && offerMetric.userValue !== null && offerMetric.marketValue !== null
    ? Math.max(0, Math.min(1, (offerMetric.userValue / Math.max(1, offerMetric.marketValue)) / 1.5))
    : 0.5;
  const responseScore = responseMetric && responseMetric.userValue !== null && responseMetric.marketValue !== null
    ? Math.max(0, Math.min(1, (responseMetric.marketValue / Math.max(1, responseMetric.userValue)) / 1.5))
    : 0.5;
  const conversionScore = conversionMetric?.userValue !== null && conversionMetric?.userValue !== undefined
    ? Math.max(0, Math.min(1, (conversionMetric.userValue ?? 0) / 100))
    : 0.5;
  const blendedScore = (offerScore * 0.3) + (responseScore * 0.25) + (conversionScore * 0.15) + (successScore * 0.15) + (profileScore * 0.15);
  const percentile = clampPercent(blendedScore * 100);
  const primaryOpportunity = payload.opportunityRadar?.[0] ?? null;
  const categoryBoost = primaryOpportunity?.score
    ? Math.round((primaryOpportunity.score - 5) * 4)
    : 0;
  const cityBoost = primaryOpportunity?.marketBalanceRatio
    ? Math.round((primaryOpportunity.marketBalanceRatio - 1) * 8)
    : 0;

  return {
    percentile,
    categoryPercentile: clampPercent(percentile + categoryBoost),
    cityPercentile: clampPercent(percentile + cityBoost),
    bucket: percentile >= 70 ? 'top' : percentile >= 45 ? 'average' : 'below',
    categoryLabel: payload.decisionContext?.category.label ?? primaryOpportunity?.category ?? null,
    cityLabel: payload.decisionContext?.city.label ?? primaryOpportunity?.city ?? null,
  };
}

function deriveSignals(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  formulaMetrics: WorkspaceStatisticsUserFormulaMetricDto[];
  decisionMetrics: WorkspaceStatisticsUserComparisonMetricDto[];
  performancePosition: WorkspaceStatisticsUserPerformancePositionDto;
  pricing: WorkspaceStatisticsUserPricingDto | null;
}): WorkspaceStatisticsUserSignalDto[] {
  const { payload, formulaMetrics, decisionMetrics, performancePosition, pricing } = params;
  const signals: WorkspaceStatisticsUserSignalDto[] = [];
  const responseMetric = formulaMetrics.find((item) => item.key === 'avg_response_time');
  const unansweredMetric = decisionMetrics.find((item) => item.key === 'unanswered');
  const topOpportunity = payload.opportunityRadar?.[0] ?? null;
  const topCategory = payload.demand.categories[0] ?? null;
  const profileCompleteness = payload.kpis.profileCompleteness ?? 0;

  if (responseMetric?.userValue !== null && responseMetric?.userValue !== undefined) {
    const responseUser = responseMetric.userValue;
    const responseMarket = responseMetric.marketValue;
    const isSlow = responseMarket !== null
      ? responseUser > responseMarket * 1.5
      : responseUser > 240;

    if (isSlow) {
      signals.push({
        id: 'signal-slow-response',
        type: 'risk',
        code: 'slow_response',
        severity: responseMarket !== null && responseUser > responseMarket * 2 ? 'high' : 'medium',
        metricKey: 'avg_response_time',
        actionCode: 'respond_faster',
      });
    }
  }

  if ((unansweredMetric?.userValue ?? 0) > 0) {
    signals.push({
      id: 'signal-high-unanswered',
      type: 'risk',
      code: 'high_unanswered',
      severity: resolveSeverityFromThresholds(unansweredMetric?.userValue ?? 0, { high: 20, medium: 8 }),
      metricKey: 'unanswered',
      actionCode: 'follow_up_unanswered',
    });
  }

  if (profileCompleteness < 80) {
    signals.push({
      id: 'signal-low-visibility',
      type: 'risk',
      code: 'low_visibility',
      severity: profileCompleteness < 60 ? 'high' : 'medium',
      metricKey: 'conversion_rate',
      actionCode: 'complete_profile',
    });
  }

  if (pricing?.status === 'above' || pricing?.status === 'below') {
    signals.push({
      id: pricing.status === 'above' ? 'signal-overpriced' : 'signal-underpriced',
      type: pricing.status === 'above' ? 'risk' : 'growth',
      code: pricing.status === 'above' ? 'overpriced' : 'underpriced',
      severity: pricing.status === 'above' ? 'high' : 'medium',
      metricKey: 'avg_order_value',
      actionCode: 'adjust_price',
    });
  }

  if (topOpportunity) {
    signals.push({
      id: 'signal-high-demand-city',
      type: 'opportunity',
      code: 'high_demand_city',
      severity: topOpportunity.score >= 8 || topOpportunity.status === 'very_high' ? 'high' : 'medium',
      metricKey: 'offer_rate',
      actionCode: 'focus_market',
    });
  }

  if (topCategory && topCategory.requestCount > 0) {
    signals.push({
      id: 'signal-growing-category',
      type: 'growth',
      code: 'growing_category',
      severity: topCategory.sharePercent >= 25 ? 'high' : 'medium',
      metricKey: 'conversion_rate',
      actionCode: 'focus_market',
    });
  }

  if (performancePosition.bucket === 'top') {
    signals.push({
      id: 'signal-strong-position',
      type: 'performance',
      code: 'strong_position',
      severity: performancePosition.percentile !== null && performancePosition.percentile >= 80 ? 'high' : 'medium',
      metricKey: 'offer_rate',
      actionCode: null,
    });
  }

  const severityOrder = { high: 0, medium: 1, low: 2 };
  const typeOrder = { risk: 0, opportunity: 1, growth: 2, performance: 3 };

  return signals
    .slice()
    .sort((left, right) => {
      const severityDelta = severityOrder[left.severity] - severityOrder[right.severity];
      if (severityDelta !== 0) return severityDelta;
      return typeOrder[left.type] - typeOrder[right.type];
    });
}

function deriveProfileGap(payload: WorkspaceStatisticsOverviewSourceDto): WorkspaceStatisticsUserProfileGapDto | null {
  const lossPercent = clampPercent(100 - payload.profileFunnel.confirmationRatePercent);
  const lostCount = Math.max(0, payload.profileFunnel.offersTotal - payload.profileFunnel.confirmedResponsesTotal);

  if (payload.profileFunnel.offersTotal <= 0) {
    return null;
  }

  return {
    fromStage: 'offers',
    toStage: 'confirmations',
    lossPercent,
    lostCount,
    tone: lossPercent >= 30 ? 'warning' : lossPercent >= 15 ? 'neutral' : 'positive',
  };
}

function deriveRisks(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  pricing: WorkspaceStatisticsUserPricingDto | null;
  signals: WorkspaceStatisticsUserSignalDto[];
}): WorkspaceStatisticsUserPriorityItemDto[] {
  const { payload, pricing, signals } = params;
  const risks: WorkspaceStatisticsUserPriorityItemDto[] = [];
  const severityByCode = new Map(signals.map((item) => [item.code, item.severity]));
  const unanswered = Math.max(0, (payload.kpis.openRequests ?? payload.profileFunnel.requestsTotal) - payload.profileFunnel.offersTotal);

  if (severityByCode.has('slow_response')) {
    risks.push({
      id: 'slow-response',
      code: 'slow_response',
      severity: severityByCode.get('slow_response') ?? 'medium',
      value: payload.kpis.avgResponseMinutes,
      secondaryValue: payload.activity.metrics.responseMedianMinutes,
    });
  }

  if (severityByCode.has('high_unanswered') && unanswered > 0) {
    risks.push({
      id: 'high-unanswered',
      code: 'high_unanswered',
      severity: severityByCode.get('high_unanswered') ?? 'medium',
      value: unanswered,
    });
  }

  if (severityByCode.has('low_visibility')) {
    risks.push({
      id: 'low-visibility',
      code: 'low_visibility',
      severity: severityByCode.get('low_visibility') ?? 'medium',
      value: payload.kpis.profileCompleteness ?? 0,
    });
  }

  if (pricing?.status === 'above') {
    risks.push({
      id: 'price-above-market',
      code: 'price_above_market',
      severity: severityByCode.get('overpriced') ?? 'high',
      value: pricing.currentPrice,
      secondaryValue: pricing.recommendedMax,
    });
  }

  return risks.slice(0, 3);
}

function deriveOpportunities(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  pricing: WorkspaceStatisticsUserPricingDto | null;
  performancePosition: WorkspaceStatisticsUserPerformancePositionDto;
  signals: WorkspaceStatisticsUserSignalDto[];
}): WorkspaceStatisticsUserPriorityItemDto[] {
  const { payload, pricing, performancePosition, signals } = params;
  const opportunities: WorkspaceStatisticsUserPriorityItemDto[] = [];
  const severityByCode = new Map(signals.map((item) => [item.code, item.severity]));
  const topOpportunity = payload.opportunityRadar?.[0] ?? null;
  const topCategory = payload.demand.categories[0] ?? null;

  if (topOpportunity && severityByCode.has('high_demand_city')) {
    opportunities.push({
      id: 'high-demand-city',
      code: 'high_demand_city',
      severity: severityByCode.get('high_demand_city') ?? 'high',
      cityLabel: topOpportunity.city,
      categoryLabel: topOpportunity.category ?? null,
      value: topOpportunity.demand,
      secondaryValue: topOpportunity.marketBalanceRatio,
    });

    if ((topOpportunity.providers ?? 0) <= 3 || (topOpportunity.marketBalanceRatio ?? 0) >= 1.6) {
      opportunities.push({
        id: 'low-competition-segment',
        code: 'low_competition_segment',
        severity: 'medium',
        cityLabel: topOpportunity.city,
        categoryLabel: topOpportunity.category ?? null,
        value: topOpportunity.providers,
        secondaryValue: topOpportunity.marketBalanceRatio,
      });
    }
  }

  if (topCategory && severityByCode.has('growing_category')) {
    opportunities.push({
      id: 'growing-category',
      code: 'growing_category',
      severity: severityByCode.get('growing_category') ?? 'medium',
      categoryLabel: topCategory.categoryName,
      value: topCategory.requestCount,
      secondaryValue: topCategory.sharePercent,
    });
  }

  if (pricing?.status === 'below') {
    opportunities.push({
      id: 'price-below-market',
      code: 'price_below_market',
      severity: severityByCode.get('underpriced') ?? 'medium',
      value: pricing.currentPrice,
      secondaryValue: pricing.recommendedMin,
    });
  }

  if (severityByCode.has('strong_position')) {
    opportunities.push({
      id: 'strong-position',
      code: 'strong_position',
      severity: severityByCode.get('strong_position') ?? 'medium',
      categoryLabel: performancePosition.categoryLabel ?? null,
      cityLabel: performancePosition.cityLabel ?? null,
      value: performancePosition.percentile,
    });
  }

  return opportunities.slice(0, 3);
}

function derivePricing(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceDto | null | undefined;
}): WorkspaceStatisticsUserPricingDto | null {
  const { payload, priceIntelligence } = params;
  if (!priceIntelligence) return null;

  const currentPrice = payload.profileFunnel.completedJobsTotal > 0
    ? payload.profileFunnel.profitAmount / Math.max(1, payload.profileFunnel.completedJobsTotal)
    : null;

  let status: WorkspaceStatisticsUserPricingDto['status'] = 'unknown';
  if (
    currentPrice !== null &&
    typeof priceIntelligence.recommendedMin === 'number' &&
    typeof priceIntelligence.recommendedMax === 'number'
  ) {
    if (currentPrice < priceIntelligence.recommendedMin) {
      status = 'below';
    } else if (currentPrice > priceIntelligence.recommendedMax) {
      status = 'above';
    } else {
      status = 'within';
    }
  }

  return {
    currentPrice: roundMetric(currentPrice),
    recommendedMin: roundMetric(priceIntelligence.recommendedMin),
    recommendedMax: roundMetric(priceIntelligence.recommendedMax),
    marketAverage: roundMetric(priceIntelligence.marketAverage),
    status,
    conversionImpact:
      status === 'within'
        ? 'positive'
        : status === 'unknown'
          ? 'neutral'
          : 'warning',
  };
}

function deriveNextSteps(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  pricing: WorkspaceStatisticsUserPricingDto | null;
  signals: WorkspaceStatisticsUserSignalDto[];
}): WorkspaceStatisticsUserActionStepDto[] {
  const { payload, pricing, signals } = params;
  const steps: WorkspaceStatisticsUserActionStepDto[] = [];
  const usedCodes = new Set<WorkspaceStatisticsUserActionStepDto['code']>();
  const topOpportunity = payload.opportunityRadar?.[0] ?? null;
  const topCategory = payload.demand.categories[0] ?? null;
  const unansweredCount = Math.max(
    0,
    (payload.kpis.openRequests ?? payload.profileFunnel.requestsTotal) - payload.profileFunnel.offersTotal,
  );

  signals.forEach((signal) => {
    const code = signal.actionCode;
    if (!code || usedCodes.has(code)) return;
    usedCodes.add(code);

    const priority = signal.severity;

    if (code === 'respond_faster') {
      steps.push({
        id: 'respond-faster',
        code,
        priority,
        targetValue: 120,
      });
      return;
    }

    if (code === 'adjust_price') {
      const midpoint = pricing?.recommendedMin !== null
        && pricing?.recommendedMin !== undefined
        && pricing?.recommendedMax !== null
        && pricing?.recommendedMax !== undefined
        ? Math.round((pricing.recommendedMin + pricing.recommendedMax) / 2)
        : pricing?.marketAverage ?? null;
      steps.push({
        id: 'adjust-price',
        code,
        priority,
        targetValue: midpoint,
      });
      return;
    }

    if (code === 'focus_market') {
      steps.push({
        id: 'focus-market',
        code,
        priority,
        cityLabel: topOpportunity?.city ?? null,
        categoryLabel: topOpportunity?.category ?? topCategory?.categoryName ?? null,
      });
      return;
    }

    if (code === 'complete_profile') {
      steps.push({
        id: 'complete-profile',
        code,
        priority,
        targetValue: 90,
      });
      return;
    }

    steps.push({
      id: 'follow-up-unanswered',
      code,
      priority,
      targetValue: unansweredCount,
    });
  });

  if (steps.length === 0) {
    steps.push({
      id: 'focus-market-default',
      code: 'focus_market',
      priority: 'medium',
      cityLabel: payload.opportunityRadar?.[0]?.city ?? null,
      categoryLabel: payload.opportunityRadar?.[0]?.category ?? null,
    });
  }

  return steps.slice(0, 4);
}

function resolveDecisionMetricStatus(tone: 'positive' | 'neutral' | 'warning'): WorkspaceStatisticsDecisionLayerMetricDto['status'] {
  if (tone === 'positive') return 'good';
  if (tone === 'warning') return 'critical';
  return 'neutral';
}

function resolveDecisionMetricDirection(params: {
  userValue: number | null;
  marketValue: number | null;
  lowerIsBetter?: boolean;
}): WorkspaceStatisticsDecisionLayerMetricDto['direction'] {
  const { userValue, marketValue, lowerIsBetter = false } = params;
  if (userValue === null || marketValue === null) return 'neutral';
  if (Math.abs(userValue - marketValue) < 0.01) return 'neutral';
  if (lowerIsBetter) {
    return userValue < marketValue ? 'better' : 'worse';
  }
  return userValue > marketValue ? 'better' : 'worse';
}

function resolvePrimaryActionLabel(code: WorkspaceStatisticsUserActionStepDto['code']): string {
  if (code === 'respond_faster') return 'Antworte schneller';
  if (code === 'adjust_price') return 'Preis anpassen';
  if (code === 'focus_market') return 'Marktfokus schärfen';
  if (code === 'complete_profile') return 'Profil vervollständigen';
  return 'Offene Anfragen nachfassen';
}

function normalizeUserActionCode(code: string | null | undefined): WorkspaceStatisticsUserActionStepDto['code'] | null {
  if (
    code === 'respond_faster' ||
    code === 'adjust_price' ||
    code === 'focus_market' ||
    code === 'complete_profile' ||
    code === 'follow_up_unanswered'
  ) {
    return code;
  }
  return null;
}

function mapRecommendationToPriorityCode(
  item: WorkspaceStatisticsRecommendationItemDto,
): WorkspaceStatisticsUserPriorityItemDto['code'] | null {
  if (item.code === 'high_unanswered_requests') return 'high_unanswered';
  if (item.code === 'city_opportunity_high' || item.code === 'top_city_demand') return 'high_demand_city';
  if (item.code === 'category_opportunity_high' || item.code === 'top_category_demand') return 'growing_category';
  if (item.code === 'local_ads_opportunity') return 'low_competition_segment';
  if (item.code === 'profile_missing_photo' || item.code === 'profile_low_completeness' || item.code === 'user_low_conversion') {
    return 'low_visibility';
  }
  return null;
}

function mapRecommendationPriority(
  section: WorkspaceStatisticsRecommendationSectionDto | null | undefined,
): WorkspaceStatisticsUserPriorityItemDto[] {
  if (!section?.items?.length) return [];
  return section.items.flatMap((item, index) => {
    const code = mapRecommendationToPriorityCode(item);
    if (!code) return [];
    return [{
      id: `${item.code}-${index}`,
      code,
      severity: item.priority,
      cityLabel: item.type === 'opportunity' || item.type === 'demand' ? item.context : null,
      categoryLabel: item.type === 'growth' ? item.context : null,
      value: null,
      secondaryValue: null,
    }];
  });
}

function mapRecommendationSteps(
  section: WorkspaceStatisticsRecommendationSectionDto | null | undefined,
): WorkspaceStatisticsUserActionStepDto[] {
  if (!section?.items?.length) return [];
  return section.items.flatMap((item, index) => {
    const code = normalizeUserActionCode(item.actionCode ?? item.action?.code ?? null);
    if (!code) return [];
    return [{
      id: `${item.code}-${index}`,
      code,
      priority: item.priority,
      targetValue: null,
      cityLabel: code === 'focus_market' ? item.context : null,
      categoryLabel: null,
    }];
  });
}

export function buildCompatibilityDecisionLayer(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  userIntelligence: WorkspaceStatisticsUserIntelligenceDto | null;
}): WorkspaceStatisticsDecisionLayerDto | null {
  const { payload, userIntelligence } = params;
  if (payload.mode !== 'personalized' || !userIntelligence) return null;

  const formulaMetrics = new Map(userIntelligence.formulaMetrics.map((item) => [item.key, item]));
  const decisionMetrics = new Map(userIntelligence.decisionMetrics.map((item) => [item.key, item]));
  const signalCodesByMetric = new Map<string, WorkspaceStatisticsDecisionLayerMetricDto['signalCodes']>();

  userIntelligence.signals.forEach((signal) => {
    const metricKey = signal.metricKey ?? signal.code;
    const current = signalCodesByMetric.get(metricKey) ?? [];
    signalCodesByMetric.set(metricKey, current.includes(signal.code) ? current : [...current, signal.code]);
  });

  const nextStepByCode = new Map(userIntelligence.nextSteps.map((step) => [step.code, step]));
  const summarize = (direction: WorkspaceStatisticsDecisionLayerMetricDto['direction'], goodLabel: string, badLabel: string) => {
    if (direction === 'better') return goodLabel;
    if (direction === 'worse') return badLabel;
    return 'Auf Marktniveau.';
  };

  const metrics: WorkspaceStatisticsDecisionLayerMetricDto[] = [
    {
      id: 'offer_rate',
      label: 'Offer rate',
      marketValue: formulaMetrics.get('offer_rate')?.marketValue ?? null,
      userValue: formulaMetrics.get('offer_rate')?.userValue ?? null,
      gapAbsolute: formulaMetrics.get('offer_rate')?.gap ?? null,
      gapPercent: formulaMetrics.get('offer_rate')?.gap ?? null,
      unit: 'percent',
      direction: resolveDecisionMetricDirection({
        userValue: formulaMetrics.get('offer_rate')?.userValue ?? null,
        marketValue: formulaMetrics.get('offer_rate')?.marketValue ?? null,
      }),
      status: resolveDecisionMetricStatus(formulaMetrics.get('offer_rate')?.tone ?? 'neutral'),
      signalCodes: signalCodesByMetric.get('offer_rate') ?? [],
      primaryActionCode: nextStepByCode.has('focus_market') ? 'focus_market' : null,
      summary: summarize(
        resolveDecisionMetricDirection({
          userValue: formulaMetrics.get('offer_rate')?.userValue ?? null,
          marketValue: formulaMetrics.get('offer_rate')?.marketValue ?? null,
        }),
        'Du liegst bei der Angebotsquote über dem Markt.',
        'Deine Angebotsquote liegt unter dem Markt.',
      ),
    },
    {
      id: 'avg_response_time',
      label: 'Average response time',
      marketValue: formulaMetrics.get('avg_response_time')?.marketValue ?? null,
      userValue: formulaMetrics.get('avg_response_time')?.userValue ?? null,
      gapAbsolute: formulaMetrics.get('avg_response_time')?.gap ?? null,
      gapPercent: null,
      unit: 'minutes',
      direction: resolveDecisionMetricDirection({
        userValue: formulaMetrics.get('avg_response_time')?.userValue ?? null,
        marketValue: formulaMetrics.get('avg_response_time')?.marketValue ?? null,
        lowerIsBetter: true,
      }),
      status: resolveDecisionMetricStatus(formulaMetrics.get('avg_response_time')?.tone ?? 'neutral'),
      signalCodes: signalCodesByMetric.get('avg_response_time') ?? [],
      primaryActionCode: nextStepByCode.has('respond_faster') ? 'respond_faster' : null,
      summary: summarize(
        resolveDecisionMetricDirection({
          userValue: formulaMetrics.get('avg_response_time')?.userValue ?? null,
          marketValue: formulaMetrics.get('avg_response_time')?.marketValue ?? null,
          lowerIsBetter: true,
        }),
        'Du reagierst schneller als der Markt.',
        'Du reagierst langsamer als der Markt.',
      ),
    },
    {
      id: 'unanswered_over_24h',
      label: 'Unanswered >24h',
      marketValue: decisionMetrics.get('unanswered')?.marketValue ?? null,
      userValue: decisionMetrics.get('unanswered')?.userValue ?? null,
      gapAbsolute: roundGap(decisionMetrics.get('unanswered')?.userValue ?? null, decisionMetrics.get('unanswered')?.marketValue ?? null),
      gapPercent: null,
      unit: 'count',
      direction: resolveDecisionMetricDirection({
        userValue: decisionMetrics.get('unanswered')?.userValue ?? null,
        marketValue: decisionMetrics.get('unanswered')?.marketValue ?? null,
        lowerIsBetter: true,
      }),
      status: decisionMetrics.get('unanswered')?.status === 'high' ? 'critical' : resolveDecisionMetricStatus(decisionMetrics.get('unanswered')?.tone ?? 'neutral'),
      signalCodes: signalCodesByMetric.get('high_unanswered') ?? signalCodesByMetric.get('unanswered') ?? [],
      primaryActionCode: nextStepByCode.has('follow_up_unanswered') ? 'follow_up_unanswered' : null,
      summary: summarize(
        resolveDecisionMetricDirection({
          userValue: decisionMetrics.get('unanswered')?.userValue ?? null,
          marketValue: decisionMetrics.get('unanswered')?.marketValue ?? null,
          lowerIsBetter: true,
        }),
        'Offene Anfragen sind unter Kontrolle.',
        'Zu viele Anfragen bleiben länger als 24h offen.',
      ),
    },
    {
      id: 'completed_jobs',
      label: 'Completed jobs',
      marketValue: payload.activity.metrics.completedJobs,
      userValue: payload.profileFunnel.completedJobsTotal,
      gapAbsolute: roundGap(payload.profileFunnel.completedJobsTotal, payload.activity.metrics.completedJobs),
      gapPercent: null,
      unit: 'count',
      direction: resolveDecisionMetricDirection({
        userValue: payload.profileFunnel.completedJobsTotal,
        marketValue: payload.activity.metrics.completedJobs,
      }),
      status: resolveDecisionMetricStatus(payload.activity.metrics.completedTone),
      signalCodes: signalCodesByMetric.get('strong_position') ?? [],
      primaryActionCode: nextStepByCode.has('focus_market') ? 'focus_market' : null,
      summary: summarize(
        resolveDecisionMetricDirection({
          userValue: payload.profileFunnel.completedJobsTotal,
          marketValue: payload.activity.metrics.completedJobs,
        }),
        'Du schließt aktuell mehr Aufträge ab als der Markt.',
        'Du schließt aktuell weniger Aufträge ab als der Markt.',
      ),
    },
    {
      id: 'revenue',
      label: 'Revenue',
      marketValue: formulaMetrics.get('revenue')?.marketValue ?? null,
      userValue: formulaMetrics.get('revenue')?.userValue ?? null,
      gapAbsolute: formulaMetrics.get('revenue')?.gap ?? null,
      gapPercent: null,
      unit: 'currency',
      direction: resolveDecisionMetricDirection({
        userValue: formulaMetrics.get('revenue')?.userValue ?? null,
        marketValue: formulaMetrics.get('revenue')?.marketValue ?? null,
      }),
      status: resolveDecisionMetricStatus(formulaMetrics.get('revenue')?.tone ?? 'neutral'),
      signalCodes: signalCodesByMetric.get('price_above_market') ?? [],
      primaryActionCode: nextStepByCode.has('adjust_price') ? 'adjust_price' : null,
      summary: summarize(
        resolveDecisionMetricDirection({
          userValue: formulaMetrics.get('revenue')?.userValue ?? null,
          marketValue: formulaMetrics.get('revenue')?.marketValue ?? null,
        }),
        'Dein Umsatz liegt über dem Markt.',
        'Dein Umsatz liegt unter dem Markt.',
      ),
    },
    {
      id: 'average_order_value',
      label: 'Average order value',
      marketValue: formulaMetrics.get('avg_order_value')?.marketValue ?? null,
      userValue: formulaMetrics.get('avg_order_value')?.userValue ?? null,
      gapAbsolute: formulaMetrics.get('avg_order_value')?.gap ?? null,
      gapPercent: null,
      unit: 'currency',
      direction: resolveDecisionMetricDirection({
        userValue: formulaMetrics.get('avg_order_value')?.userValue ?? null,
        marketValue: formulaMetrics.get('avg_order_value')?.marketValue ?? null,
      }),
      status: resolveDecisionMetricStatus(formulaMetrics.get('avg_order_value')?.tone ?? 'neutral'),
      signalCodes: signalCodesByMetric.get('price_above_market') ?? signalCodesByMetric.get('price_below_market') ?? [],
      primaryActionCode: nextStepByCode.has('adjust_price') ? 'adjust_price' : null,
      summary: summarize(
        resolveDecisionMetricDirection({
          userValue: formulaMetrics.get('avg_order_value')?.userValue ?? null,
          marketValue: formulaMetrics.get('avg_order_value')?.marketValue ?? null,
        }),
        'Dein durchschnittlicher Auftragswert liegt über dem Markt.',
        'Dein durchschnittlicher Auftragswert liegt unter dem Markt.',
      ),
    },
  ];

  const primaryAction = userIntelligence.nextSteps[0]
    ? {
      code: userIntelligence.nextSteps[0].code,
      label: resolvePrimaryActionLabel(userIntelligence.nextSteps[0].code),
      target: userIntelligence.nextSteps[0].cityLabel ?? userIntelligence.nextSteps[0].categoryLabel ?? null,
    }
    : null;

  return {
    title: 'Decision Layer',
    subtitle: 'Vergleicht deine Performance mit dem aktuellen Markt',
    metrics,
    primaryInsight: metrics.find((item) => item.status === 'critical')?.summary
      ?? metrics.find((item) => item.status === 'warning')?.summary
      ?? metrics.find((item) => item.status === 'good')?.summary
      ?? metrics[0]?.summary
      ?? null,
    primaryAction,
  };
}

export function buildCompatibilityPersonalizedPricing(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  userIntelligence: WorkspaceStatisticsUserIntelligenceDto | null;
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceDto | null | undefined;
}): WorkspaceStatisticsPersonalizedPricingDto | null {
  const { payload, userIntelligence, priceIntelligence } = params;
  if (payload.mode !== 'personalized' || !priceIntelligence) return null;

  const pricing = userIntelligence?.pricing ?? null;
  const action = userIntelligence?.nextSteps.find((item) => item.code === 'adjust_price') ?? null;

  return {
    title: 'Price intelligence',
    subtitle: 'Marktpreis und deine aktuelle Preisposition',
    contextLabel: [priceIntelligence.category, priceIntelligence.city].filter(Boolean).join(' · ') || null,
    marketAverage: priceIntelligence.marketAverage,
    recommendedMin: priceIntelligence.recommendedMin,
    recommendedMax: priceIntelligence.recommendedMax,
    userPrice: pricing?.currentPrice ?? null,
    gapAbsolute:
      pricing?.currentPrice !== null && pricing?.currentPrice !== undefined && priceIntelligence.marketAverage !== null
        ? roundMetric(pricing.currentPrice - priceIntelligence.marketAverage)
        : null,
    comparisonReliability: priceIntelligence.confidenceLevel ?? 'unavailable',
    position: pricing?.status ?? 'unknown',
    effect: pricing?.conversionImpact ?? 'neutral',
    actionCode: action?.code ?? null,
    summary: pricing?.status === 'above'
      ? 'Dein Preis liegt über dem Markt.'
      : pricing?.status === 'below'
        ? 'Dein Preis liegt unter dem Markt.'
        : pricing?.status === 'within'
          ? 'Dein Preis liegt im empfohlenen Bereich.'
          : null,
  };
}

export function buildCompatibilityCategoryFit(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  userIntelligence: WorkspaceStatisticsUserIntelligenceDto | null;
}): WorkspaceStatisticsCategoryFitDto | null {
  const { payload, userIntelligence } = params;
  if (payload.mode !== 'personalized') return null;

  const focusStep = userIntelligence?.nextSteps.find((item) => item.code === 'focus_market') ?? null;

  return {
    title: 'Demand by category',
    subtitle: 'Marktnachfrage und dein aktueller Fit',
    hasReliableItems: payload.demand.categories.length > 0,
    items: payload.demand.categories.map((item) => {
      const matchedOpportunity = userIntelligence?.opportunities.find((opportunity) => {
        return opportunity.categoryLabel?.trim().toLowerCase() === item.categoryName.trim().toLowerCase();
      }) ?? null;

      return {
        categoryKey: item.categoryKey ?? null,
        label: item.categoryName,
        marketDemandShare: item.sharePercent,
        reliability: matchedOpportunity ? 'high' : item.sharePercent >= 20 ? 'medium' : 'low',
        userFit: matchedOpportunity ? 'high' : item.sharePercent >= 20 ? 'medium' : 'low',
        opportunity: matchedOpportunity ? 'high' : item.sharePercent >= 20 ? 'medium' : 'low',
        actionCode:
          focusStep?.categoryLabel?.trim().toLowerCase() === item.categoryName.trim().toLowerCase()
            ? focusStep.code
            : null,
        summary: matchedOpportunity ? `${item.categoryName} passt aktuell gut zu deinem Profil.` : null,
      };
    }),
  };
}

export function buildCompatibilityCityComparison(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  userIntelligence: WorkspaceStatisticsUserIntelligenceDto | null;
}): WorkspaceStatisticsCityComparisonDto | null {
  const { payload, userIntelligence } = params;
  if (payload.mode !== 'personalized') return null;

  const focusStep = userIntelligence?.nextSteps.find((item) => item.code === 'focus_market') ?? null;

  return {
    title: 'Cities & regions',
    subtitle: 'Marktaktivität und dein aktueller Stadt-Fit',
    hasReliableItems: payload.demand.cities.length > 0,
    items: payload.demand.cities.map((item) => {
      const matchedOpportunity = userIntelligence?.opportunities.find((opportunity) => {
        return opportunity.cityLabel?.trim().toLowerCase() === item.cityName.trim().toLowerCase();
      }) ?? null;

      return {
        cityId: item.cityId ?? item.citySlug,
        city: item.cityName,
        marketRequests: item.requestCount,
        reliability:
          focusStep?.cityLabel?.trim().toLowerCase() === item.cityName.trim().toLowerCase()
            ? 'high'
            : matchedOpportunity
              ? 'medium'
              : 'low',
        userActivity:
          focusStep?.cityLabel?.trim().toLowerCase() === item.cityName.trim().toLowerCase()
            ? 'high'
            : matchedOpportunity
              ? 'medium'
              : 'unknown',
        userConversion: null,
        actionCode:
          focusStep?.cityLabel?.trim().toLowerCase() === item.cityName.trim().toLowerCase()
            ? focusStep.code
            : null,
        recommendation: matchedOpportunity ? `${item.cityName} ist aktuell relevant für dein Profil.` : null,
      };
    }),
  };
}

function resolveFunnelStageStatus(params: {
  userRateFromPrev: number | null;
  marketRateFromPrev: number | null;
}): WorkspaceStatisticsFunnelComparisonStageDto['status'] {
  const { userRateFromPrev, marketRateFromPrev } = params;
  if (userRateFromPrev === null || marketRateFromPrev === null) return 'insufficient_data';
  if (Math.abs(userRateFromPrev - marketRateFromPrev) < 0.01) return 'at_market';
  return userRateFromPrev > marketRateFromPrev ? 'above_market' : 'below_market';
}

function resolveDropOffSeverity(rateFromPrev: number | null): WorkspaceStatisticsFunnelComparisonStageDto['dropOffSeverity'] {
  if (rateFromPrev === null) return null;
  const dropOff = 100 - rateFromPrev;
  if (dropOff >= 45) return 'high';
  if (dropOff >= 25) return 'medium';
  return 'low';
}

function toFunnelRecommendationCode(step: WorkspaceStatisticsUserActionStepDto | undefined): string | null {
  return step?.code ?? null;
}

export function buildCompatibilityFunnelComparison(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  userIntelligence: WorkspaceStatisticsUserIntelligenceDto | null;
}): WorkspaceStatisticsFunnelComparisonDto | null {
  const { payload, userIntelligence } = params;
  if (payload.mode !== 'personalized' || !userIntelligence) return null;

  const focusStep = userIntelligence.nextSteps.find((item) => item.code === 'focus_market');
  const responseStep = userIntelligence.nextSteps.find((item) => item.code === 'respond_faster');
  const unansweredStep = userIntelligence.nextSteps.find((item) => item.code === 'follow_up_unanswered');
  const pricingStep = userIntelligence.nextSteps.find((item) => item.code === 'adjust_price');
  const marketRequests = payload.activity.totals.requestsTotal;
  const marketOffers = payload.activity.totals.offersTotal;
  const marketCompleted = payload.activity.metrics.completedJobs;
  const userRequests = payload.profileFunnel.requestsTotal;
  const userOffers = payload.profileFunnel.offersTotal;
  const userResponses = payload.profileFunnel.confirmedResponsesTotal;
  const userContracts = payload.profileFunnel.closedContractsTotal;
  const userCompleted = payload.profileFunnel.completedJobsTotal;
  const marketOfferRate = toPercent(safeDivide(marketOffers, marketRequests));
  const userOfferRate = toPercent(safeDivide(userOffers, userRequests));
  const userResponseRate = toPercent(safeDivide(userResponses, userOffers));
  const userContractRate = toPercent(safeDivide(userContracts, userResponses));
  const userCompletionRate = toPercent(safeDivide(userCompleted, userContracts));

  const stages: WorkspaceStatisticsFunnelComparisonStageDto[] = [
    {
      key: 'requests',
      label: 'Requests',
      marketCount: marketRequests,
      userCount: userRequests,
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
      marketCount: marketOffers,
      userCount: userOffers,
      marketRateFromPrev: marketOfferRate,
      userRateFromPrev: userOfferRate,
      gapRate: roundGap(userOfferRate, marketOfferRate),
      status: resolveFunnelStageStatus({
        userRateFromPrev: userOfferRate,
        marketRateFromPrev: marketOfferRate,
      }),
      dropOffSeverity: resolveDropOffSeverity(userOfferRate),
      recommendation: toFunnelRecommendationCode(focusStep),
    },
    {
      key: 'responses',
      label: 'Responses',
      marketCount: null,
      userCount: userResponses,
      marketRateFromPrev: null,
      userRateFromPrev: userResponseRate,
      gapRate: null,
      status: 'insufficient_data',
      dropOffSeverity: resolveDropOffSeverity(userResponseRate),
      recommendation: toFunnelRecommendationCode(responseStep ?? unansweredStep),
    },
    {
      key: 'contracts',
      label: 'Contracts',
      marketCount: null,
      userCount: userContracts,
      marketRateFromPrev: null,
      userRateFromPrev: userContractRate,
      gapRate: null,
      status: 'insufficient_data',
      dropOffSeverity: resolveDropOffSeverity(userContractRate),
      recommendation: toFunnelRecommendationCode(pricingStep ?? responseStep),
    },
    {
      key: 'completed',
      label: 'Completed',
      marketCount: marketCompleted,
      userCount: userCompleted,
      marketRateFromPrev: null,
      userRateFromPrev: userCompletionRate,
      gapRate: null,
      status: 'insufficient_data',
      dropOffSeverity: resolveDropOffSeverity(userCompletionRate),
      recommendation: toFunnelRecommendationCode(pricingStep),
    },
  ];

  const largestGapStage = stages
    .filter((item) => typeof item.gapRate === 'number')
    .sort((left, right) => Math.abs(right.gapRate ?? 0) - Math.abs(left.gapRate ?? 0))[0]?.key ?? null;

  const largestDropOffStage = stages
    .filter((item) => item.key !== 'requests' && typeof item.userRateFromPrev === 'number')
    .sort((left, right) => (left.userRateFromPrev ?? 100) - (right.userRateFromPrev ?? 100))[0]?.key ?? null;

  const primaryBottleneck = largestDropOffStage
    ? stages.find((item) => item.key === largestDropOffStage)?.label ?? null
    : null;

  const nextActionCode = largestDropOffStage
    ? stages.find((item) => item.key === largestDropOffStage)?.recommendation ?? null
    : userIntelligence.nextSteps[0]?.code ?? null;

  const summary = userIntelligence.profileGap
    ? `Du verlierst aktuell ${clampPercent(userIntelligence.profileGap.lossPercent ?? 0)}% zwischen Angebot und Antwort.`
    : primaryBottleneck
      ? `Größter Verlust aktuell bei ${primaryBottleneck}.`
      : null;

  return {
    comparisonLabel: userIntelligence.comparisonLabel ?? null,
    summary,
    largestGapStage,
    largestDropOffStage,
    primaryBottleneck,
    nextAction: nextActionCode,
    stages,
  };
}

export function buildCompatibilityUserIntelligence(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceDto | null | undefined;
}): WorkspaceStatisticsUserIntelligenceDto | null {
  const { payload, priceIntelligence } = params;
  if (payload.mode !== 'personalized') return null;

  const formulaMetrics = deriveFormulaMetrics(payload);
  const decisionMetrics = deriveDecisionMetrics({ payload, formulaMetrics });
  const performancePosition = derivePerformancePosition({ payload, formulaMetrics });
  const profileGap = deriveProfileGap(payload);
  const pricing = payload.personalizedPricing
    ? {
      currentPrice: payload.personalizedPricing.userPrice,
      recommendedMin: payload.personalizedPricing.recommendedMin,
      recommendedMax: payload.personalizedPricing.recommendedMax,
      marketAverage: payload.personalizedPricing.marketAverage,
      status: payload.personalizedPricing.position,
      conversionImpact: payload.personalizedPricing.effect,
    }
    : derivePricing({ payload, priceIntelligence });
  const signals = deriveSignals({
    payload,
    formulaMetrics,
    decisionMetrics,
    performancePosition,
    pricing,
  });
  const risks = payload.risks?.items?.length
    ? mapRecommendationPriority(payload.risks)
    : deriveRisks({ payload, pricing, signals });
  const opportunities = payload.opportunities?.items?.length
    ? mapRecommendationPriority(payload.opportunities)
    : deriveOpportunities({ payload, pricing, performancePosition, signals });
  const nextSteps = payload.nextSteps?.items?.length
    ? mapRecommendationSteps(payload.nextSteps)
    : deriveNextSteps({ payload, pricing, signals });

  return {
    comparisonLabel: null,
    formulaMetrics,
    decisionMetrics,
    signals,
    performancePosition,
    profileGap,
    risks,
    opportunities,
    pricing,
    nextSteps,
  };
}
