'use client';

import type { WorkspaceRequestsViewCard } from '@/features/workspace/requests/workspaceRequestsView.model';
import type { WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

export type WorkQueueMode = 'default' | 'decision';

export type ActiveDecisionState = {
  mode: WorkQueueMode;
  activeRequestId: string | null;
  completedInSession: number;
};

export function resolveDecisionQueueIds(
  panel: WorkspaceRequestsDecisionPanelDto | null | undefined,
): string[] {
  return panel?.queue.map((item) => item.requestId) ?? [];
}

export function sortCardsForDecisionMode(
  cards: WorkspaceRequestsViewCard[],
  panel: WorkspaceRequestsDecisionPanelDto | null | undefined,
): WorkspaceRequestsViewCard[] {
  const queueIds = resolveDecisionQueueIds(panel);
  if (queueIds.length === 0) return [];

  const cardByRequestId = new Map(cards.map((card) => [card.requestId, card]));

  return queueIds
    .map((requestId) => cardByRequestId.get(requestId) ?? null)
    .filter((card): card is WorkspaceRequestsViewCard => Boolean(card));
}

export function resolveDecisionActiveRequestId(params: {
  mode: WorkQueueMode;
  queueIds: string[];
  activeRequestId: string | null;
}): string | null {
  if (params.mode !== 'decision') return null;
  if (params.queueIds.length === 0) return null;
  if (params.activeRequestId && params.queueIds.includes(params.activeRequestId)) {
    return params.activeRequestId;
  }
  return params.queueIds[0] ?? null;
}

export function buildDecisionPanelSummaryText(params: {
  locale: Locale;
  panel: WorkspaceRequestsDecisionPanelDto | null | undefined;
  variant?: 'private' | 'market';
}): string {
  const panel = params.panel;
  const variant = params.variant ?? 'private';
  const t = (key: string) => translate(key as never, params.locale);

  if (variant === 'market') {
    if (!panel || panel.summary.totalNeedsAction === 0) {
      return t(I18N_KEYS.requestsPage.decisionPanelMarketMoving);
    }

    const parts: string[] = [];

    if (panel.summary.overdueCount > 0) {
      parts.push(t(I18N_KEYS.requestsPage.decisionPanelMarketOverdueTemplate).replace('{count}', String(panel.summary.overdueCount)));
    }

    if (panel.summary.highPriorityCount > 0) {
      parts.push(t(I18N_KEYS.requestsPage.decisionPanelMarketHighPriorityTemplate).replace('{count}', String(panel.summary.highPriorityCount)));
    }

    if (panel.summary.newOffersCount > 0) {
      parts.push(t(I18N_KEYS.requestsPage.decisionPanelMarketNewTemplate).replace('{count}', String(panel.summary.newOffersCount)));
    }

    return parts.slice(0, 2).join(', ');
  }

  if (!panel || panel.summary.totalNeedsAction === 0) {
    return t(I18N_KEYS.requestsPage.decisionPanelPrivateMoving);
  }

  const parts: string[] = [];

  if (panel.summary.newOffersCount > 0) {
    parts.push(t(I18N_KEYS.requestsPage.decisionPanelPrivateNewOffersTemplate).replace('{count}', String(panel.summary.newOffersCount)));
  }

  if (panel.summary.replyRequiredCount > 0) {
    parts.push(t(I18N_KEYS.requestsPage.decisionPanelPrivateReplyRequiredTemplate).replace('{count}', String(panel.summary.replyRequiredCount)));
  }

  if (panel.summary.confirmCompletionCount > 0) {
    parts.push(t(I18N_KEYS.requestsPage.decisionPanelPrivateConfirmCompletionTemplate).replace('{count}', String(panel.summary.confirmCompletionCount)));
  }

  if (panel.summary.overdueCount > 0) {
    parts.push(t(I18N_KEYS.requestsPage.decisionPanelPrivateOverdueTemplate).replace('{count}', String(panel.summary.overdueCount)));
  }

  return parts.slice(0, 2).join(', ');
}
