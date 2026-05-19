'use client';

import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
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
  privateOverview = null,
}: {
  locale: Locale;
  privateOverview?: WorkspacePrivateOverviewDto | null;
}): WorkspaceStatisticsModel {
  const query = useWorkspaceStatsQuery({ privateOverview });
  return useWorkspaceStatsViewModel({ locale, privateOverview, ...query });
}
