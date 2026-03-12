'use client';

import type { Locale } from '@/lib/i18n/t';
import { useWorkspaceStatsQuery } from './useWorkspaceStatsQuery';
import {
  useWorkspaceStatsViewModel,
  type WorkspaceStatisticsActivitySignalView,
  type WorkspaceStatisticsCityRowView,
  type WorkspaceStatisticsFunnelItemView,
  type WorkspaceStatisticsGrowthCardView,
  type WorkspaceStatisticsInsightView,
  type WorkspaceStatisticsKpiView,
  type WorkspaceStatisticsModel,
  type WorkspaceStatisticsOpportunityRadarItemView,
  type WorkspaceStatisticsPriceIntelligenceView,
} from './useWorkspaceStatsViewModel';

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

export function useWorkspaceStatisticsModel({
  locale,
}: {
  locale: Locale;
}): WorkspaceStatisticsModel {
  const query = useWorkspaceStatsQuery();
  return useWorkspaceStatsViewModel({ locale, ...query });
}
