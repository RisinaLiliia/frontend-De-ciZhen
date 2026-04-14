'use client';

import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

type CardAction = WorkspaceMyRequestCardDto['status']['actions'][number];

export type PrivateRequestCardAction = CardAction | {
  key: string;
  kind: 'link';
  tone: 'primary' | 'secondary';
  icon: 'briefcase';
  label: string;
  href: string;
  requestId: string | null;
};

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

function normalizeQuickActions(card: WorkspaceMyRequestCardDto): PrivateRequestCardAction[] {
  return card.quickActions
    .filter((action): action is WorkspaceMyRequestCardDto['quickActions'][number] & { href: string } => Boolean(action.href))
    .map((action) => ({
      key: `quick:${action.key}`,
      kind: 'link',
      tone: action.tone === 'primary' ? 'primary' : 'secondary',
      icon: 'briefcase',
      label: action.label,
      href: action.href,
      requestId: card.requestId,
    }));
}

function isSameAction(
  left: PrivateRequestCardAction | null | undefined,
  right: PrivateRequestCardAction | null | undefined,
) {
  if (!left || !right) return false;
  const sameHref =
    left.kind === 'link'
    && right.kind === 'link'
    && (left.href ?? null) === (right.href ?? null)
    && (left.requestId ?? null) === (right.requestId ?? null);
  const sameOffer =
    left.kind === right.kind
    &&
    ('offerId' in left ? left.offerId ?? null : null) !== null
    && ('offerId' in left ? left.offerId ?? null : null) === ('offerId' in right ? right.offerId ?? null : null);
  const sameKindAndKey = left.kind === right.kind && left.key === right.key;

  return sameHref || sameOffer || sameKindAndKey;
}

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

function resolveContextPills(card: WorkspaceMyRequestCardDto) {
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

function resolvePrimaryAction(card: WorkspaceMyRequestCardDto): PrivateRequestCardAction | null {
  if (card.decision.primaryAction) return card.decision.primaryAction;

  const statusPrimary = card.status.actions.find(
    (action) => action.tone === 'primary' || action.key === 'open' || action.key === 'chat',
  );
  if (statusPrimary) return statusPrimary;

  const quickPrimary = normalizeQuickActions(card).find((action) => action.tone === 'primary');
  if (quickPrimary) return quickPrimary;

  return normalizeQuickActions(card)[0] ?? null;
}

function resolveSecondaryAction(
  card: WorkspaceMyRequestCardDto,
  primaryAction: PrivateRequestCardAction | null,
): PrivateRequestCardAction | null {
  const statusSecondary = card.status.actions.find((action) => {
    if (action.tone === 'danger') return false;
    if (isSameAction(action, primaryAction)) return false;
    return action.key === 'chat' || action.key === 'open' || action.key === 'contract' || action.key === 'edit-request' || action.key === 'edit-offer';
  });

  if (statusSecondary) return statusSecondary;

  return normalizeQuickActions(card).find((action) => !isSameAction(action, primaryAction)) ?? null;
}

export function buildPrivateRequestCardChrome(args: {
  card: WorkspaceMyRequestCardDto;
  locale: Locale;
}): PrivateRequestCardChrome {
  const { card, locale } = args;
  const primaryAction = resolvePrimaryAction(card);

  return {
    priorityLabel: resolvePriorityLabel(locale, card),
    priorityTone: card.decision.actionPriorityLevel,
    contextPills: resolveContextPills(card),
    signalPills: resolveSignalPills(card),
    insights: resolveInsights({ card, locale }),
    primaryAction,
    secondaryAction: resolveSecondaryAction(card, primaryAction),
  };
}
