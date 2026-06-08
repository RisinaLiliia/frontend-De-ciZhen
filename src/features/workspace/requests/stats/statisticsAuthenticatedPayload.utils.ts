import type {
  WorkspacePrivateOverviewDto,
  WorkspaceStatisticsOverviewDto,
} from '@/lib/api/dto/workspace';

export function hydrateAuthenticatedStatisticsPayload(params: {
  payload: WorkspaceStatisticsOverviewDto;
  privateOverview: WorkspacePrivateOverviewDto | null;
}): WorkspaceStatisticsOverviewDto {
  return params.payload;
}
