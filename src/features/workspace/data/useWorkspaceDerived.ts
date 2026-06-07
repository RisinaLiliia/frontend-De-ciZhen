'use client';

import * as React from 'react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { I18nKey } from '@/lib/i18n/keys';
import {
  mapContractStatusToFilter,
  mapOfferStatusToFilter,
  mapRequestStatusToFilter,
  type FavoritesView,
  type WorkspaceStatusFilter,
  type WorkspaceTab,
} from '@/features/workspace/state';
import { getWorkspacePrimaryActionByTab, getWorkspaceStatusFilters } from '@/features/workspace/requests/requests.content';

type Params = {
  enabled?: boolean;
  t: (key: I18nKey) => string;
  activeStatusFilter: WorkspaceStatusFilter;
  activeWorkspaceTab: WorkspaceTab;
  activeFavoritesView: FavoritesView;
  myRequests: RequestResponseDto[];
  myOffers: OfferDto[];
  myOfferRequestsById: Map<string, RequestResponseDto>;
  allMyContracts: ContractDto[];
  favoriteRequests: Array<{ id: string }>;
  favoriteProviders: Array<{ id: string }>;
  isFavoriteRequestsLoading: boolean;
  isFavoriteProvidersLoading: boolean;
};

export function useWorkspaceDerived({
  enabled = true,
  t,
  activeStatusFilter,
  activeWorkspaceTab,
  activeFavoritesView,
  myRequests,
  myOffers,
  myOfferRequestsById,
  allMyContracts,
  favoriteRequests,
  favoriteProviders,
  isFavoriteRequestsLoading,
  isFavoriteProvidersLoading,
}: Params) {
  const showWorkspaceHeader = activeWorkspaceTab !== 'favorites' && activeWorkspaceTab !== 'profile';
  const showWorkspaceHeading = showWorkspaceHeader;
  const statusFilters = React.useMemo(
    () =>
      activeWorkspaceTab === 'favorites' || activeWorkspaceTab === 'reviews' || activeWorkspaceTab === 'profile'
        ? []
        : getWorkspaceStatusFilters(t),
    [activeWorkspaceTab, t],
  );
  const primaryAction = React.useMemo(() => {
    const actionsByTab = getWorkspacePrimaryActionByTab(t);
    return actionsByTab[activeWorkspaceTab] ?? actionsByTab['my-requests']!;
  }, [activeWorkspaceTab, t]);
  const shouldBuildMyRequests = enabled && activeWorkspaceTab === 'my-requests';
  const shouldBuildMyOffers = enabled && activeWorkspaceTab === 'my-offers';
  const shouldBuildContracts = enabled && activeWorkspaceTab === 'completed-jobs';
  const shouldBuildFavorites = enabled && activeWorkspaceTab === 'favorites';

  const filteredMyRequests = React.useMemo(
    () => !shouldBuildMyRequests
      ? []
      :
      myRequests.filter(
        (item) =>
          activeStatusFilter === 'all' || mapRequestStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, myRequests, shouldBuildMyRequests],
  );

  const filteredMyOffers = React.useMemo(
    () => !shouldBuildMyOffers
      ? []
      :
      myOffers.filter(
        (item) => activeStatusFilter === 'all' || mapOfferStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, myOffers, shouldBuildMyOffers],
  );

  const myOfferRequests = React.useMemo(() => {
    if (!shouldBuildMyOffers) {
      return [];
    }

    const items: RequestResponseDto[] = [];
    const seen = new Set<string>();

    filteredMyOffers.forEach((offer) => {
      if (!offer.requestId || seen.has(offer.requestId)) return;
      seen.add(offer.requestId);
      const request = myOfferRequestsById.get(offer.requestId);
      if (request) items.push(request);
    });

    return items;
  }, [filteredMyOffers, myOfferRequestsById, shouldBuildMyOffers]);

  const filteredContracts = React.useMemo(
    () => !shouldBuildContracts
      ? []
      :
      allMyContracts.filter(
        (item) =>
          activeStatusFilter === 'all' || mapContractStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, allMyContracts, shouldBuildContracts],
  );

  const hasFavoriteRequests = shouldBuildFavorites && favoriteRequests.length > 0;
  const hasFavoriteProviders = shouldBuildFavorites && favoriteProviders.length > 0;
  const areFavoritesLoaded = shouldBuildFavorites && !isFavoriteRequestsLoading && !isFavoriteProvidersLoading;

  const resolvedFavoritesView = React.useMemo<FavoritesView>(() => {
    if (
      areFavoritesLoaded &&
      activeFavoritesView === 'requests' &&
      !hasFavoriteRequests &&
      hasFavoriteProviders
    ) {
      return 'providers';
    }
    return activeFavoritesView;
  }, [activeFavoritesView, areFavoritesLoaded, hasFavoriteProviders, hasFavoriteRequests]);

  const favoritesItems = !shouldBuildFavorites
    ? []
    : resolvedFavoritesView === 'requests'
      ? favoriteRequests
      : favoriteProviders;
  const isFavoritesLoading =
    shouldBuildFavorites
      ? (resolvedFavoritesView === 'requests' ? isFavoriteRequestsLoading : isFavoriteProvidersLoading)
      : false;

  return {
    filteredMyRequests,
    filteredMyOffers,
    myOfferRequests,
    filteredContracts,
    hasFavoriteRequests,
    hasFavoriteProviders,
    resolvedFavoritesView,
    favoritesItems,
    isFavoritesLoading,
    showWorkspaceHeader,
    showWorkspaceHeading,
    statusFilters,
    primaryAction,
  };
}
