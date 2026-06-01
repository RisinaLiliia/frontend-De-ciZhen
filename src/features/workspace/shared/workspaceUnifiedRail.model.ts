import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

import type {
  WorkspaceUnifiedRailAction,
  WorkspaceUnifiedRailModel,
  WorkspaceUnifiedRailRecommendationItem,
  WorkspaceUnifiedRailVisualization,
} from './WorkspaceUnifiedRail';

type SummaryItem = {
  key: string;
  label: string;
  value: string | number;
  helper?: string | null;
  tone?: 'all' | 'attention' | 'execution' | 'completed';
};

type LinkedDecisionPanel = {
  eyebrow: string;
  title: string;
  text: string;
  totalValue?: string | number | null;
  visualization?: WorkspaceUnifiedRailVisualization;
  primaryAction?: WorkspaceUnifiedRailAction | null;
  secondaryAction?: WorkspaceUnifiedRailAction | null;
  queueTitle: string;
  queue: Array<{
    id: string;
    title: string;
    actionLabel: string;
    actionPriorityLevel: 'high' | 'medium' | 'low';
    priorityLabel?: string | null;
    actionReason?: string | null;
    action: WorkspaceUnifiedRailAction;
  }>;
  emptyText: string;
  overview: Array<{
    key: string;
    label: string;
    value: string | number;
  }>;
};

type BuildLinkedWorkspaceRailModelParams = {
  locale: Locale;
  contextLabel: string;
  summaryItems?: SummaryItem[] | null;
  panel?: LinkedDecisionPanel | null;
  activeItemId?: string | null;
  recommendations?: WorkspaceUnifiedRailRecommendationItem[] | null;
  analysisHref?: string;
  queueFooterHref?: string;
  recommendationsFooterHref?: string;
  queueCountTemplate?: string;
};

function toneToRecommendationTone(
  tone?: SummaryItem['tone'],
): WorkspaceUnifiedRailRecommendationItem['tone'] {
  if (tone === 'attention') return 'attention';
  if (tone === 'execution') return 'opportunity';
  if (tone === 'completed') return 'positive';
  return 'neutral';
}

function withCount(template: string, count: number) {
  return template.replace('{count}', String(count));
}

export function buildSummaryRecommendations(
  items?: SummaryItem[] | null,
): WorkspaceUnifiedRailRecommendationItem[] {
  return (items ?? [])
    .slice(1, 4)
    .map((item) => ({
      id: item.key,
      title: item.label,
      description: item.helper?.trim() || item.label,
      metric: item.value,
      tone: toneToRecommendationTone(item.tone),
    }));
}

export function buildLinkedWorkspaceRailModel({
  locale,
  contextLabel,
  summaryItems,
  panel,
  activeItemId = null,
  recommendations,
  analysisHref = '/workspace?section=stats',
  queueFooterHref,
  recommendationsFooterHref,
  queueCountTemplate,
}: BuildLinkedWorkspaceRailModelParams): WorkspaceUnifiedRailModel | null {
  if (!panel && (!summaryItems || summaryItems.length === 0)) {
    return null;
  }

  const t = (key: string) => translate(key as never, locale);
  const totalValue = panel?.totalValue ?? summaryItems?.[0]?.value ?? 0;
  const queueCount = panel?.queue.length ?? 0;

  return {
    decisionPanel: {
      eyebrow: panel?.eyebrow ?? t(I18N_KEYS.requestsPage.decisionPanelTitle),
      value: totalValue,
      contextLabel,
      title: panel?.title ?? contextLabel,
      visualization: panel?.visualization ?? 'none',
      metrics: panel?.overview ?? [],
      primaryAction: panel?.primaryAction ?? null,
      secondaryAction: panel?.secondaryAction ?? {
        kind: 'link',
        label: t(I18N_KEYS.requestsPage.workspaceRailAnalysisCta),
        href: analysisHref,
      },
    },
    actionQueue: {
      eyebrow: panel?.queueTitle ?? t(I18N_KEYS.requestsPage.decisionPanelQueueTitle),
      title: withCount(
        queueCountTemplate ?? t(I18N_KEYS.requestsPage.workspaceRailQueueCountTemplate),
        queueCount,
      ),
      items: (panel?.queue ?? []).slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        meta: item.actionLabel,
        detail: item.actionReason,
        priorityTone: item.actionPriorityLevel,
        priorityLabel: item.priorityLabel ?? (
          item.actionPriorityLevel === 'high'
            ? t(I18N_KEYS.requestsPage.decisionPanelPriorityHigh)
            : item.actionPriorityLevel === 'medium'
              ? t(I18N_KEYS.requestsPage.decisionPanelPriorityMedium)
              : t(I18N_KEYS.requestsPage.decisionPanelPriorityLow)
        ),
        action: item.action,
        isActive: item.id === activeItemId,
      })),
      emptyText: panel?.emptyText ?? t(I18N_KEYS.requestsPage.workspaceDecisionDoneHint),
      footerAction: queueFooterHref
        ? {
            kind: 'link',
            label: t(I18N_KEYS.requestsPage.workspaceRailQueueCta),
            href: queueFooterHref,
          }
        : null,
    },
    recommendations: {
      eyebrow: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsEyebrow),
      title: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsTitle),
      items: (recommendations?.length ? recommendations : buildSummaryRecommendations(summaryItems)).slice(0, 3),
      emptyText: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsEmpty),
      footerAction: {
        kind: 'link',
        label: t(I18N_KEYS.requestsPage.workspaceRailRecommendationsCta),
        href: recommendationsFooterHref ?? analysisHref,
      },
    },
  };
}
