'use client';

import {
  buildEmptyWorkspaceListProps,
  buildWorkspaceFavoriteRequestsListProps,
  buildWorkspaceOfferRequestsListProps,
  buildWorkspaceOwnerRequestsListProps,
  buildWorkspaceState,
} from '@/features/workspace/presentation/workspaceViewModel.helpers';
import { buildWorkspaceListContext } from '@/features/workspace/presentation/workspaceViewModel.shared';
import type { PrivateInput } from '@/features/workspace/presentation/workspaceViewModel.types';
import type { WorkspaceContentProps } from '@/features/workspace/requests/workspaceContent.types';

export function buildWorkspacePrivateContentProps(params: PrivateInput): WorkspaceContentProps {
  const {
    t,
    isWorkspaceAuthed,
    activeWorkspaceTab,
    showWorkspaceHeader,
    showWorkspaceHeading,
    primaryAction,
    onPrimaryActionClick,
    statusFilters,
    activeStatusFilter,
    setStatusFilter,
    isMyRequestsLoading,
    filteredMyRequests,
    ownerRequestActions,
    isMyOffersLoading,
    filteredMyOffers,
    myOfferRequests,
    isProviderContractsLoading,
    isClientContractsLoading,
    filteredContracts,
    contractRequests,
    contractOffersByRequest,
    isFavoritesLoading,
    favoritesItems,
    hasFavoriteRequests,
    hasFavoriteProviders,
    resolvedFavoritesView,
    setFavoritesView,
    favoriteRequests,
    isFavoriteRequestsLoading,
    favoriteProviderCards,
    isMyReviewsLoading,
    myReviews,
  } = params;
  const listContext = buildWorkspaceListContext(params);
  const contractsLoading = isProviderContractsLoading || isClientContractsLoading;
  const emptyListProps = buildEmptyWorkspaceListProps(listContext);
  const myRequestsListProps =
    activeWorkspaceTab === 'my-requests'
      ? buildWorkspaceOwnerRequestsListProps(listContext, {
          requests: filteredMyRequests,
          isLoading: isMyRequestsLoading,
          ownerRequestActions,
        })
      : emptyListProps;
  const myOffersListProps =
    activeWorkspaceTab === 'my-offers'
      ? buildWorkspaceOfferRequestsListProps(listContext, {
          requests: myOfferRequests,
          isLoading: isMyOffersLoading,
        })
      : emptyListProps;
  const contractsListProps =
    activeWorkspaceTab === 'completed-jobs'
      ? buildWorkspaceOfferRequestsListProps(listContext, {
          requests: contractRequests,
          isLoading: contractsLoading,
          offersByRequest: contractOffersByRequest,
        })
      : emptyListProps;
  const favoriteRequestsListProps =
    activeWorkspaceTab === 'favorites'
      ? buildWorkspaceFavoriteRequestsListProps(listContext, {
          requests: favoriteRequests,
          isLoading: isFavoriteRequestsLoading,
        })
      : emptyListProps;

  return {
    t,
    isWorkspaceAuthed,
    activeWorkspaceTab,
    showWorkspaceHeader,
    showWorkspaceHeading,
    primaryAction,
    onPrimaryActionClick,
    statusFilters,
    activeStatusFilter,
    setStatusFilter,
    myRequestsState: buildWorkspaceState(isMyRequestsLoading, filteredMyRequests.length === 0),
    myRequestsListProps,
    myOffersState: buildWorkspaceState(isMyOffersLoading, filteredMyOffers.length === 0),
    myOffersListProps,
    contractsState: buildWorkspaceState(contractsLoading, filteredContracts.length === 0),
    contractsListProps,
    favoritesState: {
      ...buildWorkspaceState(isFavoritesLoading, favoritesItems.length === 0),
      hasFavoriteRequests,
      hasFavoriteProviders,
      resolvedView: resolvedFavoritesView,
    },
    onFavoritesViewChange: setFavoritesView,
    favoriteRequestsListProps,
    favoriteProvidersNode: favoriteProviderCards,
    reviewsState: { isLoading: isMyReviewsLoading, items: myReviews },
  };
}
