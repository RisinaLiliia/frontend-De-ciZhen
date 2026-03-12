import type {
  WorkspacePublicCityActivityItemDto,
  WorkspaceStatisticsCityDemandDto,
  WorkspaceStatisticsInsightDto,
} from '@/lib/api/dto/workspace';

type InsightGroup = 'market' | 'performance' | 'growth' | 'risk' | 'promotion' | 'other';

export function inferInsightType(
  insight: WorkspaceStatisticsInsightDto,
): NonNullable<WorkspaceStatisticsInsightDto['type']> | 'other' {
  if (insight.type) return insight.type;
  if (insight.code.includes('promotion') || insight.code.includes('ads')) return 'promotion';
  if (insight.code.includes('opportunity')) return 'opportunity';
  if (insight.code.includes('profile_')) return 'growth';
  if (insight.code.includes('response') || insight.code.includes('conversion')) return 'performance';
  if (insight.code.includes('risk') || insight.code.includes('unanswered')) return 'risk';
  if (insight.code.includes('demand') || insight.code.includes('city') || insight.code.includes('category')) return 'demand';
  return 'other';
}

function toInsightGroup(insight: WorkspaceStatisticsInsightDto): InsightGroup {
  const type = inferInsightType(insight);
  if (type === 'demand' || type === 'opportunity') return 'market';
  if (type === 'performance') return 'performance';
  if (type === 'growth') return 'growth';
  if (type === 'risk') return 'risk';
  if (type === 'promotion') return 'promotion';
  return 'other';
}

function toInsightContextBucket(insight: WorkspaceStatisticsInsightDto): string {
  const context = (insight.context ?? '').trim().toLowerCase();
  if (!context) return `${insight.code}:none`;
  if (insight.code.includes('city')) return `city:${context}`;
  if (insight.code.includes('category')) return `category:${context}`;
  return `${insight.code}:${context}`;
}

export function mergeInsightsByIdentity(
  insights: WorkspaceStatisticsInsightDto[],
): WorkspaceStatisticsInsightDto[] {
  const map = new Map<string, WorkspaceStatisticsInsightDto>();
  for (const item of insights) {
    const key = `${item.code}:${(item.context ?? '').trim().toLowerCase()}`;
    const existing = map.get(key);
    if (!existing || (item.score ?? 0) > (existing.score ?? 0)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

export function selectInsightsForDisplay(
  insights: WorkspaceStatisticsInsightDto[],
  mode: 'platform' | 'personalized',
): WorkspaceStatisticsInsightDto[] {
  if (insights.length === 0) return insights;

  const ranked = insights.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const selected: WorkspaceStatisticsInsightDto[] = [];
  const contextCounts = new Map<string, number>();
  let promotionCount = 0;
  let riskCount = 0;

  const canTake = (candidate: WorkspaceStatisticsInsightDto): boolean => {
    const type = inferInsightType(candidate);
    const bucket = toInsightContextBucket(candidate);
    const bucketCount = contextCounts.get(bucket) ?? 0;
    if (bucketCount >= 2) return false;
    if (type === 'promotion' && promotionCount >= 1) return false;
    if (type === 'risk' && riskCount >= 1) return false;
    return true;
  };

  const take = (candidate: WorkspaceStatisticsInsightDto) => {
    const bucket = toInsightContextBucket(candidate);
    contextCounts.set(bucket, (contextCounts.get(bucket) ?? 0) + 1);
    const type = inferInsightType(candidate);
    if (type === 'promotion') promotionCount += 1;
    if (type === 'risk') riskCount += 1;
    selected.push(candidate);
  };

  const targetGroups: InsightGroup[] =
    mode === 'personalized'
      ? ['market', 'performance', 'growth', 'promotion']
      : ['market', 'market', 'risk', 'promotion'];

  for (const group of targetGroups) {
    if (selected.length >= 4) break;
    const candidate = ranked.find((item) => !selected.includes(item) && toInsightGroup(item) === group && canTake(item));
    if (candidate) take(candidate);
  }

  for (const candidate of ranked) {
    if (selected.length >= 4) break;
    if (selected.includes(candidate)) continue;
    if (!canTake(candidate)) continue;
    take(candidate);
  }

  return selected.slice(0, 4);
}

export type WorkspaceStatisticsCitySearchSignalDto = Omit<
  WorkspaceStatisticsCityDemandDto,
  'auftragSuchenCount' | 'anbieterSuchenCount' | 'marketBalanceRatio' | 'signal'
> & {
  auftragSuchenCount?: number;
  anbieterSuchenCount?: number;
  marketBalanceRatio?: number | null;
  signal?: 'high' | 'medium' | 'low' | 'none';
};

export function mergeFullCityRanking(params: {
  statsCities: WorkspaceStatisticsCitySearchSignalDto[];
  publicCities: WorkspacePublicCityActivityItemDto[];
}): WorkspaceStatisticsCitySearchSignalDto[] {
  if (params.publicCities.length === 0) return params.statsCities;

  const statsBySlug = new Map<string, WorkspaceStatisticsCitySearchSignalDto>();
  const statsByName = new Map<string, WorkspaceStatisticsCitySearchSignalDto>();

  for (const city of params.statsCities) {
    statsBySlug.set(city.citySlug, city);
    statsByName.set(city.cityName.trim().toLowerCase(), city);
  }

  return params.publicCities
    .slice()
    .sort((a, b) => b.requestCount - a.requestCount)
    .map((city) => {
      const bySlug = statsBySlug.get(city.citySlug);
      const byName = statsByName.get(city.cityName.trim().toLowerCase());
      const statsCity = bySlug ?? byName;
      return {
        citySlug: city.citySlug,
        cityName: city.cityName,
        cityId: city.cityId,
        requestCount: city.requestCount,
        lat: city.lat,
        lng: city.lng,
        auftragSuchenCount: statsCity?.auftragSuchenCount,
        anbieterSuchenCount: statsCity?.anbieterSuchenCount,
        marketBalanceRatio: statsCity?.marketBalanceRatio ?? null,
        signal: statsCity?.signal ?? 'none',
      };
    });
}
