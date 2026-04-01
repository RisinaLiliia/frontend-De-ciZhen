import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';

export type WorkspacePublicActivityRange = '24h' | '7d' | '30d' | '90d';
export type WorkspacePublicActivityInterval = 'hour' | 'day';

export type WorkspacePublicActivityPointDto = {
  timestamp: string;
  requests: number;
  offers: number;
};

export type WorkspacePublicActivityDto = {
  range: WorkspacePublicActivityRange;
  interval: WorkspacePublicActivityInterval;
  source: 'real';
  data: WorkspacePublicActivityPointDto[];
  updatedAt: string;
};

export type WorkspacePublicSummaryDto = {
  totalPublishedRequests: number;
  totalActiveProviders: number;
};

export type WorkspacePublicCityActivityItemDto = {
  citySlug: string;
  cityName: string;
  cityId: string | null;
  requestCount: number;
  lat: number | null;
  lng: number | null;
};

export type WorkspacePublicCityActivityDto = {
  totalActiveCities: number;
  totalActiveRequests: number;
  items: WorkspacePublicCityActivityItemDto[];
};

export type WorkspacePublicOverviewDto = {
  updatedAt: string;
  summary: WorkspacePublicSummaryDto;
  activity: WorkspacePublicActivityDto;
  cityActivity: WorkspacePublicCityActivityDto;
  requests: PublicRequestsResponseDto;
};

export type WorkspacePublicRequestsBatchResponseDto = {
  items: RequestResponseDto[];
  missingIds: string[];
};

export type WorkspacePrivateStatusCountsDto = {
  draft: number;
  published: number;
  paused: number;
  matched: number;
  closed: number;
  cancelled: number;
  total: number;
};

export type WorkspacePrivateOfferStatusCountsDto = {
  sent: number;
  accepted: number;
  declined: number;
  withdrawn: number;
  total: number;
};

export type WorkspacePrivateContractStatusCountsDto = {
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total: number;
};

export type WorkspacePrivateFavoritesDto = {
  requests: number;
  providers: number;
};

export type WorkspacePrivateReviewsDto = {
  asProvider: number;
  asClient: number;
};

export type WorkspacePrivateProfilesDto = {
  providerCompleteness: number;
  clientCompleteness: number;
};

export type WorkspacePrivateKpisDto = {
  myOpenRequests: number;
  providerActiveContracts: number;
  clientActiveContracts: number;
  acceptanceRate: number;
  activityProgress: number;
  avgResponseMinutes: number | null;
  recentOffers7d: number;
};

export type WorkspacePrivateInsightsDto = {
  providerCompletedThisMonth: number;
  providerCompletedLastMonth: number;
  providerCompletedDeltaKind: 'percent' | 'new' | 'none';
  providerCompletedDeltaPercent: number | null;
};

export type WorkspacePrivateMonthlyPointDto = {
  monthStart: string;
  bars: number;
  line: number;
};

export type WorkspacePrivateOverviewDto = {
  updatedAt: string;
  user: {
    userId: string;
    role: 'client' | 'provider' | 'admin';
  };
  requestsByStatus: WorkspacePrivateStatusCountsDto;
  providerOffersByStatus: WorkspacePrivateOfferStatusCountsDto;
  clientOffersByStatus: WorkspacePrivateOfferStatusCountsDto;
  providerContractsByStatus: WorkspacePrivateContractStatusCountsDto;
  clientContractsByStatus: WorkspacePrivateContractStatusCountsDto;
  favorites: WorkspacePrivateFavoritesDto;
  reviews: WorkspacePrivateReviewsDto;
  profiles: WorkspacePrivateProfilesDto;
  kpis: WorkspacePrivateKpisDto;
  insights: WorkspacePrivateInsightsDto;
  providerMonthlySeries: WorkspacePrivateMonthlyPointDto[];
  clientMonthlySeries: WorkspacePrivateMonthlyPointDto[];
};

export type WorkspaceStatisticsRange = WorkspacePublicActivityRange;
export type WorkspaceStatisticsViewerMode = 'provider' | 'customer';

