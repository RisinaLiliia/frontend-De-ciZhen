import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';

type OpportunityItem = NonNullable<WorkspaceStatisticsOverviewSourceDto['opportunityRadar']>[number];
type OpportunityMetric = OpportunityItem['metrics'][number];
type OpportunityStatus = OpportunityItem['status'];
type OpportunityTone = OpportunityItem['tone'];
type OpportunitySummaryKey = OpportunityItem['summaryKey'];
type OpportunityMetricKey = OpportunityMetric['key'];
type OpportunitySemanticKey = OpportunityMetric['semanticKey'];
type OpportunitySemanticTone = OpportunityMetric['semanticTone'];

type PriceIntelligence = NonNullable<WorkspaceStatisticsOverviewSourceDto['priceIntelligence']>;
type PriceSignalTone = NonNullable<PriceIntelligence['smartSignalTone']>;
type PriceConfidenceLevel = NonNullable<PriceIntelligence['confidenceLevel']>;

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function roundScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

function roundRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function roundToNearestStep(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(step, Math.round(value / step) * step);
}

function resolvePriceSmartSignalTone(params: {
  smartRecommendedPrice: number | null;
  marketAverage: number | null;
}): PriceSignalTone | null {
  if (params.smartRecommendedPrice === null || params.marketAverage === null) return null;
  const delta = params.smartRecommendedPrice - params.marketAverage;
  if (delta <= -10) return 'visibility';
  if (delta >= 10) return 'premium';
  return 'balanced';
}

function resolvePriceConfidenceLevel(analyzedRequestsCount: number | null): PriceConfidenceLevel | null {
  if (analyzedRequestsCount === null || analyzedRequestsCount <= 0) return null;
  if (analyzedRequestsCount >= 100) return 'high';
  if (analyzedRequestsCount >= 40) return 'medium';
  return 'low';
}

