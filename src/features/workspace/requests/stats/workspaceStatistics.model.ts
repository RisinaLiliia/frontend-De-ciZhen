'use client';
import type {
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsInsightDto,
  WorkspaceStatisticsOpportunityRadarItemDto,
  WorkspaceStatisticsRange,
  WorkspaceStatisticsViewerMode,
} from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';

export type WorkspaceStatisticsKpiView = {
  key: string;
  label: string;
  value: string;
  hint: string;
  tone: 'positive' | 'neutral';
};

export type WorkspaceStatisticsCityRowView = {
  key: string;
  cityId: string | null;
  name: string;
  count: number;
  auftragSuchenCount: number | null;
  anbieterSuchenCount: number | null;
  providersActive: number | null;
  marketBalanceRatio: number | null;
  score: number | null;
  rank: number | null;
  signal: 'high' | 'medium' | 'low' | 'none';
  peerContext: WorkspaceStatisticsOpportunityRadarItemDto['peerContext'] | null;
};

export type WorkspaceStatisticsFunnelItemView = {
  key: string;
  label: string;
  count: number;
  value: string;
  widthPercent: number;
  rateFromPreviousPercent: number | null;
  railLabel?: string;
  railValue?: string;
  isCurrency?: boolean;
  compare?: WorkspaceStatisticsFunnelItemCompareView | null;
};

export type WorkspaceStatisticsFunnelItemCompareView = {
  userCount: string;
  userRate: string | null;
  marketRate: string | null;
  gapRate: string | null;
  isLargestGap: boolean;
  isLargestDropoff: boolean;
};

