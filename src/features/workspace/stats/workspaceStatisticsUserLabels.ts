import type { WorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import type {
  WorkspaceStatisticsActionStepView,
  WorkspaceStatisticsPriorityItemView,
} from './workspaceStatistics.model';

export function resolveFitLabel(copy: WorkspaceStatisticsCopy, value: 'high' | 'medium' | 'low' | 'unknown') {
  if (value === 'high') return copy.userFitHighLabel;
  if (value === 'medium') return copy.userRiskSeverityMedium;
  if (value === 'low') return copy.userRiskSeverityLow;
  return '—';
}

export function resolveOpportunityLabel(copy: WorkspaceStatisticsCopy, value: 'high' | 'medium' | 'low' | 'unknown') {
  if (value === 'high') return copy.userRiskSeverityHigh;
  if (value === 'medium') return copy.userRiskSeverityMedium;
  if (value === 'low') return copy.userRiskSeverityLow;
  return '—';
}

export function resolveActivityLabel(copy: WorkspaceStatisticsCopy, value: 'high' | 'medium' | 'low' | 'unknown') {
  if (value === 'high') return copy.contextHealthActivityHigh;
  if (value === 'medium') return copy.contextHealthActivityStable;
  if (value === 'low') return copy.contextHealthActivityLow;
  return '—';
}

export function resolveRecommendationTone(
  type: 'risk' | 'opportunity' | 'performance' | 'growth' | 'promotion' | 'demand',
): WorkspaceStatisticsPriorityItemView['tone'] {
  if (type === 'risk') return 'warning';
  if (type === 'opportunity' || type === 'demand') return 'positive';
  return 'neutral';
}

export function resolveRecommendationReliabilityLabel(
  copy: WorkspaceStatisticsCopy,
  reliability: 'high' | 'medium' | 'low',
): string {
  if (reliability === 'high') return copy.userRecommendationReliabilityHigh;
  if (reliability === 'medium') return copy.userRecommendationReliabilityMedium;
  return copy.userRecommendationReliabilityLow;
}

export function resolveRecommendationPriorityLabel(
  copy: WorkspaceStatisticsCopy,
  priority: 'high' | 'medium' | 'low',
): string {
  if (priority === 'high') return copy.userActionPriorityHigh;
  if (priority === 'medium') return copy.userActionPriorityMedium;
  return copy.userActionPriorityLow;
}

export function resolveRecommendationPriorityTone(
  priority: 'high' | 'medium' | 'low',
): WorkspaceStatisticsActionStepView['priorityTone'] {
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'info';
  return 'success';
}