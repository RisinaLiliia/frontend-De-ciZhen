'use client';

import { RequestsPrivateActionRail, WorkspaceRequestsView } from '@/features/workspace/requests/WorkspaceRequestsView';
import type { WorkspaceRequestsViewProps, WorkspaceRequestsViewVariant } from '@/features/workspace/requests/WorkspaceRequestsView';

export { RequestsPrivateActionRail, WorkspaceRequestsView };
export type { WorkspaceRequestsViewProps, WorkspaceRequestsViewVariant };

export function RequestsPrivateView(props: Omit<WorkspaceRequestsViewProps, 'variant'>) {
  return <WorkspaceRequestsView {...props} variant="private" />;
}
