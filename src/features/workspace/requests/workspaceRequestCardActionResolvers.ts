'use client';

import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';

type CardAction = WorkspaceMyRequestCardDto['status']['actions'][number];

export type WorkspaceRequestCardAction = CardAction | {
  key: string;
  kind: 'link';
  tone: 'primary' | 'secondary';
  icon: 'briefcase';
  label: string;
  href: string;
  requestId: string | null;
};

function normalizeCardLinkHref(args: {
  key: string;
  href?: string | null;
  card: WorkspaceMyRequestCardDto;
}) {
  const { key, href, card } = args;
  if (key === 'edit-request' && card.requestPreview.href) {
    return card.requestPreview.href;
  }
  return href ?? '';
}

function isGenericChatHref(href?: string | null) {
  if (!href) return false;
  return /^\/chat(?:[/?#]|$)/.test(href);
}

export function normalizeWorkspaceRequestCardAction(
  action: WorkspaceRequestCardAction,
  card: WorkspaceMyRequestCardDto,
): WorkspaceRequestCardAction {
  if (action.kind !== 'link') {
    return action;
  }

  return {
    ...action,
    href: normalizeCardLinkHref({
      key: action.key,
      href: action.href,
      card,
    }),
    requestId: action.requestId ?? card.requestId,
  };
}

function normalizeQuickActions(card: WorkspaceMyRequestCardDto): WorkspaceRequestCardAction[] {
  return card.quickActions
    .filter(
      (action): action is WorkspaceMyRequestCardDto['quickActions'][number] & { href: string } =>
        Boolean(action.href) && !isGenericChatHref(action.href),
    )
    .map((action) =>
      normalizeWorkspaceRequestCardAction(
        {
          key: `quick:${action.key}`,
          kind: 'link',
          tone: action.tone === 'primary' ? 'primary' : 'secondary',
          icon: 'briefcase',
          label: action.label,
          href: action.href,
          requestId: card.requestId,
        },
        card,
      ));
}

export function isSameWorkspaceRequestCardAction(
  left: WorkspaceRequestCardAction | null | undefined,
  right: WorkspaceRequestCardAction | null | undefined,
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

export function resolveWorkspaceRequestPrimaryCardAction(card: WorkspaceMyRequestCardDto): WorkspaceRequestCardAction | null {
  if (card.primaryAction) {
    return normalizeWorkspaceRequestCardAction(card.primaryAction, card);
  }

  const statusPrimary = card.status.actions.find(
    (action) =>
      action.tone === 'primary'
      || (action.kind === 'link' && action.key === 'open')
      || action.kind === 'open_chat',
  );
  if (statusPrimary) return normalizeWorkspaceRequestCardAction(statusPrimary, card);

  const quickPrimary = normalizeQuickActions(card).find((action) => action.tone === 'primary');
  if (quickPrimary) return quickPrimary;

  return normalizeQuickActions(card)[0] ?? null;
}

export function resolveWorkspaceRequestSecondaryCardAction(
  card: WorkspaceMyRequestCardDto,
  primaryAction: WorkspaceRequestCardAction | null,
): WorkspaceRequestCardAction | null {
  if (card.secondaryAction && !isSameWorkspaceRequestCardAction(card.secondaryAction, primaryAction)) {
    return normalizeWorkspaceRequestCardAction(card.secondaryAction, card);
  }

  const statusSecondary = card.status.actions.find((action) => {
    if (action.tone === 'danger') return false;
    if (isSameWorkspaceRequestCardAction(action, primaryAction)) return false;
    return action.kind === 'open_chat'
      || action.key === 'open'
      || action.key === 'contract'
      || action.key === 'review'
      || action.key === 'edit-request'
      || action.key === 'edit-offer'
      || action.key === 'duplicate-request';
  });

  if (statusSecondary) return normalizeWorkspaceRequestCardAction(statusSecondary, card);

  return normalizeQuickActions(card).find((action) => !isSameWorkspaceRequestCardAction(action, primaryAction)) ?? null;
}
