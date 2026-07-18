'use client';

import type {
  WorkspaceStatisticsDecisionContextDto,
  WorkspaceStatisticsExportMetaDto,
  WorkspaceStatisticsFilterOptionsDto,
  WorkspaceStatisticsOverviewDto,
  WorkspaceStatisticsSectionMetaDto,
} from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';

export type DecisionDashboardFilters = {
  period: WorkspaceStatisticsOverviewDto['range'];
  cityId: string | null;
  regionId?: string | null;
  categoryKey: string | null;
  subcategoryKey?: string | null;
};

export type WorkspaceStatisticsDecisionDashboardDto = WorkspaceStatisticsOverviewSourceDto & {
  decisionContext?: WorkspaceStatisticsDecisionContextDto;
  filterOptions?: WorkspaceStatisticsFilterOptionsDto & {
    services?: WorkspaceStatisticsFilterOptionsDto['services'];
  };
  sectionMeta?: WorkspaceStatisticsSectionMetaDto;
  exportMeta?: WorkspaceStatisticsExportMetaDto;
};

// Transitional no-op kept only for test fixtures while the runtime path now trusts
// the backend section contract and validates it directly.
export function normalizeWorkspaceDecisionDashboardResponse(
  payload: WorkspaceStatisticsDecisionDashboardDto,
  _filters: DecisionDashboardFilters,
): WorkspaceStatisticsDecisionDashboardDto {
  return payload;
}
