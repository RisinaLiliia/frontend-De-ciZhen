'use client';

import {
  normalizeWorkspaceRequestCardAction,
  type WorkspaceRequestCardAction as PrivateRequestCardAction,
} from '@/features/workspace/requests/workspaceRequestCardActionResolvers';
import type { WorkspaceRequestsViewCard } from '@/features/workspace/requests/workspaceRequestsView.model';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

export type { PrivateRequestCardAction };

export type PrivateRequestCardChrome = {
  priorityLabel: string | null;
  priorityTone: 'high' | 'medium' | 'low' | 'none';
  contextPills: string[];
  signalPills: Array<{
    key: string;
    label: string;
    tone: 'info' | 'warning' | 'success' | 'neutral';
  }>;
  insights: Array<{
    key: string;
    title: string;
    description: string;
    tone: 'info' | 'warning' | 'success' | 'neutral';
  }>;
  primaryAction: PrivateRequestCardAction | null;
  secondaryAction: PrivateRequestCardAction | null;
};

function resolvePriorityLabel(locale: Locale, card: WorkspaceRequestsViewCard) {
  if (card.decision.needsAction) {
    return translate(I18N_KEYS.requestsPage.workspacePriorityActionRequired, locale);
  }

  if (card.state === 'active') {
    return translate(I18N_KEYS.requestsPage.statusInProgress, locale);
  }

  if (card.state === 'completed') {
    return translate(I18N_KEYS.requestsPage.statusCompleted, locale);
  }

  return null;
}

function resolveContextPills() {
  return [];
}

function resolveSignalPills(
  card: WorkspaceRequestsViewCard,
): PrivateRequestCardChrome['signalPills'] {
  const pills: PrivateRequestCardChrome['signalPills'] = [];

  if (card.decision.needsAction && card.decision.actionLabel) {
    pills.push({
      key: 'decision',
      label: card.decision.actionLabel,
      tone: card.decision.actionPriorityLevel === 'high' ? 'warning' : 'info',
    });
  }

  if (card.status.badgeLabel) {
    pills.push({
      key: 'status',
      label: card.status.badgeLabel,
      tone:
        card.status.badgeVariant === 'success'
          ? 'success'
          : card.status.badgeVariant === 'warning' ||
              card.status.badgeVariant === 'risk' ||
              card.status.badgeVariant === 'priority'
            ? 'warning'
            : 'info',
    });
  }

  return pills.slice(0, 2);
}

function resolveInsightTitle(locale: Locale, card: WorkspaceRequestsViewCard) {
  if (card.decision.actionType === 'review_offers') {
    return translate(I18N_KEYS.requestsPage.workspaceInsightOffers, locale);
  }

  if (card.decision.actionType === 'reply_required') {
    return translate(I18N_KEYS.requestsPage.workspaceInsightReplies, locale);
  }

  if (card.decision.actionType === 'confirm_contract') {
    return translate(I18N_KEYS.requestsPage.workspaceInsightContract, locale);
  }

  if (card.decision.actionType === 'confirm_completion') {
    return translate(I18N_KEYS.requestsPage.workspaceInsightCompletion, locale);
  }

  if (card.decision.actionType === 'review_completion') {
    return translate(I18N_KEYS.requestsPage.workspaceInsightReview, locale);
  }

  return translate(I18N_KEYS.requestsPage.workspaceInsightCurrentStatus, locale);
}

function resolveInsights(args: {
  card: WorkspaceRequestsViewCard;
  locale: Locale;
}): PrivateRequestCardChrome['insights'] {
  const { card, locale } = args;
  const items: PrivateRequestCardChrome['insights'] = [];
  const decisionDescription = card.decision.actionReason?.trim() ?? '';
  const activityDescription = card.activity?.label?.trim() ?? '';

  if (decisionDescription) {
    items.push({
      key: 'decision',
      title: resolveInsightTitle(locale, card),
      description: decisionDescription,
      tone: card.decision.actionPriorityLevel === 'high' ? 'warning' : 'info',
    });
  }

  if (activityDescription && activityDescription !== decisionDescription) {
    items.push({
      key: 'activity',
      title: translate(I18N_KEYS.requestsPage.workspaceInsightStatus, locale),
      description: activityDescription,
      tone: card.activity?.tone ?? 'neutral',
    });
  }

  return items.slice(0, 2);
}

export function buildPrivateRequestCardChrome(args: {
  card: WorkspaceRequestsViewCard;
  locale: Locale;
}): PrivateRequestCardChrome {
  const { card, locale } = args;
  if (card.chrome) {
    return {
      priorityLabel: card.chrome.priorityLabel ?? null,
      priorityTone: card.chrome.priorityTone,
      contextPills: [],
      signalPills: card.chrome.signalPills,
      insights: card.chrome.insights,
      primaryAction: card.primaryAction
        ? normalizeWorkspaceRequestCardAction(card.primaryAction, card)
        : null,
      secondaryAction: card.secondaryAction
        ? normalizeWorkspaceRequestCardAction(card.secondaryAction, card)
        : null,
    };
  }

  return {
    priorityLabel: resolvePriorityLabel(locale, card),
    priorityTone: card.decision.actionPriorityLevel,
    contextPills: resolveContextPills(),
    signalPills: resolveSignalPills(card),
    insights: resolveInsights({ card, locale }),
    primaryAction: card.primaryAction
      ? normalizeWorkspaceRequestCardAction(card.primaryAction, card)
      : null,
    secondaryAction: card.secondaryAction
      ? normalizeWorkspaceRequestCardAction(card.secondaryAction, card)
      : null,
  };
}
