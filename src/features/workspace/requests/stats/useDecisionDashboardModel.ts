'use client';

import type { Locale } from '@/lib/i18n/t';
import { useWorkspaceStatsQuery } from './useWorkspaceStatsQuery';
import { useWorkspaceStatsViewModel } from './useWorkspaceStatsViewModel';
import type {
  WorkspaceStatisticsActivitySignalView,
  WorkspaceStatisticsCityRowView,
  WorkspaceStatisticsFunnelItemView,
  WorkspaceStatisticsGrowthCardView,
  WorkspaceStatisticsInsightView,
  WorkspaceStatisticsKpiView,
  WorkspaceStatisticsModel,
  WorkspaceStatisticsOpportunityRadarItemView,
  WorkspaceStatisticsPriceIntelligenceView,
} from './workspaceStatistics.model';

export type {
  WorkspaceStatisticsActivitySignalView,
  WorkspaceStatisticsCityRowView,
  WorkspaceStatisticsFunnelItemView,
  WorkspaceStatisticsGrowthCardView,
  WorkspaceStatisticsInsightView,
  WorkspaceStatisticsKpiView,
  WorkspaceStatisticsModel,
  WorkspaceStatisticsOpportunityRadarItemView,
  WorkspaceStatisticsPriceIntelligenceView,
};

export function useDecisionDashboardModel({
  locale,
}: {
  locale: Locale;
}): WorkspaceStatisticsModel {
  const query = useWorkspaceStatsQuery();
  return useWorkspaceStatsViewModel({ locale, ...query });
}
