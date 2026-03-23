import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';

export function citySignalLabel(
  signal: WorkspaceStatisticsModel['cityRows'][number]['signal'],
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (signal === 'high') return copy.citySignalHigh;
  if (signal === 'medium') return copy.citySignalMedium;
  if (signal === 'none') return copy.citySignalNone;
  return copy.citySignalLow;
}

export function citySignalIcon(
  signal: WorkspaceStatisticsModel['cityRows'][number]['signal'],
): string {
  if (signal === 'high') return '↗';
  if (signal === 'medium') return '→';
  if (signal === 'none') return '•';
  return '↘';
}
