export {
  buildActivitySignals,
  buildActivityTrend,
  buildKpis,
  DEFAULT_ACTIVITY_METRICS,
} from './statisticsViewModel.activity';

export {
  buildCityRows,
  buildOpportunityRadar,
} from './statisticsViewModel.market';

export {
  buildPriceIntelligence,
} from './statisticsViewModel.pricing';

export {
  buildFunnel,
  buildFunnelComparison,
  buildFunnelConversion,
  buildFunnelDropoff,
  buildFunnelSummary,
} from './statisticsViewModel.funnel';

export {
  buildContext,
  buildContextHealthMetrics,
  buildGrowthCards,
  buildInsights,
  buildSectionMeta,
  ensureSelectedFilterOption,
  normalizeNullableFilterValue,
  resolveContextPeriodLabel,
  resolveDecisionInsight,
} from './statisticsViewModel.context';

export {
  buildCategoryFit,
  buildCityComparison,
  buildDecisionLayerSignals,
  buildPersonalizedPricingSection,
  buildPersonalizedActivitySignals,
  buildRecommendationActionSection,
  buildRecommendationPrioritySection,
  buildUserIntelligence,
} from './statisticsViewModel.user';

export { exportWorkspaceStatisticsCsv } from './statisticsViewModel.export';
