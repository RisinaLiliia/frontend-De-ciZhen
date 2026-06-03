'use client';

import type { WorkspaceUnifiedRailModel } from '@/features/workspace/shared/WorkspaceUnifiedRail';
import type { WorkspaceStatisticsModel } from '../statistics.model';

type StatisticsRailMapperParams = {
  copy: WorkspaceStatisticsModel['copy'];
  decisionPlan: {
    summary: string;
    actionLabel?: string | null;
  };
  activePriceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
  rightRailNextSteps: WorkspaceStatisticsModel['rightRailNextSteps'];
  resolvedDecisionSubtitle: string;
  contextScopeLabel: string;
  onPrimaryAction: () => void;
  onQueueItemAction: () => void;
};

export function mapStatisticsRailModel({
  copy,
  decisionPlan,
  activePriceIntelligence,
  selectedOpportunity,
  rightRailNextSteps,
  resolvedDecisionSubtitle,
  contextScopeLabel,
  onPrimaryAction,
  onQueueItemAction,
}: StatisticsRailMapperParams): WorkspaceUnifiedRailModel {
  const decisionValue = selectedOpportunity
    ? selectedOpportunity.score.toFixed(1)
    : (activePriceIntelligence.recommendedRangeLabel ?? '—');

  const metrics = [
    {
      key: 'opportunity-score',
      label: copy.opportunityScoreLabel || 'Opportunity',
      value: selectedOpportunity ? selectedOpportunity.score.toFixed(1) : '—',
      icon: 'responseRate' as const,
      tone: 'primary' as const,
    },
    {
      key: 'demand',
      label: copy.opportunityDemandLabel || 'Demand',
      value: selectedOpportunity ? String(selectedOpportunity.demand) : '—',
      icon: 'requests' as const,
    },
    {
      key: 'providers',
      label: copy.opportunityProvidersLabel || 'Providers',
      value: selectedOpportunity?.providers != null ? String(selectedOpportunity.providers) : '—',
      icon: 'providers' as const,
    },
  ];

  const queueItems = (rightRailNextSteps?.steps ?? []).map((s) => ({
    id: s.key,
    title: s.title,
    meta: s.detail ?? '',
    priorityTone: 'neutral' as const,
    action: {
      kind: 'button' as const,
      label: decisionPlan.actionLabel ?? copy.kpiTitle,
      onClick: onQueueItemAction,
    },
  }));

  const recommendations = [] as Array<{
    id: string;
    title: string;
    description: string;
    metric: string | number;
    tone: 'positive';
  }>;

  if (activePriceIntelligence.recommendation) {
    recommendations.push({
      id: 'price-reco',
      title: activePriceIntelligence.recommendation,
      description: activePriceIntelligence.recommendation,
      metric: decisionValue,
      tone: 'positive',
    });
  }

  return {
    decisionPanel: {
      eyebrow: resolvedDecisionSubtitle,
      value: decisionValue,
      contextLabel: selectedOpportunity
        ? `${selectedOpportunity.city} · ${selectedOpportunity.category}`
        : contextScopeLabel,
      title: decisionPlan.summary,
      layout: 'metricGrid',
      metrics,
      primaryAction: {
        kind: 'button',
        label: decisionPlan.actionLabel ?? copy.kpiTitle,
        onClick: onPrimaryAction,
      },
    },
    actionQueue: {
      eyebrow: 'Opportunities',
      title: 'Actions',
      items: queueItems,
      emptyText: 'No signals',
    },
    recommendations: {
      eyebrow: 'Recommendations',
      title: 'Recommendations',
      items: recommendations,
      emptyText: 'No recommendations',
    },
  };
}
