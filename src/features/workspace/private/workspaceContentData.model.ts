'use client';

import type { useWorkspaceContractRequestsData, useWorkspaceDerived } from '@/features/workspace/requests';
import type { useWorkspaceCards } from '@/features/workspace/private/useWorkspaceCards';

type WorkspaceDerivedResult = ReturnType<typeof useWorkspaceDerived>;
type ContractRequestsDataResult = ReturnType<typeof useWorkspaceContractRequestsData>;
type WorkspaceCardsResult = ReturnType<typeof useWorkspaceCards>;

type BuildWorkspaceContentDataResultArgs = {
  derived: Pick<
    WorkspaceDerivedResult,
    | 'showWorkspaceHeader'
    | 'showWorkspaceHeading'
    | 'primaryAction'
    | 'statusFilters'
    | 'filteredMyRequests'
    | 'filteredMyOffers'
    | 'myOfferRequests'
    | 'filteredContracts'
    | 'hasFavoriteRequests'
    | 'hasFavoriteProviders'
    | 'resolvedFavoritesView'
    | 'favoritesItems'
    | 'isFavoritesLoading'
  >;
  contract: Pick<
    ContractRequestsDataResult,
    | 'contractRequests'
    | 'contractOffersByRequest'
  >;
  cards: Pick<WorkspaceCardsResult, 'favoriteProviderCards'>;
};

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

export function buildWorkspaceViewModelPatch({
  derived,
  contract,
  cards,
}: BuildWorkspaceContentDataResultArgs): WorkspaceViewModelPatch {
  return {
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
  };
}

export function buildWorkspaceContentDataResult(args: BuildWorkspaceContentDataResultArgs) {
  return {
    primaryAction: args.derived.primaryAction,
    viewModelPatch: buildWorkspaceViewModelPatch(args),
  };
}
