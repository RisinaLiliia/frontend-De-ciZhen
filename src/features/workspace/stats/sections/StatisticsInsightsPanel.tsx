'use client';

import type { Ref } from 'react';

import {
  WorkspaceInsightsPanel,
  type WorkspaceInsightsPanelItem,
} from '@/features/workspace/ai-rail';
import {
  resolveInsightBadge,
  splitInsightEvidence,
} from '@/features/workspace/ai-rail/workspaceInsights.model';
import type { WorkspaceStatisticsModel } from '../statistics.model';

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
  const items: WorkspaceInsightsPanelItem[] = insights.slice(0, 4).map((item) => {
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
          ]
            .filter(Boolean)
            .join(' · ')
        : undefined,
    };
  });

  return (
    <WorkspaceInsightsPanel
      emptyLabel={copy.emptyInsights}
      generatedLabel={copy.insightsGeneratedLabel}
      assistantAvatarLabel={copy.insightsAssistantAvatarLabel}
      assistantName={copy.insightsAssistantName}
      assistantRole={copy.insightsAssistantNote}
      assistantDescription={copy.insightsAssistantNote.trim()}
      featuredLabel={copy.insightsFeaturedLabel}
      items={items}
      className="workspace-statistics-layout workspace-insights-panel--rail-balanced workspace-statistics__rail-panel workspace-statistics__rail-panel--insights"
      panelRef={panelRef}
      style={
        panelMinHeight
          ? { minHeight: `${panelMinHeight}px`, height: `${panelMinHeight}px` }
          : undefined
      }
      showHeader={false}
    />
  );
}
