import type { WorkspaceStatisticsCopy } from './statistics.copy';

export function resolveComparisonLabel(copy: WorkspaceStatisticsCopy, key: string) {
  if (key === 'offer_rate') return copy.activityOfferRateLabel;
  if (key === 'avg_response_time') return copy.activityResponseMedianLabel;
  if (key === 'cancellation_rate') return copy.activityCancellationLabel;
  if (key === 'avg_order_value') return copy.activityAverageOrderValueLabel;
  if (key === 'revenue') return copy.activityRevenueLabel;
  if (key === 'conversion_rate') return copy.conversionLabel;
  if (key === 'response_rate') return copy.stage3LabelPersonalized;
  if (key === 'response_time') return copy.activityResponseMedianLabel;
  return copy.activityUnansweredLabel;
}

export function resolveStatusLabel(copy: WorkspaceStatisticsCopy, status: 'high' | 'medium' | 'low' | null) {
  if (status === 'high') return copy.userRiskSeverityHigh;
  if (status === 'medium') return copy.userRiskSeverityMedium;
  if (status === 'low') return copy.userRiskSeverityLow;
  return null;
}

export function resolvePositionHeadline(copy: WorkspaceStatisticsCopy, percentile: number | null, bucket: 'top' | 'average' | 'below') {
  if (bucket === 'top') {
    const topShare = percentile === null ? 30 : Math.max(5, 100 - Math.round(percentile));
    return `${copy.userPositionTopPrefix} ${topShare}% ${copy.userPositionTopSuffix}`;
  }
  if (bucket === 'below') return copy.userPositionBelowLabel;
  return copy.userPositionAverageLabel;
}

export function resolvePositionSummary(copy: WorkspaceStatisticsCopy, percentile: number | null) {
  if (percentile === null) return copy.userPositionSummaryFallback;
  return copy.userPositionSummaryTemplate.replace('{percentile}', String(Math.round(percentile)));
}

