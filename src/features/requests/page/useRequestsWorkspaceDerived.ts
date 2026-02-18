'use client';

import * as React from 'react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ContractDto } from '@/lib/api/dto/contracts';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import {
  mapContractStatusToFilter,
  mapOfferStatusToFilter,
  mapRequestStatusToFilter,
  type FavoritesView,
  type ReviewsView,
  type WorkspaceStatusFilter,
  type WorkspaceTab,
} from '@/features/requests/page/workspace';

type Params = {
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

export function useRequestsWorkspaceDerived({
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
    const fallbackDate = new Date().toISOString();
    const items: RequestResponseDto[] = [];
    const seen = new Set<string>();

    filteredMyOffers.forEach((offer) => {
      if (!offer.requestId || seen.has(offer.requestId)) return;
      seen.add(offer.requestId);
      const request = myOfferRequestsById.get(offer.requestId);
      if (request) {
        items.push(request);
        return;
      }

      const requestStatus = offer.requestStatus ?? 'published';
      items.push({
        id: offer.requestId,
        serviceKey: offer.requestServiceKey || 'service',
        cityId: offer.requestCityId || 'city',
        cityName: offer.requestCityId || null,
        categoryKey: null,
        categoryName: null,
        subcategoryName: offer.requestServiceKey || null,
        propertyType: 'apartment',
        area: 0,
        price: typeof offer.amount === 'number' ? offer.amount : null,
        preferredDate: offer.requestPreferredDate || offer.updatedAt || offer.createdAt || fallbackDate,
        isRecurring: false,
        title: offer.requestServiceKey || null,
        description: offer.message || null,
        photos: null,
        imageUrl: null,
        tags: null,
        clientId: offer.clientUserId,
        clientName: null,
        clientAvatarUrl: null,
        clientCity: null,
        clientRatingAvg: null,
        clientRatingCount: null,
        clientIsOnline: null,
        clientLastSeenAt: null,
        status:
          requestStatus === 'matched' ||
          requestStatus === 'closed' ||
          requestStatus === 'cancelled' ||
          requestStatus === 'draft' ||
          requestStatus === 'paused'
            ? requestStatus
            : 'published',
        createdAt: offer.createdAt,
      });
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
          roleLabel: role === 'client' ? 'Als Kunde' : 'Als Anbieter',
          createdLabel: item.createdAt ? new Date(item.createdAt).toLocaleDateString(localeTag) : '—',
          author: item.authorName?.trim() || 'Bewertung',
          reviewText: item.text || item.comment || 'Kein Kommentar',
        };
      }),
    [activeReviewsView, localeTag, myReviews],
  );

  const showWorkspaceHeader = activeWorkspaceTab !== 'favorites';
  const showWorkspaceHeading = showWorkspaceHeader && activeWorkspaceTab !== 'new-orders';
  const statusFilters = React.useMemo(
    () =>
      activeWorkspaceTab === 'new-orders' || activeWorkspaceTab === 'favorites' || activeWorkspaceTab === 'reviews'
        ? []
        : [
            { key: 'all' as const, label: 'Alle' },
            { key: 'open' as const, label: 'Offen' },
            { key: 'in_progress' as const, label: 'In Arbeit' },
            { key: 'completed' as const, label: 'Abgeschlossen' },
          ],
    [activeWorkspaceTab],
  );

  const primaryAction = React.useMemo(() => {
    if (activeWorkspaceTab === 'my-requests') {
      return { label: 'Neue Anfrage erstellen', href: '/request/create' };
    }
    if (activeWorkspaceTab === 'my-offers') {
      return { label: 'Neue Auftraege finden', href: '/orders?tab=new-orders' };
    }
    if (activeWorkspaceTab === 'completed-jobs') {
      return { label: 'Aktive Auftraege', href: '/orders?tab=my-offers&status=in_progress' };
    }
    if (activeWorkspaceTab === 'favorites') {
      return { label: 'Neue Favoriten', href: '/orders?tab=new-orders' };
    }
    if (activeWorkspaceTab === 'reviews') {
      return { label: 'Meine Auftraege', href: '/orders?tab=my-offers' };
    }
    return { label: 'Neue Anfrage erstellen', href: '/request/create' };
  }, [activeWorkspaceTab]);

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