export type WorkspaceStatisticsFunnelComparisonStageView = {
  key: string;
  label: string;
  marketCount: string;
  userCount: string;
  marketRate: string;
  userRate: string;
  gapRate: string;
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

export type WorkspaceStatisticsFunnelComparisonView = {
  comparisonLabel: string;
  summary: string | null;
  primaryBottleneck: string | null;
  nextAction: string | null;
  largestGapStage: string | null;
  largestDropOffStage: string | null;
  stages: WorkspaceStatisticsFunnelComparisonStageView[];
};

export type WorkspaceStatisticsInsightView = {
  key: string;
  level: WorkspaceStatisticsInsightDto['level'];
  kind: 'demand' | 'opportunity' | 'performance' | 'growth' | 'risk' | 'promotion' | 'other';
  code: string;
  priority?: WorkspaceStatisticsInsightDto['priority'];
  score?: number;
  metrics?: Array<{ key: string; value: string | number }>;
  context?: string | null;
  title?: string;
  text: string;
  evidence?: string;
};

export type WorkspaceStatisticsGrowthCardView = {
  key: string;
  title: string;
  body: string;
  benefit: string;
  tone: 'primary' | 'default';
  badge?: string;
  recommendedFor?: string;
  href: string;
};

export type WorkspaceStatisticsActivitySignalView = {
  key: string;
  label: string;
  value: string;
  marketValue?: string | null;
  userValue?: string | null;
  hint: string;
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsBenchmarkMetricView = {
  key: string;
  label: string;
  userValue: string;
  marketValue: string;
  delta: string;
  tone: 'positive' | 'neutral' | 'warning';
  statusLabel: string | null;
};

export type WorkspaceStatisticsDecisionSignalView = {
  key: string;
  type: 'risk' | 'opportunity' | 'performance' | 'growth';
  code: string;
  severity: 'high' | 'medium' | 'low';
  actionLabel: string | null;
};

export type WorkspaceStatisticsPerformancePositionView = {
  headline: string;
  summary: string;
  overall: string;
  category: string;
  city: string;
  bucket: 'top' | 'average' | 'below';
};

export type WorkspaceStatisticsProfileGapView = {
  title: string;
  summary: string;
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsPriorityItemView = {
  key: string;
  title: string;
  body: string;
  metric: string | null;
  tone: 'positive' | 'neutral' | 'warning';
  cityLabel?: string | null;
  categoryLabel?: string | null;
};

export type WorkspaceStatisticsPrioritySectionView = {
  title: string;
  subtitle: string;
  hasReliableItems: boolean;
  items: WorkspaceStatisticsPriorityItemView[];
};

export type WorkspaceStatisticsActionStepView = {
  key: string;
  code: string;
  title: string;
  detail: string;
  priorityLabel: string;
  priorityTone: 'success' | 'info' | 'warning';
  impactLabel: string;
  effectLabel: string;
};

export type WorkspaceStatisticsActionSectionView = {
  title: string;
  subtitle: string;
  hasReliableItems: boolean;
  steps: WorkspaceStatisticsActionStepView[];
};

export type WorkspaceStatisticsPricingGapView = {
  currentPrice: string;
  recommendedRange: string;
  marketAverage: string;
  statusLabel: string;
  summary: string;
  effect: string;
  gap: string;
  action: string | null;
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsPersonalizedPricingView = WorkspaceStatisticsPricingGapView & {
  title: string | null;
  subtitle: string | null;
  contextLabel: string | null;
};

export type WorkspaceStatisticsCategoryFitItemView = {
  key: string;
  label: string;
  marketDemandShare: string;
  userFitLabel: string;
  opportunityLabel: string;
  recommendation: string | null;
};

export type WorkspaceStatisticsCityComparisonItemView = {
  key: string;
  cityId: string | null;
  city: string;
  marketRequests: string;
  userActivityLabel: string;
  userConversion: string;
  recommendation: string | null;
};

export type WorkspaceStatisticsUserIntelligenceView = {
  comparisonLabel: string;
  formulaMetrics: WorkspaceStatisticsBenchmarkMetricView[];
  decisionMetrics: WorkspaceStatisticsBenchmarkMetricView[];
  signals: WorkspaceStatisticsDecisionSignalView[];
  funnelSignals: WorkspaceStatisticsActivitySignalView[];
  performancePosition: WorkspaceStatisticsPerformancePositionView | null;
  profileGap: WorkspaceStatisticsProfileGapView | null;
  risks: WorkspaceStatisticsPriorityItemView[];
  opportunities: WorkspaceStatisticsPriorityItemView[];
  pricing: WorkspaceStatisticsPricingGapView | null;
  nextSteps: WorkspaceStatisticsActionStepView[];
};

export type WorkspaceStatisticsActivityTrendView = {
  label: string;
  value: string;
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsOpportunityRadarItemView = {
  rank: 1 | 2 | 3;
  cityId: string | null;
  city: string;
  categoryKey: string | null;
  category: string;
  demand: number;
  providers: number | null;
  marketBalanceRatio: number | null;
  score: number;
  demandScore: number;
  competitionScore: number;
  growthScore: number;
  activityScore: number;
  status: WorkspaceStatisticsOpportunityRadarItemDto['status'];
  summaryKey: WorkspaceStatisticsOpportunityRadarItemDto['summaryKey'];
  metrics: WorkspaceStatisticsOpportunityRadarItemDto['metrics'];
  tone: 'very-high' | 'high' | 'balanced' | 'supply-heavy';
  peerContext?: WorkspaceStatisticsOpportunityRadarItemDto['peerContext'] | null;
  priceIntelligence?: WorkspaceStatisticsPriceIntelligenceView | null;
  href: string;
};

export type WorkspaceStatisticsPriceIntelligenceView = {
  cityLabel: string | null;
  categoryLabel: string | null;
  contextLabel: string | null;
  recommendedRangeLabel: string | null;
  marketAverageLabel: string | null;
  recommendedMin: number | null;
  recommendedMax: number | null;
  marketAverage: number | null;
  optimalMin: number | null;
  optimalMax: number | null;
  optimalMinLabel: string | null;
  optimalMaxLabel: string | null;
  recommendation: string | null;
  profitPotentialScore: number | null;
  profitPotentialStatus: 'high' | 'medium' | 'low' | null;
  profitPotentialLabel: string | null;
};

export type WorkspaceStatisticsFilterOption = {
  value: string;
  label: string;
};

export type WorkspaceStatisticsFilters = {
  period: WorkspaceStatisticsRange;
  cityId: string | null;
  regionId?: string | null;
  categoryKey: string | null;
  subcategoryKey?: string | null;
  viewerMode?: WorkspaceStatisticsViewerMode | null;
};

export type WorkspaceStatisticsContextMetricView = {
  key: string;
  label: string;
  value: string;
  tone: 'positive' | 'neutral' | 'warning';
};

export type WorkspaceStatisticsContextView = {
  mode: 'global' | 'focus';
  periodLabel: string;
  cityLabel: string;
  regionLabel?: string | null;
  categoryLabel: string;
  scopeLabel: string;
  stickyLabel: string;
  title: string;
  subtitle: string;
  healthMetrics: WorkspaceStatisticsContextMetricView[];
  isLowData: boolean;
  lowDataTitle: string | null;
  lowDataBody: string | null;
};

export type WorkspaceStatisticsModel = {
  copy: WorkspaceStatisticsCopy;
  filters: WorkspaceStatisticsFilters;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  setCityId: (next: string | null) => void;
  setCategoryKey: (next: string | null) => void;
  cityListPage: number;
  setCityListPage: (next: number) => void;
  viewerMode: WorkspaceStatisticsViewerMode | null;
  setViewerMode: (next: WorkspaceStatisticsViewerMode) => void;
  resetFilters: () => void;
  isLoading: boolean;
  isError: boolean;
  hasBackgroundError: boolean;
  isUpdating: boolean;
  mode: 'platform' | 'personalized';
  modeLabel: string;
  cityOptions: WorkspaceStatisticsFilterOption[];
  categoryOptions: WorkspaceStatisticsFilterOption[];
  context: WorkspaceStatisticsContextView;
  sectionMeta: {
    decisionSubtitle?: string | null;
    demandSubtitle?: string | null;
    citiesSubtitle?: string | null;
    opportunityTitle?: string | null;
    priceTitle?: string | null;
    insightsSubtitle?: string | null;
    growthSubtitle?: string | null;
  };
  kpis: WorkspaceStatisticsKpiView[];
  activityTitle: string;
  activitySubtitle: string;
  activitySummary: string | null;
  activityPoints: Array<{
    label: string;
    requests: number;
    offers: number;
    clientActivity?: number | null;
    providerActivity?: number | null;
  }>;
  activityMeta: {
    peak: string;
    bestWindow: string;
    updatedAt: string;
  };
  activityTrend: WorkspaceStatisticsActivityTrendView;
  decisionLayerSubtitle: string | null;
  decisionInsight: string;
  decisionActionLabel: string | null;
  activitySignals: WorkspaceStatisticsActivitySignalView[];
  demandRows: WorkspaceStatisticsCategoryDemandDto[];
  cityRows: WorkspaceStatisticsCityRowView[];
  cityListRows: WorkspaceStatisticsCityRowView[];
  cityListLimit: number;
  cityListTotalItems: number;
  cityListTotalPages: number;
  opportunityRadar: WorkspaceStatisticsOpportunityRadarItemView[];
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceView;
  personalizedPricing: WorkspaceStatisticsPersonalizedPricingView | null;
  categoryFit: WorkspaceStatisticsCategoryFitItemView[];
  cityComparison: WorkspaceStatisticsCityComparisonItemView[];
  rightRailRisks: WorkspaceStatisticsPrioritySectionView | null;
  rightRailOpportunities: WorkspaceStatisticsPrioritySectionView | null;
  rightRailNextSteps: WorkspaceStatisticsActionSectionView | null;
  funnel: WorkspaceStatisticsFunnelItemView[];
  funnelComparison: WorkspaceStatisticsFunnelComparisonView | null;
  funnelPeriodLabel: string;
  funnelSummary: string;
  hasFunnelData: boolean;
  funnelDropoff: {
    label: string;
    value: string;
    hint: string;
    tone: 'positive' | 'neutral' | 'warning';
  } | null;
  conversion: string;
  insights: WorkspaceStatisticsInsightView[];
  growthCards: WorkspaceStatisticsGrowthCardView[];
  userIntelligence: WorkspaceStatisticsUserIntelligenceView | null;
  onExport: () => void;
};
