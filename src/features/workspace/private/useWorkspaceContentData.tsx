'use client';

import { useWorkspaceContractRequestsData, useWorkspaceDerived } from '@/features/workspace/requests';
import { useWorkspaceCards } from '@/features/workspace/private/useWorkspaceCards';
import { buildWorkspaceContentDataResult } from '@/features/workspace/private/workspaceContentData.model';

type WorkspaceDerivedArgs = Parameters<typeof useWorkspaceDerived>[0];
type ContractRequestsDataArgs = Omit<Parameters<typeof useWorkspaceContractRequestsData>[0], 'filteredContracts'>;
type WorkspaceCardsArgs = Parameters<typeof useWorkspaceCards>[0];

type Args = {
  derivedArgs: WorkspaceDerivedArgs;
  contractArgs: ContractRequestsDataArgs;
  cardsArgs: WorkspaceCardsArgs;
};

export function useWorkspaceContentData({ derivedArgs, contractArgs, cardsArgs }: Args) {
  const derived = useWorkspaceDerived(derivedArgs);
  const contract = useWorkspaceContractRequestsData({
    ...contractArgs,
    filteredContracts: derived.filteredContracts,
  });
  const cards = useWorkspaceCards(cardsArgs);

  return buildWorkspaceContentDataResult({
    derived,
    contract,
    cards,
  });
}
