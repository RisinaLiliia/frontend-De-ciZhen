'use client';

import { useWorkspaceContractRequestsData } from '@/features/workspace/contracts/useWorkspaceContractRequestsData';
import { useWorkspaceDerived } from '@/features/workspace/data/useWorkspaceDerived';
import { useWorkspaceCards } from '@/features/workspace/private/useWorkspaceCards';
import { buildWorkspaceContentDataResult } from '@/features/workspace/private/workspaceContentData.model';

type WorkspaceDerivedArgs = Parameters<typeof useWorkspaceDerived>[0];
type ContractRequestsDataArgs = Omit<Parameters<typeof useWorkspaceContractRequestsData>[0], 'filteredContracts'>;
type WorkspaceCardsArgs = Parameters<typeof useWorkspaceCards>[0];

type Args = {
  enabled?: boolean;
  derivedArgs: WorkspaceDerivedArgs;
  contractArgs: ContractRequestsDataArgs;
  cardsArgs: WorkspaceCardsArgs;
  contractRequestsEnabled?: boolean;
  favoriteProviderCardsEnabled?: boolean;
};

export function useWorkspaceContentData({
  enabled = true,
  derivedArgs,
  contractArgs,
  cardsArgs,
  contractRequestsEnabled = true,
  favoriteProviderCardsEnabled = true,
}: Args) {
  const derived = useWorkspaceDerived({
    ...derivedArgs,
    enabled,
  });
  const contract = useWorkspaceContractRequestsData({
    enabled,
    ...contractArgs,
    filteredContracts: enabled && contractRequestsEnabled ? derived.filteredContracts : [],
  });
  const cards = useWorkspaceCards({
    ...cardsArgs,
    enabled: enabled && favoriteProviderCardsEnabled,
  });

  return buildWorkspaceContentDataResult({
    derived,
    contract,
    cards,
  });
}
