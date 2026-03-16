import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';

export const ALL_CITIES_VALUE = '__all_cities__';
export const ALL_CATEGORIES_VALUE = '__all_categories__';
export const ALL_SERVICES_VALUE = '__all_services__';
export const RANGE_OPTIONS: WorkspaceStatisticsRange[] = ['24h', '7d', '30d', '90d'];

export function rangeLabel(
  range: WorkspaceStatisticsRange,
  copy: WorkspaceStatisticsModel['copy'],
) {
  if (range === '24h') return copy.range24h;
  if (range === '7d') return copy.range7d;
  if (range === '30d') return copy.range30d;
  return copy.range90d;
}
