import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type { WorkspaceStatisticsPriceIntelligenceView } from './workspaceStatistics.model';

function formatCurrencyRangeCompact(params: {
  min: number;
  max: number;
  localeTag: string;
}): string {
  const currencyFormatter = new Intl.NumberFormat(params.localeTag, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
  const minLabel = currencyFormatter.format(params.min);
  const maxLabel = currencyFormatter.format(params.max);
  return `${minLabel}\u2013${maxLabel}`;
}

export function buildPriceIntelligence(params: {
  copy: WorkspaceStatisticsCopy;
  source: WorkspaceStatisticsDecisionDashboardDto['priceIntelligence'] | undefined;
  contextCityFallback: string | null;
  contextCategoryFallback: string | null;
  localeTag: string;
  formatCurrency: Intl.NumberFormat;
}): WorkspaceStatisticsPriceIntelligenceView {
  const {
    copy,
    source,
    contextCityFallback,
    contextCategoryFallback,
    localeTag,
    formatCurrency,
  } = params;
  const fallbackContextLabel = contextCategoryFallback && contextCityFallback
    ? `${contextCategoryFallback} · ${contextCityFallback}`
    : contextCityFallback ?? contextCategoryFallback ?? null;

  if (!source) {
    return {
      cityLabel: contextCityFallback,
      categoryLabel: contextCategoryFallback,
      contextLabel: fallbackContextLabel,
      recommendedRangeLabel: null,
      marketAverageLabel: null,
      recommendedMin: null,
      recommendedMax: null,
      marketAverage: null,
      optimalMin: null,
      optimalMax: null,
      optimalMinLabel: null,
      optimalMaxLabel: null,
      recommendation: null,
      profitPotentialScore: null,
      profitPotentialStatus: null,
      profitPotentialLabel: null,
    };
  }

  const cityLabel = source.city ?? contextCityFallback ?? null;
  const categoryLabel = source.category ?? contextCategoryFallback ?? null;
  const contextLabel =
    categoryLabel && cityLabel ? `${categoryLabel} · ${cityLabel}` : cityLabel ?? categoryLabel ?? fallbackContextLabel;
  const recommendedMin =
    typeof source.recommendedMin === 'number' && Number.isFinite(source.recommendedMin)
      ? source.recommendedMin
      : null;
  const recommendedMax =
    typeof source.recommendedMax === 'number' && Number.isFinite(source.recommendedMax)
      ? source.recommendedMax
      : null;
  const recommendedRangeLabel =
    recommendedMin !== null && recommendedMax !== null
      ? formatCurrencyRangeCompact({
          min: recommendedMin,
          max: recommendedMax,
          localeTag,
        })
      : null;
  const marketAverage =
    typeof source.marketAverage === 'number' && Number.isFinite(source.marketAverage)
      ? source.marketAverage
      : null;
  const optimalMinValue =
    typeof source.optimalMin === 'number' && Number.isFinite(source.optimalMin)
      ? source.optimalMin
      : null;
  const optimalMaxValue =
    typeof source.optimalMax === 'number' && Number.isFinite(source.optimalMax)
      ? source.optimalMax
      : null;
  const recommendation =
    typeof source.recommendation === 'string' && source.recommendation.trim().length > 0
      ? source.recommendation
      : null;
  const profitPotentialScore =
    typeof source.profitPotentialScore === 'number' && Number.isFinite(source.profitPotentialScore)
      ? source.profitPotentialScore
      : null;
  const profitPotentialStatus = source.profitPotentialStatus ?? null;
  const profitPotentialLabel =
    profitPotentialStatus === 'high'
      ? copy.priceProfitHighLabel
      : profitPotentialStatus === 'medium'
        ? copy.priceProfitMediumLabel
        : profitPotentialStatus === 'low'
          ? copy.priceProfitLowLabel
          : null;

  return {
    cityLabel,
    categoryLabel,
    contextLabel,
    recommendedRangeLabel,
    marketAverageLabel: marketAverage !== null ? formatCurrency.format(marketAverage) : null,
    recommendedMin,
    recommendedMax,
    marketAverage,
    optimalMin: optimalMinValue,
    optimalMax: optimalMaxValue,
    optimalMinLabel: optimalMinValue !== null ? formatCurrency.format(optimalMinValue) : null,
    optimalMaxLabel: optimalMaxValue !== null ? formatCurrency.format(optimalMaxValue) : null,
    recommendation,
    profitPotentialScore,
    profitPotentialStatus,
    profitPotentialLabel,
  };
}
