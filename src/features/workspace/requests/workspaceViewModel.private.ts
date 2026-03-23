'use client';

import type { ComponentProps } from 'react';

import type { WorkspaceContent } from '@/features/workspace/requests/WorkspaceContent';
import {
  buildWorkspaceFavoriteRequestsListProps,
  buildWorkspaceOfferRequestsListProps,
  buildWorkspaceOwnerRequestsListProps,
  buildWorkspaceState,
} from '@/features/workspace/requests/workspaceViewModel.helpers';
import { buildWorkspaceListContext } from '@/features/workspace/requests/workspaceViewModel.shared';
import type { PrivateInput } from '@/features/workspace/requests/workspaceViewModel.types';

export function buildWorkspacePrivateContentProps(
  params: PrivateInput,
): ComponentProps<typeof WorkspaceContent> {
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
    myRequestsListProps: buildWorkspaceOwnerRequestsListProps(listContext, {
      requests: filteredMyRequests,
      isLoading: isMyRequestsLoading,
      ownerRequestActions,
    }),
    myOffersState: buildWorkspaceState(isMyOffersLoading, filteredMyOffers.length === 0),
    myOffersListProps: buildWorkspaceOfferRequestsListProps(listContext, {
      requests: myOfferRequests,
      isLoading: isMyOffersLoading,
    }),
    contractsState: buildWorkspaceState(contractsLoading, filteredContracts.length === 0),
    contractsListProps: buildWorkspaceOfferRequestsListProps(listContext, {
      requests: contractRequests,
      isLoading: contractsLoading,
      offersByRequest: contractOffersByRequest,
    }),
    favoritesState: {
      ...buildWorkspaceState(isFavoritesLoading, favoritesItems.length === 0),
      hasFavoriteRequests,
      hasFavoriteProviders,
      resolvedView: resolvedFavoritesView,
    },
    onFavoritesViewChange: setFavoritesView,
    favoriteRequestsListProps: buildWorkspaceFavoriteRequestsListProps(listContext, {
      requests: favoriteRequests,
      isLoading: isFavoriteRequestsLoading,
    }),
    favoriteProvidersNode: favoriteProviderCards,
    reviewsState: { isLoading: isMyReviewsLoading, items: myReviews },
  };
}
