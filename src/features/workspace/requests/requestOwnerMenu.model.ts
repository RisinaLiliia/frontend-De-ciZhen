'use client';

import type { WorkspaceMyRequestCardDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

export type OwnerMenuAction = WorkspaceMyRequestCardDto['status']['actions'][number];

export function resolveOwnerMenuActions(params: {
  card: WorkspaceMyRequestCardDto;
  locale: Locale;
}) {
  const { card, locale } = params;
  const filteredActions = card.status.actions.filter(
    (action): action is OwnerMenuAction =>
      (action.kind === 'link' && action.key === 'edit-request' && Boolean(action.href))
      || action.kind === 'duplicate_request'
      || action.kind === 'share_request'
      || action.kind === 'archive_request'
      || action.kind === 'delete_request',
  );

  if (card.role !== 'customer') return filteredActions;

  const requestId = card.requestId;
  const requestHref = card.requestPreview.href || `/requests/${requestId}`;
  const actionByKey = new Map(filteredActions.map((action) => [action.key, action]));

  if (!actionByKey.has('edit-request')) {
    actionByKey.set('edit-request', {
      key: 'edit-request',
      kind: 'link',
      tone: 'secondary',
      icon: 'edit',
      label: locale === 'de' ? 'Bearbeiten' : 'Edit',
      href: `/requests/${requestId}/edit`,
      requestId,
    });
  }

  if (!actionByKey.has('duplicate-request')) {
    actionByKey.set('duplicate-request', {
      key: 'duplicate-request',
      kind: 'duplicate_request',
      tone: 'secondary',
      icon: 'copy',
      label: locale === 'de' ? 'Duplizieren' : 'Duplicate',
      requestId,
    });
  }

  if (!actionByKey.has('share-request')) {
    actionByKey.set('share-request', {
      key: 'share-request',
      kind: 'share_request',
      tone: 'secondary',
      icon: 'share',
      label: locale === 'de' ? 'Teilen' : 'Share',
      href: requestHref,
      requestId,
    });
  }

  if (!actionByKey.has('archive-request')) {
    actionByKey.set('archive-request', {
      key: 'archive-request',
      kind: 'archive_request',
      tone: 'secondary',
      icon: 'archive',
      label: locale === 'de' ? 'Archivieren' : 'Archive',
      requestId,
    });
  }

  if (!actionByKey.has('delete-request')) {
    actionByKey.set('delete-request', {
      key: 'delete-request',
      kind: 'delete_request',
      tone: 'danger',
      icon: 'trash',
      label: locale === 'de' ? 'Löschen' : 'Delete',
      requestId,
    });
  }

  return [
    actionByKey.get('edit-request'),
    actionByKey.get('duplicate-request'),
    actionByKey.get('share-request'),
    actionByKey.get('archive-request'),
    actionByKey.get('delete-request'),
  ].filter((action): action is OwnerMenuAction => Boolean(action));
}
