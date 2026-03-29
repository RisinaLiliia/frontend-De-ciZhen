import { formatPercent } from './statisticsModel.mappers';
import type { WorkspaceStatisticsDecisionDashboardDto } from './statisticsDecisionDashboard.contract';
import type {
  WorkspaceStatisticsFunnelComparisonView,
  WorkspaceStatisticsFunnelItemView,
} from './workspaceStatistics.model';
import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';

function resolveActionLabel(copy: WorkspaceStatisticsCopy, actionCode: string | null): string | null {
  if (actionCode === 'respond_faster') return copy.userActionRespondTitle;
  if (actionCode === 'adjust_price') return copy.userActionPriceTitle;
  if (actionCode === 'focus_market') return copy.userActionFocusTitle;
  if (actionCode === 'complete_profile') return copy.userActionProfileTitle;
  if (actionCode === 'follow_up_unanswered') return copy.userActionFollowUpTitle;
  return null;
}

export function buildFunnel(
  data: WorkspaceStatisticsDecisionDashboardDto | undefined,
): WorkspaceStatisticsFunnelItemView[] {
  if (!data) return [];

  if (data.mode === 'personalized' && Array.isArray(data.funnelComparison?.stages) && data.funnelComparison.stages.length > 0) {
    const stageLabelByKey = new Map(
      (data.profileFunnel.stages ?? []).map((stage) => {
        const normalizedKey = stage.id === 'confirmations'
          ? 'responses'
          : stage.id;
        return [normalizedKey, stage];
      }),
    );
    const rootCount = data.funnelComparison.stages.find((stage) => stage.key === 'requests')?.marketCount
      ?? data.funnelComparison.stages[0]?.marketCount
      ?? 0;
    const safeRootCount = typeof rootCount === 'number' && rootCount > 0 ? rootCount : 0;
    const largestGapStageKey = data.funnelComparison.largestGapStage;
    const largestDropOffStageKey = data.funnelComparison.largestDropOffStage;

    return data.funnelComparison.stages.map((stage) => {
      const legacyStage = stageLabelByKey.get(stage.key);
      const count = Math.max(0, Math.round(stage.marketCount ?? 0));
      const ratePercent =
        typeof stage.marketRateFromPrev === 'number'
          ? Math.max(0, Math.min(100, Math.round(stage.marketRateFromPrev)))
          : null;
      const widthPercent = safeRootCount > 0 ? (count / safeRootCount) * 100 : 0;

      return {
        key: stage.key === 'responses'
          ? 'confirmed'
          : stage.key === 'contracts'
            ? 'closed'
            : stage.key,
        label: legacyStage?.label ?? stage.label,
        count,
        value: String(count),
        widthPercent: Math.max(0, Math.min(100, Math.round(widthPercent))),
        rateFromPreviousPercent: ratePercent,
        railLabel: stage.key === 'requests' ? undefined : (legacyStage?.rateLabel ?? undefined),
        railValue: stage.key === 'requests'
          ? undefined
          : (ratePercent !== null ? formatPercent(ratePercent) : undefined),
        isCurrency: false,
        compare: {
          userCount: stage.userCount === null ? '—' : String(Math.max(0, Math.round(stage.userCount))),
          userRate: stage.key === 'requests'
            ? null
            : (typeof stage.userRateFromPrev === 'number' ? formatPercent(stage.userRateFromPrev) : '—'),
          marketRate: stage.key === 'requests'
            ? null
            : (typeof stage.marketRateFromPrev === 'number' ? formatPercent(stage.marketRateFromPrev) : '—'),
          gapRate: stage.key === 'requests'
            ? null
            : (typeof stage.gapRate === 'number'
              ? `${stage.gapRate > 0 ? '+' : ''}${Math.round(stage.gapRate)} pp`
              : '—'),
          isLargestGap: stage.key === largestGapStageKey,
          isLargestDropoff: stage.key === largestDropOffStageKey,
        },
      };
    });
  }

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
      compare: null,
    };
  });
}

