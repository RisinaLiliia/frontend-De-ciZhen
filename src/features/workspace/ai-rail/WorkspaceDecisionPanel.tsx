'use client';

import * as React from 'react';

import { buildDecisionPanelSummaryText } from '@/features/workspace/requests/requestsDecision.model';
import {
  buildLinkedWorkspaceRailModel,
  WorkspaceUnifiedRail,
  type WorkspaceUnifiedRailRecommendationItem,
} from '@/features/workspace/shared';
import type {
  WorkspaceRequestsDecisionPanelDto,
  WorkspaceRequestsSidePanelDto,
  WorkspaceRequestsSummaryDto,
} from '@/lib/api/dto/workspace';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

export type WorkspaceDecisionPanelProps = {
  locale: Locale;
  summaryItems?: WorkspaceRequestsSummaryDto['items'] | null;
  panel: WorkspaceRequestsDecisionPanelDto;
  sidePanel?: WorkspaceRequestsSidePanelDto | null;
  isDecisionMode: boolean;
  activeRequestId: string | null;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
  variant?: 'private' | 'market';
};

export function WorkspaceDecisionPanel({
  locale,
  summaryItems = null,
  panel,
  sidePanel = null,
  isDecisionMode,
  activeRequestId,
  onStartDecisionMode,
  onOpenQueueItem,
  variant = 'private',
}: WorkspaceDecisionPanelProps) {
  const t = React.useCallback((key: string) => translate(key as never, locale), [locale]);
  const summaryText = React.useMemo(
    () => buildDecisionPanelSummaryText({ locale, panel, variant }),
    [locale, panel, variant],
  );
  const priorityLabel = React.useCallback((level: 'high' | 'medium' | 'low') => {
    if (variant === 'market') {
      if (level === 'high') return t(I18N_KEYS.requestsPage.decisionPanelPriorityHigh);
      if (level === 'medium') return t(I18N_KEYS.requestsPage.decisionPanelPriorityMedium);
      return t(I18N_KEYS.requestsPage.decisionPanelPriorityNew);
    }

    if (level === 'high') return t(I18N_KEYS.requestsPage.decisionPanelPriorityHigh);
    if (level === 'medium') return t(I18N_KEYS.requestsPage.decisionPanelPriorityMedium);
    return t(I18N_KEYS.requestsPage.decisionPanelPriorityLow);
  }, [t, variant]);
  const overviewLabels = React.useMemo(
    () => (variant === 'market'
      ? {
          highUrgency: t(I18N_KEYS.requestsPage.decisionPanelOverviewHighDemand),
          inProgress: t(I18N_KEYS.requestsPage.decisionPanelOverviewInExecution),
          completedThisPeriod: t(I18N_KEYS.requestsPage.statusCompleted),
        }
      : {
          highUrgency: t(I18N_KEYS.requestsPage.decisionPanelOverviewHighUrgency),
          inProgress: t(I18N_KEYS.requestsPage.statusInProgress),
          completedThisPeriod: t(I18N_KEYS.requestsPage.statusCompleted),
        }),
    [t, variant],
  );
  const totalValue = summaryItems?.find((item) => item.key === 'all')?.value ?? panel.summary.totalNeedsAction;
  const contextLabel = variant === 'market'
    ? t(I18N_KEYS.requestsPage.workspaceRailRequestsMarketContext)
    : t(I18N_KEYS.requestsPage.workspaceRailRequestsPrivateContext);
  const recommendationItems = React.useMemo<WorkspaceUnifiedRailRecommendationItem[]>(() => {
    const items: WorkspaceUnifiedRailRecommendationItem[] = [];

    if (sidePanel?.focus) {
      items.push({
        id: 'focus',
        title: sidePanel.focus.title,
        description: sidePanel.focus.description,
        tone: 'opportunity',
      });
    }

    if (sidePanel?.recommendation) {
      items.push({
        id: 'recommendation',
        title: sidePanel.recommendation.title,
        description: sidePanel.recommendation.description,
        tone: 'positive',
      });
    }

    if (sidePanel?.contextItems?.length) {
      items.push(
        ...sidePanel.contextItems.slice(0, 3).map((item, index) => ({
          id: `context-${index}`,
          title: item.title,
          description: item.description ?? item.meta?.map((entry) => `${entry.label}: ${entry.value}`).join(' · ') ?? item.title,
          tone: 'neutral' as const,
        })),
      );
    }

    if (items.length > 0) {
      return items.slice(0, 3);
    }

    return [
      {
        id: 'needs-action',
        title: variant === 'market'
          ? t(I18N_KEYS.requestsPage.workspaceRailMarketRecommendationDemandTitle)
          : t(I18N_KEYS.requestsPage.workspaceRailPrivateRecommendationAttentionTitle),
        description: summaryText,
        metric: panel.summary.totalNeedsAction,
        tone: 'attention',
      },
      {
        id: 'in-progress',
        title: overviewLabels.inProgress,
        description: variant === 'market'
          ? t(I18N_KEYS.requestsPage.workspaceRailMarketRecommendationExecutionBody)
          : t(I18N_KEYS.requestsPage.workspaceRailPrivateRecommendationExecutionBody),
        metric: panel.overview.inProgress,
        tone: 'opportunity',
      },
      {
        id: 'completed',
        title: overviewLabels.completedThisPeriod,
        description: variant === 'market'
          ? t(I18N_KEYS.requestsPage.workspaceRailMarketRecommendationCompletedBody)
          : t(I18N_KEYS.requestsPage.workspaceRailPrivateRecommendationCompletedBody),
        metric: panel.overview.completedThisPeriod,
        tone: 'positive',
      },
    ];
  }, [overviewLabels.completedThisPeriod, overviewLabels.inProgress, panel.overview.completedThisPeriod, panel.overview.inProgress, panel.summary.totalNeedsAction, sidePanel, summaryText, t, variant]);
  const model = React.useMemo(
    () => buildLinkedWorkspaceRailModel({
      locale,
      contextLabel,
      summaryItems: summaryItems ?? null,
      panel: {
        eyebrow: t(I18N_KEYS.requestsPage.decisionPanelTitle),
        totalValue,
        title: variant === 'market'
          ? (
            panel.summary.totalNeedsAction > 0
              ? t(I18N_KEYS.requestsPage.decisionPanelMarketNeedsAttention)
              : t(I18N_KEYS.requestsPage.decisionPanelMarketNoOpenItems)
          )
          : (
            panel.summary.totalNeedsAction > 0
              ? t(I18N_KEYS.requestsPage.decisionPanelPrivateNeedsDecision)
              : t(I18N_KEYS.requestsPage.decisionPanelPrivateNoOpenItems)
          ),
        text: summaryText,
        visualization: 'donut',
        overview: [
          {
            key: 'highUrgency',
            label: overviewLabels.highUrgency,
            value: panel.overview.highUrgency,
            tone: variant === 'market' ? 'demand' : 'action',
          },
          {
            key: 'inProgress',
            label: overviewLabels.inProgress,
            value: panel.overview.inProgress,
            tone: 'supply',
          },
          {
            key: 'completed',
            label: overviewLabels.completedThisPeriod,
            value: panel.overview.completedThisPeriod,
            tone: 'opportunity',
          },
        ],
        primaryAction: {
          kind: 'button',
          label: panel.primaryAction.label,
          onClick: onStartDecisionMode,
          disabled: panel.summary.totalNeedsAction === 0,
        },
        queueTitle: t(I18N_KEYS.requestsPage.decisionPanelQueueTitle),
        queue: panel.queue.slice(0, 5).map((item) => ({
          id: item.requestId,
          title: item.title,
          actionLabel: item.actionLabel,
          actionPriorityLevel: item.actionPriorityLevel,
          priorityLabel: priorityLabel(item.actionPriorityLevel),
          action: {
            kind: 'button',
            label: item.title,
            onClick: () => onOpenQueueItem(item.requestId),
          },
        })),
        emptyText: variant === 'market'
          ? t(I18N_KEYS.requestsPage.decisionPanelMarketMoving)
          : t(I18N_KEYS.requestsPage.decisionPanelPrivateMoving),
      },
      activeItemId: activeRequestId,
      recommendations: recommendationItems,
      analysisHref: '/workspace?section=stats',
      queueFooterHref: panel.queue.length > 0 ? '/workspace?section=requests' : undefined,
      recommendationsFooterHref: '/workspace?section=stats',
    }),
    [
      activeRequestId,
      contextLabel,
      locale,
      onOpenQueueItem,
      onStartDecisionMode,
      overviewLabels.completedThisPeriod,
      overviewLabels.highUrgency,
      overviewLabels.inProgress,
      panel.overview.completedThisPeriod,
      panel.overview.highUrgency,
      panel.overview.inProgress,
      panel.primaryAction.label,
      panel.queue,
      panel.summary.totalNeedsAction,
      priorityLabel,
      recommendationItems,
      summaryItems,
      summaryText,
      t,
      totalValue,
      variant,
    ],
  );

  return (
    <>
      <WorkspaceUnifiedRail model={model} />
      {variant === 'private' && isDecisionMode && panel.queue.length > 0 ? (
        <p className="workspace-decision-panel__hint">
          {t(I18N_KEYS.requestsPage.decisionPanelAutoPriorityHint)}
        </p>
      ) : null}
    </>
  );
}
