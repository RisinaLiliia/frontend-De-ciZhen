'use client';

import type {
  WorkspaceMyRequestCardDto,
  WorkspaceRequestsDecisionPanelDto,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

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
  cards: WorkspaceMyRequestCardDto[],
  panel: WorkspaceRequestsDecisionPanelDto | null | undefined,
): WorkspaceMyRequestCardDto[] {
  const queueIds = resolveDecisionQueueIds(panel);
  if (queueIds.length === 0) return [];

  const cardByRequestId = new Map(cards.map((card) => [card.requestId, card]));

  return queueIds
    .map((requestId) => cardByRequestId.get(requestId) ?? null)
    .filter((card): card is WorkspaceMyRequestCardDto => Boolean(card));
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
}): string {
  const panel = params.panel;
  if (!panel || panel.summary.totalNeedsAction === 0) {
    return params.locale === 'de'
      ? 'Deine Vorgänge sind aktuell im Fluss.'
      : 'Your workflows are currently moving.';
  }

  const parts: string[] = [];

  if (panel.summary.newOffersCount > 0) {
    parts.push(
      params.locale === 'de'
        ? `${panel.summary.newOffersCount} neue Angebote`
        : `${panel.summary.newOffersCount} new offers`,
    );
  }

  if (panel.summary.replyRequiredCount > 0) {
    parts.push(
      params.locale === 'de'
        ? `${panel.summary.replyRequiredCount} offene Rückmeldung`
        : `${panel.summary.replyRequiredCount} reply required`,
    );
  }

  if (panel.summary.confirmCompletionCount > 0) {
    parts.push(
      params.locale === 'de'
        ? `${panel.summary.confirmCompletionCount} Bestätigung offen`
        : `${panel.summary.confirmCompletionCount} completion to confirm`,
    );
  }

  if (panel.summary.overdueCount > 0) {
    parts.push(
      params.locale === 'de'
        ? `${panel.summary.overdueCount} überfällig`
        : `${panel.summary.overdueCount} overdue`,
    );
  }

  return parts.slice(0, 2).join(params.locale === 'de' ? ', ' : ', ');
}
