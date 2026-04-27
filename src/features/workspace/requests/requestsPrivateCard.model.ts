'use client';

import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';
import {
  resolveWorkspaceRequestPrimaryCardAction,
  resolveWorkspaceRequestSecondaryCardAction,
  type WorkspaceRequestCardAction as PrivateRequestCardAction,
} from '@/features/workspace/requests/workspaceRequestCardActionResolvers';
import type { Locale } from '@/lib/i18n/t';

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

function resolvePriorityLabel(locale: Locale, card: WorkspaceMyRequestCardDto) {
  if (card.decision.needsAction) {
    return locale === 'de' ? 'Handlungsbedarf' : 'Action required';
  }

  if (card.state === 'active') {
    return locale === 'de' ? 'In Arbeit' : 'In progress';
  }

  if (card.state === 'completed') {
    return locale === 'de' ? 'Abgeschlossen' : 'Completed';
  }

  return null;
}

function resolveContextPills() {
  return [];
}

function resolveSignalPills(card: WorkspaceMyRequestCardDto): PrivateRequestCardChrome['signalPills'] {
  const pills: PrivateRequestCardChrome['signalPills'] = [];

  if (card.decision.needsAction && card.decision.actionLabel) {
    pills.push({
      key: 'decision',
      label: card.decision.actionLabel,
      tone:
        card.decision.actionPriorityLevel === 'high'
          ? 'warning'
          : 'info',
    });
  }

  if (card.status.badgeLabel) {
    pills.push({
      key: 'status',
      label: card.status.badgeLabel,
      tone:
        card.status.badgeTone === 'danger'
          ? 'warning'
          : card.status.badgeTone === 'success'
            ? 'success'
            : card.status.badgeTone === 'warning'
              ? 'warning'
              : 'info',
    });
  }

  return pills.slice(0, 2);
}

function resolveInsightTitle(locale: Locale, card: WorkspaceMyRequestCardDto) {
  if (card.decision.actionType === 'review_offers') {
    return locale === 'de' ? 'Angebote' : 'Offers';
  }

  if (card.decision.actionType === 'reply_required') {
    return locale === 'de' ? 'Rückmeldungen' : 'Replies';
  }

  if (card.decision.actionType === 'confirm_contract') {
    return locale === 'de' ? 'Vertrag' : 'Contract';
  }

  if (card.decision.actionType === 'confirm_completion') {
    return locale === 'de' ? 'Abschluss' : 'Completion';
  }

  if (card.decision.actionType === 'review_completion') {
    return locale === 'de' ? 'Bewertung' : 'Review';
  }

  return locale === 'de' ? 'Aktueller Stand' : 'Current status';
}

function resolveInsights(args: {
  card: WorkspaceMyRequestCardDto;
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
      tone:
        card.decision.actionPriorityLevel === 'high'
          ? 'warning'
          : 'info',
    });
  }

  if (activityDescription && activityDescription !== decisionDescription) {
    items.push({
      key: 'activity',
      title: locale === 'de' ? 'Status' : 'Status',
      description: activityDescription,
      tone: card.activity?.tone ?? 'neutral',
    });
  }

  return items.slice(0, 2);
}

export function buildPrivateRequestCardChrome(args: {
  card: WorkspaceMyRequestCardDto;
  locale: Locale;
}): PrivateRequestCardChrome {
  const { card, locale } = args;
  const primaryAction = resolveWorkspaceRequestPrimaryCardAction(card);

  return {
    priorityLabel: resolvePriorityLabel(locale, card),
    priorityTone: card.decision.actionPriorityLevel,
    contextPills: resolveContextPills(),
    signalPills: resolveSignalPills(card),
    insights: resolveInsights({ card, locale }),
    primaryAction,
    secondaryAction: resolveWorkspaceRequestSecondaryCardAction(card, primaryAction),
  };
}
