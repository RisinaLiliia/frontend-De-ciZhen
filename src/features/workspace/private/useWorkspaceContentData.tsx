'use client';

import { useWorkspaceContractRequestsData, useWorkspaceDerived } from '@/features/workspace/requests';
import { useWorkspaceCards } from '@/features/workspace/private/useWorkspaceCards';

type WorkspaceDerivedArgs = Parameters<typeof useWorkspaceDerived>[0];
type ContractRequestsDataArgs = Omit<Parameters<typeof useWorkspaceContractRequestsData>[0], 'filteredContracts'>;
type WorkspaceCardsArgs = Parameters<typeof useWorkspaceCards>[0];
type WorkspaceDerivedResult = ReturnType<typeof useWorkspaceDerived>;
type ContractRequestsDataResult = ReturnType<typeof useWorkspaceContractRequestsData>;
type WorkspaceCardsResult = ReturnType<typeof useWorkspaceCards>;

export type WorkspaceViewModelPatch = {
  showWorkspaceHeader: WorkspaceDerivedResult['showWorkspaceHeader'];
  showWorkspaceHeading: WorkspaceDerivedResult['showWorkspaceHeading'];
  primaryAction: WorkspaceDerivedResult['primaryAction'];
  statusFilters: WorkspaceDerivedResult['statusFilters'];
  filteredMyRequests: WorkspaceDerivedResult['filteredMyRequests'];
  filteredMyOffers: WorkspaceDerivedResult['filteredMyOffers'];
  myOfferRequests: WorkspaceDerivedResult['myOfferRequests'];
  filteredContracts: WorkspaceDerivedResult['filteredContracts'];
  hasFavoriteRequests: WorkspaceDerivedResult['hasFavoriteRequests'];
  hasFavoriteProviders: WorkspaceDerivedResult['hasFavoriteProviders'];
  resolvedFavoritesView: WorkspaceDerivedResult['resolvedFavoritesView'];
  favoritesItems: WorkspaceDerivedResult['favoritesItems'];
  isFavoritesLoading: WorkspaceDerivedResult['isFavoritesLoading'];
  contractRequests: ContractRequestsDataResult['contractRequests'];
  contractOffersByRequest: ContractRequestsDataResult['contractOffersByRequest'];
  favoriteProviderCards: WorkspaceCardsResult['favoriteProviderCards'];
};

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

  const viewModelPatch = {
    showWorkspaceHeader: derived.showWorkspaceHeader,
    showWorkspaceHeading: derived.showWorkspaceHeading,
    primaryAction: derived.primaryAction,
    statusFilters: derived.statusFilters,
    filteredMyRequests: derived.filteredMyRequests,
    filteredMyOffers: derived.filteredMyOffers,
    myOfferRequests: derived.myOfferRequests,
    filteredContracts: derived.filteredContracts,
    hasFavoriteRequests: derived.hasFavoriteRequests,
    hasFavoriteProviders: derived.hasFavoriteProviders,
    resolvedFavoritesView: derived.resolvedFavoritesView,
    favoritesItems: derived.favoritesItems,
    isFavoritesLoading: derived.isFavoritesLoading,
    contractRequests: contract.contractRequests,
    contractOffersByRequest: contract.contractOffersByRequest,
    favoriteProviderCards: cards.favoriteProviderCards,
  } satisfies WorkspaceViewModelPatch;

  return {
    primaryAction: derived.primaryAction,
    viewModelPatch,
  };
}