export type WorkspaceStatisticsSummaryDto = {
  totalPublishedRequests: number;
  totalActiveProviders: number;
  totalActiveCities: number;
  platformRatingAvg: number;
  platformRatingCount: number;
};

export type WorkspaceStatisticsKpisDto = {
  requestsTotal: number;
  offersTotal: number;
  completedJobsTotal: number;
  successRate: number;
  avgResponseMinutes: number | null;
  profileCompleteness: number | null;
  openRequests: number | null;
  recentOffers7d: number | null;
};

export type WorkspaceStatisticsActivityPointDto = {
  timestamp: string;
  requests: number;
  offers: number;
};

export type WorkspaceStatisticsActivityTotalsDto = {
  requestsTotal: number;
  offersTotal: number;
  latestRequests: number;
  latestOffers: number;
  previousRequests: number;
  previousOffers: number;
  peakTimestamp: string | null;
  bestWindowTimestamp: string | null;
};

export type WorkspaceStatisticsActivityMetricsDto = {
  offerRatePercent: number;
  responseMedianMinutes: number | null;
  unansweredRequests24h: number;
  cancellationRatePercent: number;
  completedJobs: number;
  gmvAmount: number;
  platformRevenueAmount: number;
  takeRatePercent: number;
  offerRateTone: 'positive' | 'neutral' | 'warning';
  responseMedianTone: 'positive' | 'neutral' | 'warning';
  unansweredTone: 'positive' | 'neutral' | 'warning';
  cancellationTone: 'positive' | 'neutral' | 'warning';
  completedTone: 'positive' | 'neutral' | 'warning';
  revenueTone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsActivityDto = {
  range: WorkspaceStatisticsRange;
  interval: WorkspacePublicActivityInterval;
  points: WorkspaceStatisticsActivityPointDto[];
  totals: WorkspaceStatisticsActivityTotalsDto;
  metrics: WorkspaceStatisticsActivityMetricsDto;
};

export type WorkspaceStatisticsActivityComparisonPointDto = {
  timestamp: string;
  clientActivity: number | null;
  providerActivity: number | null;
};

export type WorkspaceStatisticsActivityComparisonDto = {
  title?: string | null;
  subtitle?: string | null;
  summary?: string | null;
  peakTimestamp?: string | null;
  bestWindowTimestamp?: string | null;
  updatedAt?: string | null;
  hasReliableSeries: boolean;
  points: WorkspaceStatisticsActivityComparisonPointDto[];
};

export type WorkspaceStatisticsCategoryDemandDto = {
  categoryKey: string | null;
  categoryName: string;
  requestCount: number;
  sharePercent: number;
};

export type WorkspaceStatisticsFilterOptionDto = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type WorkspaceStatisticsSelectedFilterDto = {
  value: string | null;
  label: string;
};

export type WorkspaceStatisticsContextHealthKey = 'demand' | 'competition' | 'activity';
export type WorkspaceStatisticsContextHealthValue =
  | 'rising'
  | 'stable'
  | 'limited'
  | 'high'
  | 'balanced'
  | 'low';

export type WorkspaceStatisticsContextHealthDto = {
  key: WorkspaceStatisticsContextHealthKey;
  value: WorkspaceStatisticsContextHealthValue;
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsDecisionContextDto = {
  mode: 'global' | 'focus';
  period: WorkspaceStatisticsRange;
  city: WorkspaceStatisticsSelectedFilterDto;
  region?: WorkspaceStatisticsSelectedFilterDto | null;
  category: WorkspaceStatisticsSelectedFilterDto;
  service?: WorkspaceStatisticsSelectedFilterDto | null;
  scopeLabel?: string | null;
  title?: string | null;
  subtitle?: string | null;
  stickyLabel?: string | null;
  health: WorkspaceStatisticsContextHealthDto[];
  lowData?: {
    isLowData: boolean;
    title?: string | null;
    body?: string | null;
  };
};

export type WorkspaceStatisticsFilterOptionsDto = {
  cities: WorkspaceStatisticsFilterOptionDto[];
  categories: WorkspaceStatisticsFilterOptionDto[];
  services?: WorkspaceStatisticsFilterOptionDto[];
};

export type WorkspaceStatisticsSectionMetaDto = {
  decisionSubtitle?: string | null;
  demandSubtitle?: string | null;
  citiesSubtitle?: string | null;
  opportunityTitle?: string | null;
  priceTitle?: string | null;
  insightsSubtitle?: string | null;
  growthSubtitle?: string | null;
};

export type WorkspaceStatisticsExportMetaDto = {
  filename?: string | null;
};

export type WorkspaceStatisticsCityDemandDto = {
  citySlug: string;
  cityName: string;
  cityId: string | null;
  requestCount: number;
  auftragSuchenCount: number | null;
  anbieterSuchenCount: number | null;
  marketBalanceRatio: number | null;
  providersActive?: number | null;
  score?: number | null;
  rank?: number | null;
  signal: 'high' | 'medium' | 'low' | 'none';
  lat: number | null;
  lng: number | null;
  peerContext?: WorkspaceStatisticsOpportunityPeerContextDto | null;
};

export type WorkspaceStatisticsCityListDto = {
  items: WorkspaceStatisticsCityDemandDto[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type WorkspaceStatisticsDemandDto = {
  categories: WorkspaceStatisticsCategoryDemandDto[];
  cities: WorkspaceStatisticsCityDemandDto[];
  cityList?: WorkspaceStatisticsCityListDto;
};

export type WorkspaceStatisticsOpportunityMetricDto = {
  key: 'demand' | 'competition' | 'growth' | 'activity';
  value: number;
  semanticTone: 'very-high' | 'high' | 'medium' | 'low';
  semanticKey: 'very_high' | 'high' | 'noticeable' | 'medium' | 'low';
};

export type WorkspaceStatisticsPriceIntelligenceDto = {
  citySlug: string | null;
  city: string | null;
  categoryKey: string | null;
  category: string | null;
  recommendedMin: number | null;
  recommendedMax: number | null;
  marketAverage: number | null;
  optimalMin: number | null;
  optimalMax: number | null;
  smartRecommendedPrice: number | null;
  smartSignalTone: 'visibility' | 'balanced' | 'premium' | null;
  analyzedRequestsCount: number | null;
  confidenceLevel: 'high' | 'medium' | 'low' | null;
  recommendation: string | null;
  profitPotentialScore: number | null;
  profitPotentialStatus: 'high' | 'medium' | 'low' | null;
};

export type WorkspaceStatisticsOpportunityPeerContextDto = {
  role: 'focus' | 'competitor';
  distanceKm: number | null;
  reason: 'selected_city' | 'nearby_competitor' | 'top_ranked';
};

export type WorkspaceStatisticsOpportunityRadarItemDto = {
  rank: 1 | 2 | 3;
  cityId: string | null;
  city: string;
  categoryKey: string | null;
  category: string | null;
  demand: number;
  providers: number | null;
  marketBalanceRatio: number | null;
  score: number;
  demandScore: number;
  competitionScore: number;
  growthScore: number;
  activityScore: number;
  status: 'very_high' | 'good' | 'balanced' | 'competitive' | 'low';
  tone: 'very-high' | 'high' | 'balanced' | 'supply-heavy';
  summaryKey: 'very_high' | 'good' | 'balanced_competitive' | 'balanced' | 'competitive' | 'low_demand' | 'low';
  metrics: WorkspaceStatisticsOpportunityMetricDto[];
  peerContext?: WorkspaceStatisticsOpportunityPeerContextDto | null;
  priceIntelligence?: WorkspaceStatisticsPriceIntelligenceDto | null;
};

export type WorkspaceStatisticsProfileFunnelDto = {
  periodLabel: string;
  stage1: number;
  stage2: number;
  stage3: number;
  stage4: number;
  requestsTotal: number;
  offersTotal: number;
  confirmedResponsesTotal: number;
  closedContractsTotal: number;
  completedJobsTotal: number;
  profitAmount: number;
  offerResponseRatePercent: number;
  confirmationRatePercent: number;
  contractClosureRatePercent: number;
  completionRatePercent: number;
  conversionRate: number;
  totalConversionPercent: number;
  summaryText: string;
  stages: Array<{
    id: 'requests' | 'offers' | 'confirmations' | 'contracts' | 'completed' | 'revenue';
    label: string;
    value: number;
    displayValue: string;
    widthPercent: number;
    rateLabel: string | null;
    ratePercent: number | null;
    helperText: string | null;
  }>;
};

export type WorkspaceStatisticsInsightDto = {
  id?: string;
  type?: 'demand' | 'opportunity' | 'performance' | 'growth' | 'risk' | 'promotion';
  priority?: 'high' | 'medium' | 'low';
  audience?: 'all' | 'provider' | 'client' | 'guest';
  score?: number;
  title?: string;
  body?: string;
  shortLabel?: string;
  icon?: string;
  confidence?: number;
  metrics?: Array<{
    key: string;
    value: string | number;
  }>;
  action?: {
    label: string;
    actionType: 'internal_link' | 'modal' | 'promotion' | 'none';
    href?: string;
    payload?: Record<string, unknown>;
  };
  validUntil?: string;
  level: 'info' | 'trend' | 'warning';
  code: string;
  context: string | null;
};

export type WorkspaceStatisticsGrowthCardDto = {
  key: string;
  href: string;
  title?: string;
  body?: string;
  benefit?: string;
  tone?: 'primary' | 'default';
  badge?: string;
  recommendedFor?: string;
};

export type WorkspaceStatisticsUserComparisonMetricDto = {
  key: 'offer_rate' | 'response_time' | 'unanswered';
  unit: 'percent' | 'minutes' | 'count';
  userValue: number | null;
  marketValue: number | null;
  direction: 'up' | 'down' | 'flat';
  tone: 'positive' | 'neutral' | 'warning';
  status: 'high' | 'medium' | 'low' | null;
};

export type WorkspaceStatisticsUserFormulaMetricDto = {
  key:
    | 'offer_rate'
    | 'response_rate'
    | 'conversion_rate'
    | 'completion_rate'
    | 'cancellation_rate'
    | 'avg_response_time'
    | 'revenue'
    | 'avg_order_value';
  formula:
    | 'offers / requests'
    | 'responses / offers'
    | 'contracts / requests'
    | 'completed / contracts'
    | 'cancellations / contracts'
    | 'sum(response_time) / responses'
    | 'sum(order_price * platform_fee)'
    | 'total_revenue / completed_orders';
  unit: 'percent' | 'minutes' | 'currency';
  userValue: number | null;
  marketValue: number | null;
  gap: number | null;
  direction: 'up' | 'down' | 'flat';
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsUserSignalDto = {
  id: string;
  type: 'risk' | 'opportunity' | 'performance' | 'growth';
  code:
    | 'high_unanswered'
    | 'slow_response'
    | 'overpriced'
    | 'underpriced'
    | 'high_demand_city'
    | 'growing_category'
    | 'low_visibility'
    | 'strong_position'
    | 'low_competition_segment'
    | 'price_above_market'
    | 'price_below_market';
  severity: 'high' | 'medium' | 'low';
  metricKey?: WorkspaceStatisticsUserFormulaMetricDto['key'] | WorkspaceStatisticsUserComparisonMetricDto['key'] | null;
  actionCode?: WorkspaceStatisticsUserActionStepDto['code'] | null;
};

export type WorkspaceStatisticsUserPerformancePositionDto = {
  percentile: number | null;
  categoryPercentile: number | null;
  cityPercentile: number | null;
  bucket: 'top' | 'average' | 'below';
  categoryLabel?: string | null;
  cityLabel?: string | null;
};

export type WorkspaceStatisticsUserProfileGapDto = {
  fromStage: 'offers';
  toStage: 'confirmations';
  lossPercent: number | null;
  lostCount: number | null;
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsUserPriorityItemDto = {
  id: string;
  code:
    | 'slow_response'
    | 'high_unanswered'
    | 'low_visibility'
    | 'high_demand_city'
    | 'growing_category'
    | 'low_competition_segment'
    | 'price_above_market'
    | 'price_below_market'
    | 'strong_position';
  severity: 'high' | 'medium' | 'low';
  cityLabel?: string | null;
  categoryLabel?: string | null;
  value?: number | null;
  secondaryValue?: number | null;
};

export type WorkspaceStatisticsUserPricingDto = {
  currentPrice: number | null;
  recommendedMin: number | null;
  recommendedMax: number | null;
  marketAverage: number | null;
  status: 'below' | 'within' | 'above' | 'unknown';
  conversionImpact: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsUserActionStepDto = {
  id: string;
  code:
    | 'respond_faster'
    | 'adjust_price'
    | 'focus_market'
    | 'complete_profile'
    | 'follow_up_unanswered'
    | 'follow_up_requests';
  priority: 'high' | 'medium' | 'low';
  targetValue?: number | null;
  cityLabel?: string | null;
  categoryLabel?: string | null;
};

export type WorkspaceStatisticsUserIntelligenceDto = {
  comparisonLabel?: string | null;
  formulaMetrics: WorkspaceStatisticsUserFormulaMetricDto[];
  decisionMetrics: WorkspaceStatisticsUserComparisonMetricDto[];
  signals: WorkspaceStatisticsUserSignalDto[];
  performancePosition: WorkspaceStatisticsUserPerformancePositionDto;
  profileGap: WorkspaceStatisticsUserProfileGapDto | null;
  risks: WorkspaceStatisticsUserPriorityItemDto[];
  opportunities: WorkspaceStatisticsUserPriorityItemDto[];
  pricing: WorkspaceStatisticsUserPricingDto | null;
  nextSteps: WorkspaceStatisticsUserActionStepDto[];
};

export type WorkspaceStatisticsDecisionLayerMetricDto = {
  id:
    | 'offer_rate'
    | 'avg_response_time'
    | 'unanswered_over_24h'
    | 'completed_jobs'
    | 'revenue'
    | 'average_order_value';
  label: string;
  marketValue: number | null;
  userValue: number | null;
  gapAbsolute: number | null;
  gapPercent: number | null;
  unit: 'percent' | 'minutes' | 'currency' | 'count';
  direction: 'better' | 'worse' | 'neutral';
  status: 'good' | 'warning' | 'critical' | 'neutral';
  signalCodes: string[];
  primaryActionCode: WorkspaceStatisticsUserActionStepDto['code'] | null;
  summary: string | null;
};

export type WorkspaceStatisticsDecisionLayerDto = {
  title: string | null;
  subtitle: string | null;
  metrics: WorkspaceStatisticsDecisionLayerMetricDto[];
  primaryInsight: string | null;
  primaryAction: {
    code: WorkspaceStatisticsUserActionStepDto['code'];
    label: string;
    target: string | null;
  } | null;
};

export type WorkspaceStatisticsPersonalizedPricingDto = {
  title: string | null;
  subtitle: string | null;
  contextLabel: string | null;
  marketAverage: number | null;
  recommendedMin: number | null;
  recommendedMax: number | null;
  userPrice: number | null;
  gapAbsolute: number | null;
  comparisonReliability: 'high' | 'medium' | 'low' | 'unavailable';
  position: 'below' | 'within' | 'above' | 'unknown';
  effect: 'positive' | 'neutral' | 'warning';
  actionCode: WorkspaceStatisticsUserActionStepDto['code'] | null;
  summary: string | null;
};

export type WorkspaceStatisticsCategoryFitItemDto = {
  categoryKey: string | null;
  label: string;
  marketDemandShare: number | null;
  reliability: 'high' | 'medium' | 'low' | 'unknown';
  userFit: 'high' | 'medium' | 'low' | 'unknown';
  opportunity: 'high' | 'medium' | 'low' | 'unknown';
  actionCode: WorkspaceStatisticsUserActionStepDto['code'] | null;
  summary: string | null;
};

export type WorkspaceStatisticsCategoryFitDto = {
  title: string | null;
  subtitle: string | null;
  hasReliableItems: boolean;
  items: WorkspaceStatisticsCategoryFitItemDto[];
};

export type WorkspaceStatisticsCityComparisonItemDto = {
  cityId: string | null;
  city: string;
  marketRequests: number | null;
  reliability: 'high' | 'medium' | 'low' | 'unknown';
  userActivity: 'high' | 'medium' | 'low' | 'unknown';
  userConversion: number | null;
  actionCode: WorkspaceStatisticsUserActionStepDto['code'] | null;
  recommendation: string | null;
};

export type WorkspaceStatisticsCityComparisonDto = {
  title: string | null;
  subtitle: string | null;
  hasReliableItems: boolean;
  items: WorkspaceStatisticsCityComparisonItemDto[];
};

export type WorkspaceStatisticsRecommendationItemDto = {
  code: string;
  type: 'risk' | 'opportunity' | 'performance' | 'growth' | 'promotion' | 'demand';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  reliability: 'high' | 'medium' | 'low';
  context: string | null;
  actionCode: string | null;
  action: {
    code: string;
    label: string;
    target: string | null;
  } | null;
};

export type WorkspaceStatisticsRecommendationSectionDto = {
  title: string | null;
  subtitle: string | null;
  hasReliableItems: boolean;
  items: WorkspaceStatisticsRecommendationItemDto[];
};

export type WorkspaceStatisticsFunnelComparisonStageDto = {
  key: 'requests' | 'offers' | 'responses' | 'contracts' | 'completed';
  label: string;
  marketCount: number | null;
  userCount: number | null;
  marketRateFromPrev: number | null;
  userRateFromPrev: number | null;
  gapRate: number | null;
  status:
    | 'good'
    | 'warning'
    | 'critical'
    | 'neutral'
    | 'at_market'
    | 'above_market'
    | 'below_market'
    | 'insufficient_data';
  dropOffSeverity?: 'low' | 'medium' | 'high' | 'critical' | null;
  recommendation: string | null;
};

export type WorkspaceStatisticsFunnelComparisonDto = {
  comparisonLabel?: string | null;
  summary?: string | null;
  largestGapStage: WorkspaceStatisticsFunnelComparisonStageDto['key'] | null;
  largestDropOffStage: WorkspaceStatisticsFunnelComparisonStageDto['key'] | null;
  primaryBottleneck: string | null;
  nextAction: string | null;
  stages: WorkspaceStatisticsFunnelComparisonStageDto[];
};

export type WorkspaceStatisticsOverviewDto = {
  updatedAt: string;
  mode: 'platform' | 'personalized';
  range: WorkspaceStatisticsRange;
  viewerMode?: WorkspaceStatisticsViewerMode | null;
  decisionContext?: WorkspaceStatisticsDecisionContextDto;
  filterOptions?: WorkspaceStatisticsFilterOptionsDto;
  sectionMeta?: WorkspaceStatisticsSectionMetaDto;
  exportMeta?: WorkspaceStatisticsExportMetaDto;
  decisionInsight?: string | null;
  decisionLayer?: WorkspaceStatisticsDecisionLayerDto | null;
  personalizedPricing?: WorkspaceStatisticsPersonalizedPricingDto | null;
  categoryFit?: WorkspaceStatisticsCategoryFitDto | null;
  cityComparison?: WorkspaceStatisticsCityComparisonDto | null;
  risks?: WorkspaceStatisticsRecommendationSectionDto | null;
  opportunities?: WorkspaceStatisticsRecommendationSectionDto | null;
  nextSteps?: WorkspaceStatisticsRecommendationSectionDto | null;
  summary: WorkspaceStatisticsSummaryDto;
  kpis: WorkspaceStatisticsKpisDto;
  activity: WorkspaceStatisticsActivityDto;
  activityComparison?: WorkspaceStatisticsActivityComparisonDto | null;
  demand: WorkspaceStatisticsDemandDto;
  opportunityRadar: WorkspaceStatisticsOpportunityRadarItemDto[];
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceDto;
  profileFunnel: WorkspaceStatisticsProfileFunnelDto;
  insights: WorkspaceStatisticsInsightDto[];
  growthCards: WorkspaceStatisticsGrowthCardDto[];
  funnelComparison?: WorkspaceStatisticsFunnelComparisonDto | null;
  userIntelligence?: WorkspaceStatisticsUserIntelligenceDto | null;
};