export function buildFunnelDropoff(params: {
  copy: WorkspaceStatisticsCopy;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  funnel: WorkspaceStatisticsFunnelItemView[];
}) {
  const comparisonSource = params.data?.funnelComparison;
  if (comparisonSource) {
    const comparisonStage = (
      comparisonSource.stages.find((item) => item.key === comparisonSource.largestDropOffStage) ??
      comparisonSource.stages
        .filter((item) => item.key !== 'requests' && typeof item.userRateFromPrev === 'number')
        .sort((left, right) => (left.userRateFromPrev ?? 100) - (right.userRateFromPrev ?? 100))[0]
    );

    if (comparisonStage && typeof comparisonStage.userRateFromPrev === 'number') {
      const dropoffPercent = Math.max(0, 100 - comparisonStage.userRateFromPrev);
      return {
        label: params.copy.funnelDropoffLabel,
        value: `${Math.round(dropoffPercent)}%`,
        hint: `${comparisonStage.label} · ${formatPercent(comparisonStage.userRateFromPrev)}`,
        tone:
          comparisonStage.dropOffSeverity === 'high'
            ? 'warning'
            : comparisonStage.dropOffSeverity === 'medium'
              ? 'neutral'
              : 'positive',
      } as const;
    }
  }

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

export function buildFunnelComparison(params: {
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  copy: WorkspaceStatisticsCopy;
  formatNumber: Intl.NumberFormat;
}): WorkspaceStatisticsFunnelComparisonView | null {
  const { data, copy, formatNumber } = params;
  const source = data?.funnelComparison;
  if (!source) return null;

  return {
    comparisonLabel: source.comparisonLabel?.trim() || copy.userComparisonLabel,
    summary: source.summary?.trim() || null,
    primaryBottleneck: source.primaryBottleneck,
    nextAction: resolveActionLabel(copy, source.nextAction),
    largestGapStage: source.largestGapStage,
    largestDropOffStage: source.largestDropOffStage,
    stages: source.stages.map((stage) => ({
      key: stage.key,
      label: stage.label,
      marketCount: stage.marketCount === null ? '—' : formatNumber.format(stage.marketCount),
      userCount: stage.userCount === null ? '—' : formatNumber.format(stage.userCount),
      marketRate: typeof stage.marketRateFromPrev === 'number' ? formatPercent(stage.marketRateFromPrev) : '—',
      userRate: typeof stage.userRateFromPrev === 'number' ? formatPercent(stage.userRateFromPrev) : '—',
      gapRate: typeof stage.gapRate === 'number'
        ? `${stage.gapRate > 0 ? '+' : ''}${Math.round(stage.gapRate)} pp`
        : '—',
      status: stage.status,
      dropOffSeverity: stage.dropOffSeverity,
      recommendation: resolveActionLabel(copy, stage.recommendation),
    })),
  };
}

export function buildFunnelSummary(params: {
  copy: WorkspaceStatisticsCopy;
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  funnel: WorkspaceStatisticsFunnelItemView[];
  funnelComparison: WorkspaceStatisticsFunnelComparisonView | null;
  formatNumber: Intl.NumberFormat;
}) {
  const { copy, data, funnel, funnelComparison, formatNumber } = params;

  if (data?.mode === 'personalized' && funnelComparison) {
    const requestsStage = data.funnelComparison?.stages.find((item) => item.key === 'requests');
    const completedStage = data.funnelComparison?.stages.find((item) => item.key === 'completed');
    if (typeof requestsStage?.userCount === 'number' && typeof completedStage?.userCount === 'number') {
      const safeCompletedCount = Math.min(completedStage.userCount, requestsStage.userCount);
      return `${copy.funnelSummaryPrefix} ${formatNumber.format(requestsStage.userCount)} ${copy.funnelSummaryMiddle} ${formatNumber.format(safeCompletedCount)} ${copy.funnelSummarySuffix}`;
    }
  }

  return (
    String(data?.profileFunnel.summaryText ?? '').trim() ||
    `${copy.funnelSummaryPrefix} ${funnel.find((item) => item.key === 'requests')?.value ?? '0'} ${copy.funnelSummaryMiddle} ${funnel.find((item) => item.key === 'completed')?.value ?? '0'} ${copy.funnelSummarySuffix}`
  );
}

export function buildFunnelConversion(params: {
  data: WorkspaceStatisticsDecisionDashboardDto | undefined;
  funnelComparison: WorkspaceStatisticsFunnelComparisonView | null;
}) {
  const { data, funnelComparison } = params;

  if (data?.mode === 'personalized' && funnelComparison) {
    const requestsStage = data.funnelComparison?.stages.find((item) => item.key === 'requests');
    const completedStage = data.funnelComparison?.stages.find((item) => item.key === 'completed');
    if (
      typeof requestsStage?.userCount === 'number' &&
      typeof completedStage?.userCount === 'number' &&
      requestsStage.userCount > 0
    ) {
      const safeCompletedCount = Math.min(completedStage.userCount, requestsStage.userCount);
      return formatPercent((safeCompletedCount / requestsStage.userCount) * 100);
    }
  }

  return formatPercent(
    Number.isFinite(data?.profileFunnel.totalConversionPercent)
      ? Number(data?.profileFunnel.totalConversionPercent)
      : Number.isFinite(data?.profileFunnel.conversionRate)
        ? Number(data?.profileFunnel.conversionRate)
        : 0,
  );
}
