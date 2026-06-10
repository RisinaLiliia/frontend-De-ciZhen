'use client';

import { RequestsView } from './RequestsView';
import type { WorkspaceRequestsSurfaceModel } from '@/features/workspace/requests/workspaceRequestsView.model';

export type RequestsWorkspaceBodyVariant =
  | {
      kind: 'public';
      surface: WorkspaceRequestsSurfaceModel;
    }
  | {
      kind: 'private';
      surface: WorkspaceRequestsSurfaceModel;
    };

export function buildRequestsWorkspacePublicBody(
  surface: WorkspaceRequestsSurfaceModel,
): RequestsWorkspaceBodyVariant {
  return {
    kind: 'public',
    surface,
  };
}

export function buildRequestsWorkspacePrivateBody(
  surface: WorkspaceRequestsSurfaceModel,
): RequestsWorkspaceBodyVariant {
  return {
    kind: 'private',
    surface,
  };
}

export function RequestsWorkspaceBody({ body }: { body: RequestsWorkspaceBodyVariant }) {
  return <RequestsView surface={body.surface} />;
}
