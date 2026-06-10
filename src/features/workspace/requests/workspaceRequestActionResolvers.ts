'use client';

import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';

type RequestCardAction = WorkspaceMyRequestCardDto['status']['actions'][number];

export function resolveWorkspaceRequestChatAction(
  card: Pick<WorkspaceMyRequestCardDto, 'status' | 'primaryAction' | 'secondaryAction'>,
):
  | RequestCardAction
  | NonNullable<WorkspaceMyRequestCardDto['primaryAction']>
  | NonNullable<WorkspaceMyRequestCardDto['secondaryAction']>
  | null {
  return (
    card.status.actions.find(
      (action) => action.kind === 'open_chat' && Boolean(action.chatInput),
    ) ??
    (card.secondaryAction?.kind === 'open_chat' ? card.secondaryAction : null) ??
    (card.primaryAction?.kind === 'open_chat' ? card.primaryAction : null)
  );
}

export function resolveWorkspaceRequestOfferAction(
  card: Pick<WorkspaceMyRequestCardDto, 'status'>,
) {
  return (
    card.status.actions.find(
      (action) => action.kind === 'send_offer' || action.kind === 'edit_offer',
    ) ?? null
  );
}