function resolveProfitPotentialStatus(score: number | null): PriceIntelligence['profitPotentialStatus'] {
  if (score === null) return null;
  if (score >= 7.5) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

function coalesceNullable<T>(preferred: T | null | undefined, fallback: T | null): T | null {
  return preferred ?? fallback;
}

function resolveOpportunityStatus(score: number): OpportunityStatus {
  if (score >= 8.5) return 'very_high';
  if (score >= 7) return 'good';
  if (score >= 5) return 'balanced';
  if (score >= 3.5) return 'competitive';
  return 'low';
}

function resolveOpportunityTone(status: OpportunityStatus): OpportunityTone {
  if (status === 'very_high') return 'very-high';
  if (status === 'good') return 'high';
  if (status === 'balanced') return 'balanced';
  return 'supply-heavy';
}

function resolveOpportunityMetricSemantic(
  key: OpportunityMetricKey,
  value: number,
): { semanticTone: OpportunitySemanticTone; semanticKey: OpportunitySemanticKey } {
  const normalized = Math.max(0, Math.min(10, value));

  if (key === 'competition') {
    if (normalized >= 8) return { semanticTone: 'high', semanticKey: 'high' };
    if (normalized >= 6) return { semanticTone: 'medium', semanticKey: 'noticeable' };
    if (normalized >= 4) return { semanticTone: 'medium', semanticKey: 'medium' };
    return { semanticTone: 'low', semanticKey: 'low' };
  }

  if (normalized >= 8) return { semanticTone: 'very-high', semanticKey: 'very_high' };
  if (normalized >= 6) return { semanticTone: 'high', semanticKey: 'high' };
  if (normalized >= 4) return { semanticTone: 'medium', semanticKey: 'medium' };
  return { semanticTone: 'low', semanticKey: 'low' };
}

function resolveOpportunitySummaryKey(params: {
  status: OpportunityStatus;
  demand: number;
  competition: number;
  growth: number;
  activity: number;
}): OpportunitySummaryKey {
  if (params.status === 'very_high') return 'very_high';
  if (params.status === 'good') return 'good';
  if (params.status === 'balanced') return params.competition >= 7 ? 'balanced_competitive' : 'balanced';
  if (params.status === 'competitive') return 'competitive';
  if (params.demand < 4 || params.growth < 4 || params.activity < 4) return 'low_demand';
  return 'low';
}

function buildOpportunityRadar(payload: WorkspaceStatisticsOverviewSourceDto): OpportunityItem[] {
  const cities = payload.demand.cities ?? [];
  if (cities.length === 0) return [];

  const categories = (payload.demand.categories ?? [])
    .slice()
    .sort((a, b) => (b.sharePercent - a.sharePercent) || (b.requestCount - a.requestCount));

  const growthIndex = clampUnit((payload.activity.metrics?.offerRatePercent ?? 0) / 100);
  const responseSpeedIndex =
    typeof payload.activity.metrics?.responseMedianMinutes === 'number' && Number.isFinite(payload.activity.metrics.responseMedianMinutes)
      ? clampUnit(1 - (payload.activity.metrics.responseMedianMinutes / 180))
      : 0.5;

  const demandByCity = cities.map((city) => Math.max(0, city.requestCount, city.anbieterSuchenCount ?? 0));
  const maxDemand = Math.max(1, ...demandByCity);

  const scored = cities.map((city) => {
    const demand = Math.max(0, city.requestCount, city.anbieterSuchenCount ?? 0);
    const providers = typeof city.auftragSuchenCount === 'number' && Number.isFinite(city.auftragSuchenCount)
      ? Math.max(0, Math.round(city.auftragSuchenCount))
      : 0;

    const marketBalanceRatio =
      typeof city.marketBalanceRatio === 'number' && Number.isFinite(city.marketBalanceRatio)
        ? city.marketBalanceRatio
        : (demand <= 0 && providers <= 0)
          ? null
          : roundRatio(demand / Math.max(1, providers));

    const demandIndex = clampUnit(demand / maxDemand);
    const competitionOpportunityIndex = marketBalanceRatio === null ? 0.5 : clampUnit(marketBalanceRatio / 1.5);

    const demandScore = roundScore(demandIndex * 10);
    const competitionScore = roundScore(competitionOpportunityIndex * 10);
    const growthScore = roundScore(growthIndex * 10);
    const activityScore = roundScore(responseSpeedIndex * 10);
    const competitionPressureScore = roundScore(10 - competitionScore);

    const score = roundScore(10 * (
      (demandIndex * 0.4) +
      (competitionOpportunityIndex * 0.3) +
      (growthIndex * 0.2) +
      (responseSpeedIndex * 0.1)
    ));

    const status = resolveOpportunityStatus(score);
    const metricsBase: Array<{ key: OpportunityMetricKey; value: number }> = [
      { key: 'demand', value: demandScore },
      { key: 'competition', value: competitionPressureScore },
      { key: 'growth', value: growthScore },
      { key: 'activity', value: activityScore },
    ];

    const metrics: OpportunityMetric[] = metricsBase.map((metric) => ({
      ...metric,
      ...resolveOpportunityMetricSemantic(metric.key, metric.value),
    }));

    return {
      cityId: city.cityId ?? null,
      citySlug: city.citySlug,
      cityName: city.cityName,
      category: null as (typeof categories)[number] | null,
      demand,
      providers,
      marketBalanceRatio,
      score,
      demandScore,
      competitionScore,
      growthScore,
      activityScore,
      status,
      tone: resolveOpportunityTone(status),
      summaryKey: resolveOpportunitySummaryKey({
        status,
        demand: demandScore,
        competition: competitionPressureScore,
        growth: growthScore,
        activity: activityScore,
      }),
      metrics,
    };
  });

  return scored
    .sort((a, b) =>
      (b.score - a.score) ||
      (b.demand - a.demand) ||
      a.cityName.localeCompare(b.cityName, 'de-DE')
    )
    .slice(0, 3)
    .map((item, index) => {
      const category = categories[index] ?? null;
      return {
        rank: (index + 1) as 1 | 2 | 3,
        cityId: item.cityId,
        city: item.cityName,
        categoryKey: category?.categoryKey ?? null,
        category: category?.categoryName ?? null,
        demand: item.demand,
        providers: item.providers,
        marketBalanceRatio: item.marketBalanceRatio,
        score: item.score,
        demandScore: item.demandScore,
        competitionScore: item.competitionScore,
        growthScore: item.growthScore,
        activityScore: item.activityScore,
        status: item.status,
        tone: item.tone,
        summaryKey: item.summaryKey,
        metrics: item.metrics,
      };
    });
}

function buildPriceIntelligence(payload: WorkspaceStatisticsOverviewSourceDto, opportunities: OpportunityItem[]): PriceIntelligence {
  const topOpportunity = opportunities[0] ?? null;
  const topCity = topOpportunity
    ? payload.demand.cities.find((city) => city.cityId === topOpportunity.cityId) ??
      payload.demand.cities.find((city) => city.cityName === topOpportunity.city)
    : null;

  const completedJobs = Number(payload.activity.metrics?.completedJobs ?? 0);
  const gmvAmount = Number(payload.activity.metrics?.gmvAmount ?? 0);
  const avgRevenue = completedJobs > 0 && Number.isFinite(gmvAmount)
    ? gmvAmount / completedJobs
    : null;

  if (typeof avgRevenue !== 'number' || !Number.isFinite(avgRevenue) || avgRevenue <= 0) {
    return {
      citySlug: topCity?.citySlug ?? null,
      city: topOpportunity?.city ?? null,
      categoryKey: topOpportunity?.categoryKey ?? null,
      category: topOpportunity?.category ?? null,
      recommendedMin: null,
      recommendedMax: null,
      marketAverage: null,
      optimalMin: null,
      optimalMax: null,
      smartRecommendedPrice: null,
      smartSignalTone: null,
      analyzedRequestsCount: topOpportunity?.demand ?? topCity?.requestCount ?? null,
      confidenceLevel: resolvePriceConfidenceLevel(topOpportunity?.demand ?? topCity?.requestCount ?? null),
      recommendation: null,
      profitPotentialScore: null,
      profitPotentialStatus: null,
    };
  }

  const recommendedMin = roundToNearestStep(avgRevenue * 0.85, 5);
  const recommendedMax = roundToNearestStep(avgRevenue * 1.15, 5);
  const marketAverage = roundToNearestStep(avgRevenue, 5);
  const rangeSpan = Math.max(0, recommendedMax - recommendedMin);
  const optimalMin = rangeSpan > 0 ? roundToNearestStep(recommendedMin + rangeSpan * 0.35, 5) : null;
  const optimalMax = rangeSpan > 0 ? roundToNearestStep(recommendedMin + rangeSpan * 0.7, 5) : null;
  const smartRecommendedPrice =
    optimalMin !== null && optimalMax !== null
      ? roundToNearestStep((optimalMin + optimalMax) / 2, 5)
      : null;
  const analyzedRequestsCount = topOpportunity?.demand ?? topCity?.requestCount ?? null;
  const confidenceLevel = resolvePriceConfidenceLevel(analyzedRequestsCount);
  const smartSignalTone = resolvePriceSmartSignalTone({
    smartRecommendedPrice,
    marketAverage,
  });
  const profitPotentialScore = topOpportunity?.score ?? null;
  const profitPotentialStatus = resolveProfitPotentialStatus(profitPotentialScore);

  return {
    citySlug: topCity?.citySlug ?? null,
    city: topOpportunity?.city ?? null,
    categoryKey: topOpportunity?.categoryKey ?? null,
    category: topOpportunity?.category ?? null,
    recommendedMin,
    recommendedMax,
    marketAverage,
    optimalMin,
    optimalMax,
    smartRecommendedPrice,
    smartSignalTone,
    analyzedRequestsCount,
    confidenceLevel,
    recommendation: null,
    profitPotentialScore,
    profitPotentialStatus,
  };
}

export function ensureStatisticsOpportunityContract(
  payload: WorkspaceStatisticsOverviewSourceDto,
): WorkspaceStatisticsOverviewSourceDto {
  const hasOpportunityRadar = Array.isArray(payload.opportunityRadar) && payload.opportunityRadar.length > 0;
  const hasPriceIntelligence = Boolean(payload.priceIntelligence);

  if (hasOpportunityRadar && hasPriceIntelligence) return payload;

  const opportunityRadar = hasOpportunityRadar
    ? payload.opportunityRadar ?? []
    : buildOpportunityRadar(payload);

  const derivedPriceIntelligence = buildPriceIntelligence(payload, opportunityRadar);
  const priceIntelligence = hasPriceIntelligence
    ? {
        ...(payload.priceIntelligence as PriceIntelligence),
        citySlug: coalesceNullable(payload.priceIntelligence?.citySlug, derivedPriceIntelligence.citySlug),
        city: coalesceNullable(payload.priceIntelligence?.city, derivedPriceIntelligence.city),
        categoryKey: coalesceNullable(payload.priceIntelligence?.categoryKey, derivedPriceIntelligence.categoryKey),
        category: coalesceNullable(payload.priceIntelligence?.category, derivedPriceIntelligence.category),
        recommendedMin: coalesceNullable(payload.priceIntelligence?.recommendedMin, derivedPriceIntelligence.recommendedMin),
        recommendedMax: coalesceNullable(payload.priceIntelligence?.recommendedMax, derivedPriceIntelligence.recommendedMax),
        marketAverage: coalesceNullable(payload.priceIntelligence?.marketAverage, derivedPriceIntelligence.marketAverage),
        optimalMin: coalesceNullable(payload.priceIntelligence?.optimalMin, derivedPriceIntelligence.optimalMin),
        optimalMax: coalesceNullable(payload.priceIntelligence?.optimalMax, derivedPriceIntelligence.optimalMax),
        smartRecommendedPrice: coalesceNullable(
          payload.priceIntelligence?.smartRecommendedPrice,
          derivedPriceIntelligence.smartRecommendedPrice,
        ),
        smartSignalTone: coalesceNullable(payload.priceIntelligence?.smartSignalTone, derivedPriceIntelligence.smartSignalTone),
        analyzedRequestsCount: coalesceNullable(
          payload.priceIntelligence?.analyzedRequestsCount,
          derivedPriceIntelligence.analyzedRequestsCount,
        ),
        confidenceLevel: coalesceNullable(payload.priceIntelligence?.confidenceLevel, derivedPriceIntelligence.confidenceLevel),
        recommendation: coalesceNullable(payload.priceIntelligence?.recommendation, derivedPriceIntelligence.recommendation),
        profitPotentialScore: coalesceNullable(
          payload.priceIntelligence?.profitPotentialScore,
          derivedPriceIntelligence.profitPotentialScore,
        ),
        profitPotentialStatus: coalesceNullable(
          payload.priceIntelligence?.profitPotentialStatus,
          derivedPriceIntelligence.profitPotentialStatus,
        ),
      }
    : derivedPriceIntelligence;

  return {
    ...payload,
    opportunityRadar,
    priceIntelligence,
  };
}
