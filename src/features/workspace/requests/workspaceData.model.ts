'use client';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';

type WorkspaceDataPlanArgs = {
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  shouldLoadPrivateData: boolean;
  activeWorkspaceTab: WorkspaceTab;
  hasAccessToken: boolean;
};

export type WorkspaceDataLoadPlan = {
  shouldLoadPublicRequests: boolean;
  shouldLoadPrivateOverview: boolean;
  shouldLoadMyRequests: boolean;
  shouldLoadMyOffers: boolean;
  shouldLoadMyContracts: boolean;
  shouldLoadFavoriteRequests: boolean;
  shouldLoadFavoriteProviders: boolean;
  shouldLoadOfferRequests: boolean;
  shouldLoadReviews: boolean;
  shouldLoadProviders: boolean;
};

export function buildWorkspaceOfferRequestIds(myOffers: OfferDto[]) {
  return Array.from(new Set(myOffers.map((offer) => offer.requestId).filter(Boolean)));
}

export function resolveWorkspaceDataPlan({
  isAuthed,
  isWorkspaceAuthed,
  isWorkspacePublicSection,
  shouldLoadPrivateData,
  activeWorkspaceTab,
  hasAccessToken,
}: WorkspaceDataPlanArgs): WorkspaceDataLoadPlan {
  const shouldLoadPublicRequests = isWorkspacePublicSection || !isWorkspaceAuthed;
  const shouldLoadPrivateOverview = isWorkspaceAuthed && shouldLoadPrivateData && hasAccessToken;
  const shouldLoadMyRequests =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'my-requests';
  const shouldLoadMyOffers =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'my-offers';
  const shouldLoadMyContracts =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'completed-jobs';
  const shouldLoadFavoriteRequests =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'favorites';
  const shouldLoadFavoriteProviders = isAuthed && shouldLoadPrivateData;
  const shouldLoadOfferRequests = isWorkspaceAuthed && activeWorkspaceTab === 'my-offers';
  const shouldLoadReviews =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'reviews';
  const shouldLoadProviders = !isWorkspacePublicSection && shouldLoadPrivateData;

  return {
    shouldLoadPublicRequests,
    shouldLoadPrivateOverview,
    shouldLoadMyRequests,
    shouldLoadMyOffers,
    shouldLoadMyContracts,
    shouldLoadFavoriteRequests,
    shouldLoadFavoriteProviders,
    shouldLoadOfferRequests,
    shouldLoadReviews,
    shouldLoadProviders,
  };
}
