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
