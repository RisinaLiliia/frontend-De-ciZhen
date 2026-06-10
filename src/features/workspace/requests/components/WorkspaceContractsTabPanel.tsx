'use client';

import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { WorkspaceContentPanelsProps } from '../workspaceContentPanels.types';

type Props = Pick<WorkspaceContentPanelsProps, 't' | 'contractsState' | 'contractsListProps'>;

export function WorkspaceContractsTabPanel({ t, contractsState, contractsListProps }: Props) {
  return (
    <div className="stack-sm">
      <WorkspaceContentState
        isLoading={contractsState.isLoading}
        isEmpty={contractsState.isEmpty}
        emptyTitle={t(I18N_KEYS.requestsPage.workspaceContractsEmptyTitle)}
        emptyHint={t(I18N_KEYS.requestsPage.workspaceContractsEmptyHint)}
        emptyCtaLabel={t(I18N_KEYS.requestsPage.workspaceContractsEmptyCta)}
        emptyCtaHref="/workspace?section=requests&scope=my&period=90d&range=90d"
      >
        <RequestsList {...contractsListProps} />
      </WorkspaceContentState>
    </div>
  );
}
