import { formatPercent } from './statisticsModel.mappers';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type { WorkspaceStatisticsFunnelItemView } from './workspaceStatistics.model';

export function buildFunnel(
  data: WorkspaceStatisticsDecisionDashboardDto | undefined,
): WorkspaceStatisticsFunnelItemView[] {
  if (!data) return [];

  const stages = data.profileFunnel.stages;
  if (!Array.isArray(stages) || stages.length === 0) return [];

  return stages.map((stage) => {
    const normalizedId = stage.id === 'confirmations'
      ? 'confirmed'
      : stage.id === 'contracts'
        ? 'closed'
        : stage.id === 'revenue'
          ? 'profit'
          : stage.id;
    const ratePercent =
      typeof stage.ratePercent === 'number'
        ? Math.max(0, Math.min(100, Math.round(stage.ratePercent)))
        : null;

    return {
      key: normalizedId,
      label: stage.label,
      count: Math.max(0, Math.round(stage.value)),
      value: stage.displayValue,
      widthPercent: Math.max(0, Math.min(100, Number(stage.widthPercent ?? 0))),
      rateFromPreviousPercent: ratePercent,
      railLabel: stage.id === 'requests' ? undefined : (stage.rateLabel ?? undefined),
      railValue:
        stage.id === 'requests'
          ? undefined
          : (stage.helperText ?? (ratePercent !== null ? formatPercent(ratePercent) : undefined)),
      isCurrency: stage.id === 'revenue',
    };
  });
}
