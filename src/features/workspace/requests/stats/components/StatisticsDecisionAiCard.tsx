'use client';

import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import { StatisticsKiCard } from './StatisticsKiCard';

type StatisticsDecisionAiCardProps = {
  copy: WorkspaceStatisticsModel['copy'];
  decisionInsight: WorkspaceStatisticsModel['decisionInsight'];
  className?: string;
};

export function StatisticsDecisionAiCard({
  copy,
  decisionInsight,
  className,
}: StatisticsDecisionAiCardProps) {
  if (!decisionInsight.trim()) return null;

  const rootClassName = ['workspace-ai-card', 'workspace-ai-card--decision', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <StatisticsKiCard
      className={rootClassName}
      metaStamp
      stamp={copy.priceGeneratedLabel}
      avatarLabel={copy.insightsAssistantAvatarLabel}
      name={copy.insightsAssistantName}
      role={copy.priceRecommendationLabel}
      description={decisionInsight}
    />
  );
}
