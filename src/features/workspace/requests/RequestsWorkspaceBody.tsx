'use client';

import type { ComponentProps } from 'react';

import { WorkspaceRequestsView } from '@/features/workspace/requests/RequestsPrivateView';

export type RequestsWorkspaceBodyVariant =
  | {
    kind: 'public';
    props: ComponentProps<typeof WorkspaceRequestsView>;
  }
  | {
    kind: 'private';
    props: ComponentProps<typeof WorkspaceRequestsView>;
  };

export function buildRequestsWorkspacePublicBody(
  props: ComponentProps<typeof WorkspaceRequestsView>,
): RequestsWorkspaceBodyVariant {
  return {
    kind: 'public',
    props,
  };
}

export function buildRequestsWorkspacePrivateBody(
  props: ComponentProps<typeof WorkspaceRequestsView>,
): RequestsWorkspaceBodyVariant {
  return {
    kind: 'private',
    props,
  };
}

export function RequestsWorkspaceBody({
  body,
}: {
  body: RequestsWorkspaceBodyVariant;
}) {
  return <WorkspaceRequestsView {...body.props} />;
}
