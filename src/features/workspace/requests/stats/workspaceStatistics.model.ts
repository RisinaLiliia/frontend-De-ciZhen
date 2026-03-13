'use client';

import type { KpiCardTrend } from '@/components/ui/KpiCard';
import type {
  WorkspaceStatisticsCategoryDemandDto,
  WorkspaceStatisticsInsightDto,
  WorkspaceStatisticsOpportunityRadarItemDto,
  WorkspaceStatisticsRange,
} from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';

export type WorkspaceStatisticsKpiView = {
  key: string;
  label: string;
  value: string;
  hint: string;
  tone: 'positive' | 'neutral';
  trend: KpiCardTrend;
};

export type WorkspaceStatisticsCityRowView = {
  key: string;
  cityId: string | null;
  name: string;
  count: number;
  auftragSuchenCount: number | null;
  anbieterSuchenCount: number | null;
  marketBalanceRatio: number | null;
  signal: 'high' | 'medium' | 'low' | 'none';
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
  hint: string;
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

export type WorkspaceStatisticsModel = {
  copy: WorkspaceStatisticsCopy;
  range: WorkspaceStatisticsRange;
  setRange: (next: WorkspaceStatisticsRange) => void;
  isLoading: boolean;
  isError: boolean;
  mode: 'platform' | 'personalized';
  modeLabel: string;
  kpis: WorkspaceStatisticsKpiView[];
  activityPoints: Array<{ label: string; requests: number; offers: number }>;
  activityMeta: {
    peak: string;
    bestWindow: string;
    updatedAt: string;
  };
  decisionInsight: string;
  activitySignals: WorkspaceStatisticsActivitySignalView[];
  demandRows: WorkspaceStatisticsCategoryDemandDto[];
  cityRows: WorkspaceStatisticsCityRowView[];
  opportunityRadar: WorkspaceStatisticsOpportunityRadarItemView[];
  priceIntelligence: WorkspaceStatisticsPriceIntelligenceView;
  funnel: WorkspaceStatisticsFunnelItemView[];
  funnelPeriodLabel: string;
  funnelSummary: string;
  hasFunnelData: boolean;
  conversion: string;
  insights: WorkspaceStatisticsInsightView[];
  growthCards: WorkspaceStatisticsGrowthCardView[];
  onExport: () => void;
};
