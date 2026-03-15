import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import type { WorkspaceStatisticsFunnelItemView } from './workspaceStatistics.model';

export const FUNNEL_MIN_WIDTH_PERCENT_DESKTOP = 40;
export const FUNNEL_MIN_WIDTH_PERCENT_MOBILE = 52;

export type WorkspaceStatisticsFunnelVisualRow = WorkspaceStatisticsFunnelItemView & {
  topWidthPercent: number;
  bottomWidthPercent: number;
  fullLabel: string;
  displayLabel: string;
  isCompactLabel: boolean;
  isTall: boolean;
};

export function getCompactFunnelLabel(
  key: WorkspaceStatisticsFunnelItemView['key'],
  copy: WorkspaceStatisticsCopy,
): string {
  if (key === 'offers') return copy.funnelOffersCompactLabel;
  if (key === 'confirmed') return copy.funnelConfirmedCompactLabel;
  if (key === 'closed') return copy.funnelClosedCompactLabel;
  if (key === 'completed') return copy.funnelCompletedCompactLabel;
  if (key === 'profit') return copy.funnelProfitCompactLabel;
  return copy.funnelRequestsCompactLabel;
}

export function buildFunnelVisualRows(params: {
  funnel: WorkspaceStatisticsFunnelItemView[];
  copy: WorkspaceStatisticsCopy;
  isNarrowViewport: boolean;
  funnelContainerWidth: number;
}): WorkspaceStatisticsFunnelVisualRow[] {
  const { funnel, copy, isNarrowViewport, funnelContainerWidth } = params;
  const minVisualWidth = isNarrowViewport
    ? FUNNEL_MIN_WIDTH_PERCENT_MOBILE
    : FUNNEL_MIN_WIDTH_PERCENT_DESKTOP;
  const completedWidth = funnel.find((step) => step.key === 'completed')?.widthPercent ?? null;
  const shouldForceCompactByWidth = funnelContainerWidth > 0 && funnelContainerWidth < 420;
  const visualWidths = funnel.map((step) => {
    const sourceWidth = step.isCurrency && completedWidth !== null ? completedWidth : step.widthPercent;
    return Math.max(minVisualWidth, Math.min(100, Number(sourceWidth || 0)));
  });

  return funnel.map((step, index) => {
    const topWidthPercent = index === 0
      ? (visualWidths[0] ?? 100)
      : (visualWidths[index - 1] ?? visualWidths[0] ?? 100);
    const bottomWidthPercent = visualWidths[index] ?? topWidthPercent;
    const compactLabel = getCompactFunnelLabel(step.key, copy);
    const isLongLabel = step.label.length > 24;
    const shouldUseCompactLabel =
      isNarrowViewport ||
      shouldForceCompactByWidth ||
      bottomWidthPercent < 52 ||
      (isLongLabel && bottomWidthPercent < 62);

    return {
      ...step,
      topWidthPercent,
      bottomWidthPercent: Math.min(topWidthPercent, bottomWidthPercent),
      fullLabel: step.label,
      displayLabel: shouldUseCompactLabel ? compactLabel : step.label,
      isCompactLabel: shouldUseCompactLabel,
      isTall: !shouldUseCompactLabel && step.label.length > 18,
    };
  });
}
