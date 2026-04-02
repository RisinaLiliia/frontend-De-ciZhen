'use client';

import type { Ref } from 'react';

import type { BadgeVariant } from '@/components/ui/Badge';
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
): { label: string; tone: BadgeVariant } {
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

export function StatisticsInsightsPanel({
  panelRef,
  panelMinHeight,
  copy,
  insights,
  showInsightsDebug,
}: {
  panelRef?: Ref<HTMLElement>;
  panelMinHeight?: number | null;
  copy: WorkspaceStatisticsModel['copy'];
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
      emptyLabel={copy.emptyInsights}
      generatedLabel={copy.priceGeneratedLabel}
      assistantAvatarLabel={copy.insightsAssistantAvatarLabel}
      assistantName={copy.insightsAssistantName}
      assistantRole={copy.insightsAssistantNote}
      featuredLabel={copy.insightsFeaturedLabel}
      items={items}
      panelRef={panelRef}
      style={panelMinHeight ? { minHeight: `${panelMinHeight}px`, height: `${panelMinHeight}px` } : undefined}
    />
  );
}
