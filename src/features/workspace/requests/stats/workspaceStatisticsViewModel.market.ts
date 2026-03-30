import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type {
  WorkspaceStatisticsCityRowView,
  WorkspaceStatisticsOpportunityRadarItemView,
} from './workspaceStatistics.model';
import { buildPriceIntelligence as buildPriceIntelligenceView } from './workspaceStatisticsViewModel.pricing';

export function buildCityRows(
  source: WorkspaceStatisticsDecisionDashboardDto['demand']['cities'] | undefined,
): WorkspaceStatisticsCityRowView[] {
  if (!source?.length) return [];

  return source.map((item) => ({
    key: item.citySlug,
    cityId: item.cityId ?? null,
    name: item.cityName,
    count: Math.max(0, Math.round(item.requestCount ?? 0)),
    auftragSuchenCount:
      typeof item.auftragSuchenCount === 'number' && Number.isFinite(item.auftragSuchenCount)
        ? Math.max(0, Math.round(item.auftragSuchenCount))
        : null,
    anbieterSuchenCount:
      typeof item.anbieterSuchenCount === 'number' && Number.isFinite(item.anbieterSuchenCount)
        ? Math.max(0, Math.round(item.anbieterSuchenCount))
        : null,
    providersActive:
      typeof item.providersActive === 'number' && Number.isFinite(item.providersActive)
        ? Math.max(0, Math.round(item.providersActive))
        : null,
    marketBalanceRatio:
      typeof item.marketBalanceRatio === 'number' && Number.isFinite(item.marketBalanceRatio)
        ? item.marketBalanceRatio
        : null,
    score:
      typeof item.score === 'number' && Number.isFinite(item.score)
        ? item.score
        : null,
    rank:
      typeof item.rank === 'number' && Number.isFinite(item.rank)
        ? Math.max(1, Math.round(item.rank))
        : null,
    signal: item.signal ?? 'none',
    peerContext: item.peerContext ?? null,
  }));
}

export function buildOpportunityRadar(params: {
  copy: Parameters<typeof buildPriceIntelligenceView>[0]['copy'];
  locale: Locale;
  localeTag: string;
  formatCurrency: Intl.NumberFormat;
  source: WorkspaceStatisticsDecisionDashboardDto['opportunityRadar'] | undefined;
}): WorkspaceStatisticsOpportunityRadarItemView[] {
  const {
    copy,
    locale,
    localeTag,
    formatCurrency,
    source,
  } = params;
  if (!source?.length) return [];

  const fallbackCategory = locale === 'de' ? 'Generalistisch' : 'General';
  return source.map((item, index) => {
    const hrefParams = new URLSearchParams({ section: 'requests' });
    if (item.cityId) hrefParams.set('cityId', item.cityId);
    if (item.categoryKey) hrefParams.set('categoryKey', item.categoryKey);

    return {
      rank: (item.rank ?? index + 1) as 1 | 2 | 3,
      cityId: item.cityId ?? null,
      city: item.city,
      categoryKey: item.categoryKey ?? null,
      category: item.category ?? fallbackCategory,
      demand: Math.max(0, Math.round(item.demand ?? 0)),
      providers:
        typeof item.providers === 'number' && Number.isFinite(item.providers)
          ? Math.max(0, Math.round(item.providers))
          : null,
      marketBalanceRatio:
        typeof item.marketBalanceRatio === 'number' && Number.isFinite(item.marketBalanceRatio)
          ? item.marketBalanceRatio
          : null,
      score: Number(item.score ?? 0),
      demandScore: Number(item.demandScore ?? 0),
      competitionScore: Number(item.competitionScore ?? 0),
      growthScore: Number(item.growthScore ?? 0),
      activityScore: Number(item.activityScore ?? 0),
      status: item.status,
      summaryKey: item.summaryKey,
      metrics: item.metrics ?? [],
      tone: item.tone,
      peerContext: item.peerContext ?? null,
      priceIntelligence: item.priceIntelligence
        ? buildPriceIntelligenceView({
            copy,
            source: item.priceIntelligence,
            contextCityFallback: item.city,
            contextCategoryFallback: item.category ?? fallbackCategory,
            locale,
            localeTag,
            formatCurrency,
          })
        : null,
      href: `/workspace?${hrefParams.toString()}`,
    };
  });
}
