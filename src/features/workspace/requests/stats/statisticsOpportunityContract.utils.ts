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

type CityRow = NonNullable<WorkspaceStatisticsOverviewSourceDto['demand']['cities']>[number];
type OpportunityCandidate = Omit<OpportunityItem, 'rank' | 'peerContext' | 'priceIntelligence'> & {
  citySlug: string;
  lat: number | null;
  lng: number | null;
};

export type OpportunityClusterFilters = {
  cityId?: string | null;
  categoryKey?: string | null;
  limit?: number;
};

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
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

function average(values: Array<number | null | undefined>): number | null {
  const normalized = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (normalized.length === 0) return null;
  return normalized.reduce((sum, value) => sum + value, 0) / normalized.length;
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : null;
}

function resolveCityKeyFromCity(city: CityRow): string {
  return city.cityId ?? city.citySlug;
}

function resolveCityKeyFromOpportunity(item: Pick<OpportunityItem, 'cityId' | 'city'>): string {
  return item.cityId ?? item.city;
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

function mergePriceIntelligence(
  preferred: Partial<PriceIntelligence> | null | undefined,
  fallback: PriceIntelligence,
): PriceIntelligence {
  if (!preferred) return fallback;
  return {
    citySlug: coalesceNullable(preferred.citySlug, fallback.citySlug),
    city: coalesceNullable(preferred.city, fallback.city),
    categoryKey: coalesceNullable(preferred.categoryKey, fallback.categoryKey),
    category: coalesceNullable(preferred.category, fallback.category),
    recommendedMin: coalesceNullable(preferred.recommendedMin, fallback.recommendedMin),
    recommendedMax: coalesceNullable(preferred.recommendedMax, fallback.recommendedMax),
    marketAverage: coalesceNullable(preferred.marketAverage, fallback.marketAverage),
    optimalMin: coalesceNullable(preferred.optimalMin, fallback.optimalMin),
    optimalMax: coalesceNullable(preferred.optimalMax, fallback.optimalMax),
    smartRecommendedPrice: coalesceNullable(preferred.smartRecommendedPrice, fallback.smartRecommendedPrice),
    smartSignalTone: coalesceNullable(preferred.smartSignalTone, fallback.smartSignalTone),
    analyzedRequestsCount: coalesceNullable(preferred.analyzedRequestsCount, fallback.analyzedRequestsCount),
    confidenceLevel: coalesceNullable(preferred.confidenceLevel, fallback.confidenceLevel),
    recommendation: coalesceNullable(preferred.recommendation, fallback.recommendation),
    profitPotentialScore: coalesceNullable(preferred.profitPotentialScore, fallback.profitPotentialScore),
    profitPotentialStatus: coalesceNullable(preferred.profitPotentialStatus, fallback.profitPotentialStatus),
  };
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

function resolveCategoryContext(
  payload: WorkspaceStatisticsOverviewSourceDto,
  preferredCategoryKey: string | null | undefined,
): { key: string | null; label: string | null } {
  const categories = (payload.demand.categories ?? [])
    .slice()
    .sort((a, b) => (b.sharePercent - a.sharePercent) || (b.requestCount - a.requestCount));
  const normalizedPreferred = normalizeText(preferredCategoryKey);

  if (normalizedPreferred) {
    const selectedDemandCategory = categories.find((item) => normalizeText(item.categoryKey) === normalizedPreferred);
    if (selectedDemandCategory) {
      return {
        key: selectedDemandCategory.categoryKey ?? normalizedPreferred,
        label: selectedDemandCategory.categoryName,
      };
    }

    const selectedOpportunityCategory = (payload.opportunityRadar ?? []).find(
      (item) => normalizeText(item.categoryKey) === normalizedPreferred,
    );
    if (selectedOpportunityCategory) {
      return {
        key: selectedOpportunityCategory.categoryKey ?? normalizedPreferred,
        label: selectedOpportunityCategory.category ?? null,
      };
    }
  }

  const priceCategoryKey = normalizeText(payload.priceIntelligence?.categoryKey);
  const priceCategoryLabel = normalizeText(payload.priceIntelligence?.category);
  if (priceCategoryKey || priceCategoryLabel) {
    return {
      key: priceCategoryKey,
      label: priceCategoryLabel,
    };
  }

  const leadingCategory = categories[0];
  if (leadingCategory) {
    return {
      key: leadingCategory.categoryKey ?? null,
      label: leadingCategory.categoryName,
    };
  }

  const opportunityCategory = (payload.opportunityRadar ?? []).find((item) => normalizeText(item.category) !== null);
  return {
    key: normalizeText(opportunityCategory?.categoryKey),
    label: normalizeText(opportunityCategory?.category),
  };
}

function findCityRow(
  payload: WorkspaceStatisticsOverviewSourceDto,
  item: Pick<OpportunityItem, 'cityId' | 'city'>,
): CityRow | null {
  return (
    payload.demand.cities.find((city) => city.cityId && item.cityId && city.cityId === item.cityId) ??
    payload.demand.cities.find((city) => city.cityName === item.city) ??
    null
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(from: CityRow | null, to: CityRow | null): number | null {
  if (!from || !to) return null;
  if (from.lat === null || from.lng === null || to.lat === null || to.lng === null) return null;

  const earthRadiusKm = 6371;
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const originLat = toRadians(from.lat);
  const destinationLat = toRadians(to.lat);

  const a =
    (Math.sin(latDelta / 2) ** 2) +
    (Math.cos(originLat) * Math.cos(destinationLat) * (Math.sin(lngDelta / 2) ** 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return roundRatio(earthRadiusKm * c);
}

function buildDerivedOpportunityCandidates(
  payload: WorkspaceStatisticsOverviewSourceDto,
  preferredCategoryKey?: string | null,
): OpportunityCandidate[] {
  const cities = payload.demand.cities ?? [];
  if (cities.length === 0) return [];

  const categoryContext = resolveCategoryContext(payload, preferredCategoryKey);
  const growthIndex = clampUnit((payload.activity.metrics?.offerRatePercent ?? 0) / 100);
  const responseSpeedIndex =
    typeof payload.activity.metrics?.responseMedianMinutes === 'number' && Number.isFinite(payload.activity.metrics.responseMedianMinutes)
      ? clampUnit(1 - (payload.activity.metrics.responseMedianMinutes / 180))
      : 0.5;
  const demandByCity = cities.map((city) => Math.max(0, city.requestCount, city.anbieterSuchenCount ?? 0));
  const maxDemand = Math.max(1, ...demandByCity);
  const sourceByCityKey = new Map(
    (payload.opportunityRadar ?? []).map((item) => [resolveCityKeyFromOpportunity(item), item]),
  );

  const cityCandidates = cities
    .map((city) => {
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

      const derived: OpportunityCandidate = {
        cityId: city.cityId ?? null,
        city: city.cityName,
        citySlug: city.citySlug,
        categoryKey: categoryContext.key,
        category: categoryContext.label,
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
        lat: city.lat,
        lng: city.lng,
      };

      const sourceItem = sourceByCityKey.get(resolveCityKeyFromCity(city));
      if (!sourceItem) return derived;

      return {
        ...derived,
        cityId: sourceItem.cityId ?? derived.cityId,
        city: sourceItem.city ?? derived.city,
        categoryKey: categoryContext.key ?? sourceItem.categoryKey ?? null,
        category: categoryContext.label ?? sourceItem.category ?? null,
        demand: typeof sourceItem.demand === 'number' ? sourceItem.demand : derived.demand,
        providers: typeof sourceItem.providers === 'number' ? sourceItem.providers : derived.providers,
        marketBalanceRatio: sourceItem.marketBalanceRatio ?? derived.marketBalanceRatio,
        score: typeof sourceItem.score === 'number' ? sourceItem.score : derived.score,
        demandScore: typeof sourceItem.demandScore === 'number' ? sourceItem.demandScore : derived.demandScore,
        competitionScore: typeof sourceItem.competitionScore === 'number' ? sourceItem.competitionScore : derived.competitionScore,
        growthScore: typeof sourceItem.growthScore === 'number' ? sourceItem.growthScore : derived.growthScore,
        activityScore: typeof sourceItem.activityScore === 'number' ? sourceItem.activityScore : derived.activityScore,
        status: sourceItem.status ?? derived.status,
        tone: sourceItem.tone ?? derived.tone,
        summaryKey: sourceItem.summaryKey ?? derived.summaryKey,
        metrics: sourceItem.metrics?.length ? sourceItem.metrics : derived.metrics,
      };
    });
  const seenCityKeys = new Set(cityCandidates.map((item) => resolveCityKeyFromOpportunity(item)));
  const extraSourceCandidates = (payload.opportunityRadar ?? [])
    .filter((item) => !seenCityKeys.has(resolveCityKeyFromOpportunity(item)))
    .map<OpportunityCandidate>((item) => ({
      cityId: item.cityId ?? null,
      city: item.city,
      citySlug: normalizeText(item.city)?.toLowerCase().replace(/\s+/g, '-') ?? 'unknown-city',
      categoryKey: categoryContext.key ?? item.categoryKey ?? null,
      category: categoryContext.label ?? item.category ?? null,
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
      metrics: item.metrics ?? [],
      lat: null,
      lng: null,
    }));

  return [...cityCandidates, ...extraSourceCandidates]
    .sort((a, b) =>
      (b.score - a.score) ||
      (b.demand - a.demand) ||
      a.city.localeCompare(b.city, 'de-DE')
    );
}

function matchesScopedCategory(candidate: OpportunityCandidate, selectedCategoryKey: string | null | undefined) {
  const normalizedSelected = normalizeText(selectedCategoryKey);
  if (!normalizedSelected) return true;
  return normalizeText(candidate.categoryKey) === normalizedSelected;
}

function resolveOpportunityAnchor(
  candidates: OpportunityCandidate[],
  filters: OpportunityClusterFilters,
): OpportunityCandidate | null {
  if (filters.cityId) {
    return (
      candidates.find((item) => item.cityId === filters.cityId && matchesScopedCategory(item, filters.categoryKey)) ??
      candidates.find((item) => item.cityId === filters.cityId) ??
      null
    );
  }

  return candidates[0] ?? null;
}

function buildOpportunityPriceIntelligence(params: {
  payload: WorkspaceStatisticsOverviewSourceDto;
  opportunity: OpportunityCandidate;
  peerGroup: OpportunityCandidate[];
  sourcePriceIntelligence?: PriceIntelligence | null;
}): PriceIntelligence {
  const { payload, opportunity, peerGroup, sourcePriceIntelligence } = params;
  const opportunityCity = findCityRow(payload, opportunity);
  const completedJobs = Number(payload.activity.metrics?.completedJobs ?? 0);
  const gmvAmount = Number(payload.activity.metrics?.gmvAmount ?? 0);
  const avgRevenue = completedJobs > 0 && Number.isFinite(gmvAmount)
    ? gmvAmount / completedJobs
    : null;

  const analyzedRequestsCount = opportunity.demand + Math.round(
    peerGroup.reduce((sum, item) => sum + item.demand, 0) * 0.35,
  );
  const confidenceLevel = resolvePriceConfidenceLevel(analyzedRequestsCount);
  const baseFallback: PriceIntelligence = {
    citySlug: opportunityCity?.citySlug ?? null,
    city: opportunity.city,
    categoryKey: opportunity.categoryKey,
    category: opportunity.category,
    recommendedMin: null,
    recommendedMax: null,
    marketAverage: null,
    optimalMin: null,
    optimalMax: null,
    smartRecommendedPrice: null,
    smartSignalTone: null,
    analyzedRequestsCount,
    confidenceLevel,
    recommendation: null,
    profitPotentialScore: opportunity.score,
    profitPotentialStatus: resolveProfitPotentialStatus(opportunity.score),
  };

  if (typeof avgRevenue !== 'number' || !Number.isFinite(avgRevenue) || avgRevenue <= 0) {
    return mergePriceIntelligence(sourcePriceIntelligence, baseFallback);
  }

  const peerDemandAverage = average(peerGroup.map((item) => item.demand)) ?? opportunity.demand;
  const peerBalanceAverage = average(peerGroup.map((item) => item.marketBalanceRatio)) ?? (opportunity.marketBalanceRatio ?? 1);
  const peerScoreAverage = average(peerGroup.map((item) => item.score)) ?? opportunity.score;
  const demandDelta = peerDemandAverage > 0 ? (opportunity.demand - peerDemandAverage) / peerDemandAverage : 0;
  const balanceDelta =
    peerBalanceAverage > 0 && typeof opportunity.marketBalanceRatio === 'number'
      ? (opportunity.marketBalanceRatio - peerBalanceAverage) / peerBalanceAverage
      : 0;
  const scoreDelta = (opportunity.score - peerScoreAverage) / 10;
  const marketAdjustment = clampNumber(
    (clampNumber(demandDelta, -1, 1) * 0.05) +
      (clampNumber(balanceDelta, -1, 1) * 0.04) +
      (clampNumber(scoreDelta, -0.5, 0.5) * 0.03),
    -0.08,
    0.12,
  );
  const marketAverage = roundToNearestStep(avgRevenue * (1 + marketAdjustment), 5);
  const recommendedMin = roundToNearestStep(marketAverage * 0.88, 5);
  let recommendedMax = roundToNearestStep(marketAverage * 1.12, 5);
  if (recommendedMax <= recommendedMin) {
    recommendedMax = recommendedMin + 10;
  }
  const optimalMin = roundToNearestStep(marketAverage * 0.96, 5);
  const optimalMax = roundToNearestStep(marketAverage * 1.05, 5);
  const smartRecommendedPrice = roundToNearestStep((optimalMin + optimalMax) / 2, 5);
  const derived: PriceIntelligence = {
    citySlug: opportunityCity?.citySlug ?? null,
    city: opportunity.city,
    categoryKey: opportunity.categoryKey,
    category: opportunity.category,
    recommendedMin,
    recommendedMax,
    marketAverage,
    optimalMin,
    optimalMax,
    smartRecommendedPrice,
    smartSignalTone: resolvePriceSmartSignalTone({
      smartRecommendedPrice,
      marketAverage,
    }),
    analyzedRequestsCount,
    confidenceLevel,
    recommendation: null,
    profitPotentialScore: roundScore(clampNumber(opportunity.score + (marketAdjustment * 5), 0, 10)),
    profitPotentialStatus: resolveProfitPotentialStatus(opportunity.score),
  };

  return mergePriceIntelligence(sourcePriceIntelligence, derived);
}

function resolveSourcePriceIntelligence(
  payload: WorkspaceStatisticsOverviewSourceDto,
  opportunity: OpportunityCandidate,
): PriceIntelligence | null {
  const matchingOpportunityPrice = (payload.opportunityRadar ?? []).find(
    (item) => resolveCityKeyFromOpportunity(item) === resolveCityKeyFromOpportunity(opportunity),
  )?.priceIntelligence;
  if (matchingOpportunityPrice) return matchingOpportunityPrice;

  const sourcePrice = payload.priceIntelligence;
  if (!sourcePrice) return null;

  const cityMatches = normalizeText(sourcePrice.city) === normalizeText(opportunity.city);
  const categoryMatches =
    normalizeText(sourcePrice.categoryKey) === normalizeText(opportunity.categoryKey) ||
    normalizeText(sourcePrice.category) === normalizeText(opportunity.category);

  return cityMatches && categoryMatches ? sourcePrice : null;
}

export function buildFocusedOpportunityRadar(
  payload: WorkspaceStatisticsOverviewSourceDto,
  filters: OpportunityClusterFilters = {},
): OpportunityItem[] {
  const limit = Math.max(1, Math.min(3, Math.trunc(filters.limit ?? 3)));
  const candidates = buildDerivedOpportunityCandidates(payload, filters.categoryKey);
  if (candidates.length === 0) return [];

  const anchor = resolveOpportunityAnchor(candidates, filters);
  if (!anchor) return [];

  const anchorCity = findCityRow(payload, anchor);
  const peerPool = candidates.filter((item) => resolveCityKeyFromOpportunity(item) !== resolveCityKeyFromOpportunity(anchor));
  const orderedCluster = filters.cityId
    ? [
        anchor,
        ...peerPool
          .map((item) => ({
            item,
            distanceKm: calculateDistanceKm(anchorCity, findCityRow(payload, item)),
          }))
          .sort((a, b) =>
            ((a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY)) ||
            (b.item.score - a.item.score) ||
            (b.item.demand - a.item.demand) ||
            a.item.city.localeCompare(b.item.city, 'de-DE')
          )
          .map((entry) => entry.item)
          .slice(0, Math.max(0, limit - 1)),
      ]
    : [anchor, ...peerPool.slice(0, Math.max(0, limit - 1))];

  return orderedCluster.slice(0, limit).map((item, index, cluster) => {
    const peerGroup = cluster.filter((candidate) => resolveCityKeyFromOpportunity(candidate) !== resolveCityKeyFromOpportunity(item));
    const distanceKm =
      filters.cityId && index > 0
        ? calculateDistanceKm(anchorCity, findCityRow(payload, item))
        : null;

    return {
      rank: (index + 1) as 1 | 2 | 3,
      cityId: item.cityId,
      city: item.city,
      categoryKey: item.categoryKey,
      category: item.category,
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
      peerContext: {
        role: index === 0 ? 'focus' : 'competitor',
        distanceKm,
        reason: filters.cityId
          ? (index === 0 ? 'selected_city' : 'nearby_competitor')
          : 'top_ranked',
      },
      priceIntelligence: buildOpportunityPriceIntelligence({
        payload,
        opportunity: item,
        peerGroup,
        sourcePriceIntelligence: resolveSourcePriceIntelligence(payload, item),
      }),
    };
  });
}

function buildPriceIntelligence(
  payload: WorkspaceStatisticsOverviewSourceDto,
  opportunities: OpportunityItem[],
): PriceIntelligence {
  const topOpportunity = opportunities[0];
  if (topOpportunity?.priceIntelligence) {
    return topOpportunity.priceIntelligence;
  }

  if (!topOpportunity) {
    return {
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
    };
  }

  const derivedTop = buildFocusedOpportunityRadar(payload, {
    cityId: topOpportunity.cityId,
    categoryKey: topOpportunity.categoryKey,
    limit: 3,
  })[0];

  return derivedTop?.priceIntelligence ?? {
    citySlug: null,
    city: topOpportunity.city,
    categoryKey: topOpportunity.categoryKey,
    category: topOpportunity.category,
    recommendedMin: null,
    recommendedMax: null,
    marketAverage: null,
    optimalMin: null,
    optimalMax: null,
    smartRecommendedPrice: null,
    smartSignalTone: null,
    analyzedRequestsCount: topOpportunity.demand,
    confidenceLevel: resolvePriceConfidenceLevel(topOpportunity.demand),
    recommendation: null,
    profitPotentialScore: topOpportunity.score,
    profitPotentialStatus: resolveProfitPotentialStatus(topOpportunity.score),
  };
}

export function ensureStatisticsOpportunityContract(
  payload: WorkspaceStatisticsOverviewSourceDto,
): WorkspaceStatisticsOverviewSourceDto {
  const needsOpportunityDerivation =
    !Array.isArray(payload.opportunityRadar) ||
    payload.opportunityRadar.length === 0 ||
    payload.opportunityRadar.some((item) => !item.priceIntelligence);
  const opportunityRadar: OpportunityItem[] = needsOpportunityDerivation
    ? buildFocusedOpportunityRadar(payload, {
        categoryKey: payload.priceIntelligence?.categoryKey ?? null,
        limit: 3,
      })
    : (payload.opportunityRadar ?? []);

  const priceIntelligence = mergePriceIntelligence(
    payload.priceIntelligence ?? null,
    buildPriceIntelligence(payload, opportunityRadar),
  );

  return {
    ...payload,
    opportunityRadar,
    priceIntelligence,
  };
}
