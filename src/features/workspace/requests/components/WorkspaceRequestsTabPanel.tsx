'use client';

import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { WorkspaceContentPanelsProps } from '../workspaceContentPanels.types';

type Props = Pick<WorkspaceContentPanelsProps, 't' | 'myRequestsState' | 'myRequestsListProps'>;

export function WorkspaceRequestsTabPanel({ t, myRequestsState, myRequestsListProps }: Props) {
  return (
    <WorkspaceContentState
      isLoading={myRequestsState.isLoading}
      isEmpty={myRequestsState.isEmpty}
      emptyTitle={t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyTitle)}
      emptyHint={t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyHint)}
      emptyCtaLabel={t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyCta)}
      emptyCtaHref={DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF}
    >
      <RequestsList {...myRequestsListProps} />
    </WorkspaceContentState>
  );
}
