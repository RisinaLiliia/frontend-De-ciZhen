'use client';

import {
  buildWorkspaceOwnRequestDetailHref,
  buildWorkspaceRequestEditHref,
  buildWorkspaceRequestOverlayHref,
} from '@/features/workspace/requests/workspaceRequestRoute.model';
import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';

type CardAction = WorkspaceMyRequestCardDto['status']['actions'][number];

export type WorkspaceRequestCardAction =
  | CardAction
  | {
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
  requestId?: string | null;
}) {
  const { key, href, card, requestId } = args;
  const resolvedRequestId = requestId ?? card.requestId;

  if (!resolvedRequestId) {
    return href ?? '';
  }

  if (key === 'edit-request') {
    return buildWorkspaceRequestEditHref({
      currentSearch: '',
      requestId: resolvedRequestId,
    });
  }

  if (key === 'contract') {
    return buildWorkspaceRequestOverlayHref({
      currentSearch: '',
      requestId: resolvedRequestId,
      scope: 'my',
      intent: 'contract',
      panel: 'detail',
    });
  }

  if (key === 'review') {
    return buildWorkspaceRequestOverlayHref({
      currentSearch: '',
      requestId: resolvedRequestId,
      scope: 'my',
      intent: 'review',
      panel: 'detail',
    });
  }

  return buildWorkspaceOwnRequestDetailHref({
    currentSearch: '',
    requestId: resolvedRequestId,
  });
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
      requestId: action.requestId,
    }),
    requestId: action.requestId ?? card.requestId,
  };
}
