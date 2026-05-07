'use client';

import type { ComponentProps } from 'react';

import { RequestsExplorerRequestsContent } from '@/components/requests/RequestsExplorerRequestsContent';
import { RequestsPrivateView } from '@/features/workspace/requests/RequestsPrivateView';

export type RequestsWorkspaceBodyVariant =
  | {
    kind: 'public';
    props: ComponentProps<typeof RequestsExplorerRequestsContent>;
  }
  | {
    kind: 'private';
    props: ComponentProps<typeof RequestsPrivateView>;
  };

export function buildRequestsWorkspacePublicBody(
  props: ComponentProps<typeof RequestsExplorerRequestsContent>,
): RequestsWorkspaceBodyVariant {
  return {
    kind: 'public',
    props,
  };
}

export function buildRequestsWorkspacePrivateBody(
  props: ComponentProps<typeof RequestsPrivateView>,
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
  if (body.kind === 'public') {
    return <RequestsExplorerRequestsContent {...body.props} />;
  }

  return <RequestsPrivateView {...body.props} />;
}
