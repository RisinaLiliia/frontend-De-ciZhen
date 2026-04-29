'use client';

import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';

export type OwnerMenuAction = WorkspaceMyRequestCardDto['status']['actions'][number];

export function hasOwnerRequestEditCapability(card: Pick<
  WorkspaceMyRequestCardDto,
  'role' | 'status' | 'canEdit' | 'capabilities'
>) {
  if (card.capabilities?.canEdit) {
    return true;
  }

  if (card.role === 'customer' && card.canEdit) {
    return true;
  }

  return card.status.actions.some((action) => action.key === 'edit-request');
}

export function hasOwnerRequestManagementCapability(card: Pick<
  WorkspaceMyRequestCardDto,
  'role' | 'status' | 'canEdit' | 'canDelete' | 'canDuplicate' | 'canRestore' | 'capabilities'
>) {
  if (card.capabilities?.canManage) {
    return true;
  }

  if (card.role === 'customer' && (card.canEdit || card.canDelete || card.canDuplicate || card.canRestore)) {
    return true;
  }

  return card.status.actions.some((action) =>
    action.key === 'edit-request'
    || action.kind === 'publish_request'
    || action.kind === 'unpublish_request'
    || action.kind === 'review_responses'
    || action.kind === 'duplicate_request'
    || action.kind === 'archive_request'
    || action.kind === 'delete_request');
}

export function resolveOwnerMenuActions(params: {
  card: WorkspaceMyRequestCardDto;
}) {
  const { card } = params;
  const sourceActions = card.menuActions && card.menuActions.length > 0
    ? card.menuActions
    : card.status.actions;

  return sourceActions.filter(
    (action): action is OwnerMenuAction =>
      (action.kind === 'link' && action.key === 'edit-request' && Boolean(action.href))
      || action.kind === 'duplicate_request'
      || action.kind === 'share_request'
      || action.kind === 'archive_request'
      || action.kind === 'delete_request',
  );
}
