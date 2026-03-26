import { formatPercent } from './statisticsModel.mappers';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type { WorkspaceStatisticsFunnelItemView } from './workspaceStatistics.model';
import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';

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

export function buildFunnelDropoff(params: {
  copy: WorkspaceStatisticsCopy;
  funnel: WorkspaceStatisticsFunnelItemView[];
}) {
  const candidate = params.funnel
    .filter((item) => !item.isCurrency && typeof item.rateFromPreviousPercent === 'number')
    .map((item) => ({
      ...item,
      dropoffPercent: Math.max(0, 100 - (item.rateFromPreviousPercent ?? 0)),
    }))
    .sort((a, b) => b.dropoffPercent - a.dropoffPercent)[0];

  if (!candidate || candidate.dropoffPercent <= 0) {
    return null;
  }

  return {
    label: params.copy.funnelDropoffLabel,
    value: `${candidate.dropoffPercent}%`,
    hint: `${candidate.label} · ${candidate.railValue ?? formatPercent(candidate.rateFromPreviousPercent ?? 0)}`,
    tone: candidate.dropoffPercent >= 45 ? 'warning' : candidate.dropoffPercent >= 25 ? 'neutral' : 'positive',
  } as const;
}
