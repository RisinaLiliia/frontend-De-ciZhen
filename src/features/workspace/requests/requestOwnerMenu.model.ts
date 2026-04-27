'use client';

import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';

export type OwnerMenuAction = WorkspaceMyRequestCardDto['status']['actions'][number];

export function hasOwnerRequestManagementCapability(card: Pick<WorkspaceMyRequestCardDto, 'status'>) {
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
  const filteredActions = card.status.actions.filter(
    (action): action is OwnerMenuAction =>
      (action.kind === 'link' && action.key === 'edit-request' && Boolean(action.href))
      || action.kind === 'duplicate_request'
      || action.kind === 'share_request'
      || action.kind === 'archive_request'
      || action.kind === 'delete_request',
  );

  if (card.role !== 'customer') return filteredActions;

  const actionByKey = new Map(filteredActions.map((action) => [action.key, action]));

  return ['edit-request', 'duplicate-request', 'share-request', 'archive-request', 'delete-request']
    .map((key) => actionByKey.get(key))
    .filter((action): action is OwnerMenuAction => Boolean(action));
}
