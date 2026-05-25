'use client';

import type { WorkspaceBadgeVariant } from '@/features/workspace/shared/WorkspaceBadge';
import type { WorkspaceStatisticsModel } from '@/features/workspace/stats';

export function splitInsightEvidence(evidence: string | undefined): string[] {
  if (!evidence) return [];
  return evidence
    .split('·')
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

export function resolveInsightBadge(
  item: WorkspaceStatisticsModel['insights'][number],
  copy: WorkspaceStatisticsModel['copy'],
): { label: string; tone: WorkspaceBadgeVariant } {
  if (item.kind === 'opportunity' || item.kind === 'demand') {
    return { label: copy.insightsTypeChanceLabel, tone: 'opportunity' };
  }
  if (item.kind === 'growth' || item.kind === 'performance') {
    return { label: copy.insightsTypeTrendLabel, tone: 'info' };
  }
  if (item.kind === 'risk') {
    return { label: copy.insightsTypeRiskLabel, tone: 'risk' };
  }
  if (item.kind === 'promotion') {
    return { label: copy.insightsTypeActionLabel, tone: 'warning' };
  }
  return { label: copy.insightsTypeSignalLabel, tone: 'neutral' };
}
