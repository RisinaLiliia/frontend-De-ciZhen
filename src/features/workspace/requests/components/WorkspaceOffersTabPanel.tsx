'use client';

import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { WorkspaceContentPanelsProps } from '../workspaceContentPanels.types';

type Props = Pick<
  WorkspaceContentPanelsProps,
  't' | 'myOffersState' | 'myOffersListProps'
>;

export function WorkspaceOffersTabPanel({
  t,
  myOffersState,
  myOffersListProps,
}: Props) {
  return (
    <div className="stack-sm">
      <WorkspaceContentState
        isLoading={myOffersState.isLoading}
        isEmpty={myOffersState.isEmpty}
        emptyTitle={t(I18N_KEYS.requestsPage.workspaceMyOffersEmptyTitle)}
        emptyHint={t(I18N_KEYS.requestsPage.workspaceMyOffersEmptyHint)}
        emptyCtaLabel={t(I18N_KEYS.requestsPage.workspaceMyOffersEmptyCta)}
        emptyCtaHref="/workspace?section=requests"
      >
        <RequestsList {...myOffersListProps} />
      </WorkspaceContentState>
    </div>
  );
}
