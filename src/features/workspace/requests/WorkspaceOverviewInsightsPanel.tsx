'use client';

import * as React from 'react';

import type { Locale } from '@/lib/i18n/t';
import { buildWorkspaceHref } from '@/features/workspace/shell/workspaceLinks';
import { WorkspaceInsightsPanel, type WorkspaceInsightsPanelItem } from '@/features/workspace/requests/components/WorkspaceInsightsPanel';
import type { WorkspaceStatisticsModel } from '@/features/workspace/requests/stats/workspaceStatistics.model';
import { resolveInsightBadge, splitInsightEvidence } from '@/features/workspace/requests/stats/sections/StatisticsInsightsPanel';

type WorkspaceOverviewInsightsPanelProps = {
  locale: Locale;
  currentSearch: string;
  statisticsModel: WorkspaceStatisticsModel;
  panelRef?: React.Ref<HTMLElement>;
  style?: React.CSSProperties;
};

function getInsightsCopy(locale: Locale) {
  if (locale === 'en') {
    return {
      title: 'AI insights',
      subtitle: 'Two or three signals worth acting on now.',
      defaultCtaLabel: 'Open analysis',
    };
  }

  return {
    title: 'AI Insights',
    subtitle: 'Die wichtigsten Signale fuer die naechsten Schritte.',
    defaultCtaLabel: 'Analyse ansehen',
  };
}

export function WorkspaceOverviewInsightsPanel({
  locale,
  currentSearch,
  statisticsModel,
  panelRef,
  style,
}: WorkspaceOverviewInsightsPanelProps) {
  const copy = React.useMemo(() => getInsightsCopy(locale), [locale]);
  const analysisHref = React.useMemo(
    () => buildWorkspaceHref({ currentSearch, section: 'stats', removeKeys: ['page'] }),
    [currentSearch],
  );
  const subtitle = statisticsModel.context.mode === 'focus'
    ? `${copy.subtitle} · ${statisticsModel.context.stickyLabel}`
    : copy.subtitle;
  const insights = React.useMemo<WorkspaceInsightsPanelItem[]>(
    () =>
      statisticsModel.insights
        .slice(0, 2)
        .map((item) => {
          const badge = resolveInsightBadge(item, statisticsModel.copy);
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
            actionHref: analysisHref,
            actionLabel: copy.defaultCtaLabel,
          };
        })
        .filter((item) => item.text.trim().length > 0),
    [
      analysisHref,
      copy.defaultCtaLabel,
      statisticsModel.copy,
      statisticsModel.insights,
    ],
  );

  if (insights.length === 0) return null;

  return (
    <WorkspaceInsightsPanel
      title={copy.title}
      subtitle={subtitle}
      emptyLabel={statisticsModel.copy.emptyInsights}
      generatedLabel={statisticsModel.copy.insightsGeneratedLabel}
      assistantAvatarLabel={statisticsModel.copy.insightsAssistantAvatarLabel}
      assistantName={statisticsModel.copy.insightsAssistantName}
      assistantRole={statisticsModel.copy.insightsAssistantNote}
      featuredLabel={statisticsModel.copy.insightsFeaturedLabel}
      items={insights}
      className="workspace-statistics-layout workspace-overview__panel"
      panelRef={panelRef}
      style={style}
    />
  );
}
