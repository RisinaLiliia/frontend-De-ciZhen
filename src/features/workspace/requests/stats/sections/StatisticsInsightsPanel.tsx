'use client';

import { WorkspaceInsightsPanel, type WorkspaceInsightsPanelItem } from '@/features/workspace/requests/components/WorkspaceInsightsPanel';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';

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
): { label: string; tone: 'success' | 'info' | 'warning' | 'danger' } {
  if (item.kind === 'opportunity' || item.kind === 'demand') {
    return { label: copy.insightsTypeChanceLabel, tone: 'success' };
  }
  if (item.kind === 'growth' || item.kind === 'performance') {
    return { label: copy.insightsTypeTrendLabel, tone: 'info' };
  }
  if (item.kind === 'risk') {
    return { label: copy.insightsTypeRiskLabel, tone: 'warning' };
  }
  if (item.kind === 'promotion') {
    return { label: copy.insightsTypeActionLabel, tone: 'danger' };
  }
  return { label: copy.insightsTypeSignalLabel, tone: 'info' };
}

export function StatisticsInsightsPanel({
  copy,
  subtitle,
  insights,
  showInsightsDebug,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  subtitle?: string;
  insights: WorkspaceStatisticsModel['insights'];
  showInsightsDebug: boolean;
}) {
  const items: WorkspaceInsightsPanelItem[] = insights.map((item) => {
    const badge = resolveInsightBadge(item, copy);
    return {
      key: item.key,
      level: item.level,
      kind: item.kind,
      badgeLabel: badge.label,
      badgeTone: badge.tone,
      title: item.title,
      text: item.text,
      evidence: item.evidence,
      metrics: splitInsightEvidence(item.evidence),
      actionLabel: item === insights[0] ? copy.insightsFeaturedActionLabel : undefined,
      debugText: showInsightsDebug
        ? [
          item.code,
          typeof item.score === 'number' ? `score ${item.score}` : '',
          item.priority ?? '',
          item.context ?? '',
        ].filter(Boolean).join(' · ')
        : undefined,
    };
  });

  return (
    <WorkspaceInsightsPanel
      title={copy.insightsTitle}
      subtitle={subtitle ?? copy.insightsSubtitle}
      emptyLabel={copy.emptyInsights}
      generatedLabel={copy.insightsGeneratedLabel}
      assistantAvatarLabel={copy.insightsAssistantAvatarLabel}
      assistantName={copy.insightsAssistantName}
      assistantRole={copy.insightsAssistantNote}
      featuredLabel={copy.insightsFeaturedLabel}
      items={items}
    />
  );
}
