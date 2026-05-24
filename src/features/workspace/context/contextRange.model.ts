import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { WorkspaceContextRangeControl } from './workspaceContext.types';

export function buildRangeSelectOptions(range: WorkspaceContextRangeControl) {
  return range.options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
}

export function resolveRangeValue(next: string): WorkspaceStatisticsRange {
  return next as WorkspaceStatisticsRange;
}
