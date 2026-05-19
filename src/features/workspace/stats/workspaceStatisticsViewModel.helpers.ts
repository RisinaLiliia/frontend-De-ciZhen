export {
  buildActivitySignals,
  buildActivityTrend,
  buildKpis,
  DEFAULT_ACTIVITY_METRICS,
} from './workspaceStatisticsViewModel.activity';

export {
  buildCityRows,
  buildOpportunityRadar,
} from './workspaceStatisticsViewModel.market';

export {
  buildPriceIntelligence,
} from './workspaceStatisticsViewModel.pricing';

export {
  buildFunnel,
  buildFunnelComparison,
  buildFunnelConversion,
  buildFunnelDropoff,
  buildFunnelSummary,
} from './workspaceStatisticsViewModel.funnel';

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
} from './workspaceStatisticsViewModel.context';

export {
  buildCategoryFit,
  buildCityComparison,
  buildDecisionLayerSignals,
  buildPersonalizedPricingSection,
  buildPersonalizedActivitySignals,
  buildRecommendationActionSection,
  buildRecommendationPrioritySection,
  buildUserIntelligence,
} from './workspaceStatisticsViewModel.user';

export { exportWorkspaceStatisticsCsv } from './workspaceStatisticsViewModel.export';
