'use client';

import * as React from 'react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import {
  mapContractStatusToFilter,
  mapOfferStatusToFilter,
  mapRequestStatusToFilter,
  type FavoritesView,
  type ReviewsView,
  type WorkspaceStatusFilter,
  type WorkspaceTab,
} from '@/features/workspace/requests/workspace.types';
import { getWorkspacePrimaryActionByTab, getWorkspaceStatusFilters } from '@/features/workspace/requests/workspace.content';

type Params = {
  t: (key: I18nKey) => string;
  activeStatusFilter: WorkspaceStatusFilter;
  activeWorkspaceTab: WorkspaceTab;
  activeFavoritesView: FavoritesView;
  activeReviewsView: ReviewsView;
  myRequests: RequestResponseDto[];
  myOffers: OfferDto[];
  myOfferRequestsById: Map<string, RequestResponseDto>;
  allMyContracts: ContractDto[];
  favoriteRequests: Array<{ id: string }>;
  favoriteProviders: Array<{ id: string }>;
  isFavoriteRequestsLoading: boolean;
  isFavoriteProvidersLoading: boolean;
  myReviews: ReviewDto[];
  localeTag: string;
};

export function useWorkspaceDerived({
  t,
  activeStatusFilter,
  activeWorkspaceTab,
  activeFavoritesView,
  activeReviewsView,
  myRequests,
  myOffers,
  myOfferRequestsById,
  allMyContracts,
  favoriteRequests,
  favoriteProviders,
  isFavoriteRequestsLoading,
  isFavoriteProvidersLoading,
  myReviews,
  localeTag,
}: Params) {
  const filteredMyRequests = React.useMemo(
    () =>
      myRequests.filter(
        (item) =>
          activeStatusFilter === 'all' || mapRequestStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, myRequests],
  );

  const filteredMyOffers = React.useMemo(
    () =>
      myOffers.filter(
        (item) => activeStatusFilter === 'all' || mapOfferStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, myOffers],
  );

  const myOfferRequests = React.useMemo(() => {
    const items: RequestResponseDto[] = [];
    const seen = new Set<string>();

    filteredMyOffers.forEach((offer) => {
      if (!offer.requestId || seen.has(offer.requestId)) return;
      seen.add(offer.requestId);
      const request = myOfferRequestsById.get(offer.requestId);
      if (request) items.push(request);
    });

    return items;
  }, [filteredMyOffers, myOfferRequestsById]);

  const filteredContracts = React.useMemo(
    () =>
      allMyContracts.filter(
        (item) =>
          activeStatusFilter === 'all' || mapContractStatusToFilter(item.status) === activeStatusFilter,
      ),
    [activeStatusFilter, allMyContracts],
  );

  const hasFavoriteRequests = favoriteRequests.length > 0;
  const hasFavoriteProviders = favoriteProviders.length > 0;
  const areFavoritesLoaded = !isFavoriteRequestsLoading && !isFavoriteProvidersLoading;

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

  const favoritesItems = resolvedFavoritesView === 'requests' ? favoriteRequests : favoriteProviders;
  const isFavoritesLoading =
    resolvedFavoritesView === 'requests' ? isFavoriteRequestsLoading : isFavoriteProvidersLoading;

  const resolvedReviews = React.useMemo(
    () =>
      myReviews.map((item) => {
        const role = item.targetRole ?? activeReviewsView;
        return {
          ...item,
          roleLabel:
            role === 'client'
              ? t(I18N_KEYS.requestsPage.reviewsTabClient)
              : t(I18N_KEYS.requestsPage.reviewsTabProvider),
          createdLabel: item.createdAt ? new Date(item.createdAt).toLocaleDateString(localeTag) : '—',
          author: item.authorName?.trim() || t(I18N_KEYS.homePublic.reviews),
          reviewText: item.text || item.comment || t(I18N_KEYS.common.emptyData),
        };
      }),
    [activeReviewsView, localeTag, myReviews, t],
  );

  const showWorkspaceHeader = activeWorkspaceTab !== 'favorites';
  const showWorkspaceHeading = showWorkspaceHeader;
  const statusFilters = React.useMemo(
    () =>
      activeWorkspaceTab === 'favorites' || activeWorkspaceTab === 'reviews'
        ? []
        : getWorkspaceStatusFilters(t),
    [activeWorkspaceTab, t],
  );

  const primaryAction = React.useMemo(() => {
    const actionsByTab = getWorkspacePrimaryActionByTab(t);
    return actionsByTab[activeWorkspaceTab] ?? actionsByTab['my-requests']!;
  }, [activeWorkspaceTab, t]);

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
    resolvedReviews,
    showWorkspaceHeader,
    showWorkspaceHeading,
    statusFilters,
    primaryAction,
  };
}
