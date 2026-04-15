'use client';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { WorkspaceRequestsScope } from '@/features/workspace/requests/workspaceRequestsScope.model';

type WorkspaceDataPlanArgs = {
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  shouldLoadPrivateData: boolean;
  activeWorkspaceTab: WorkspaceTab;
  requestsScope?: WorkspaceRequestsScope;
  activePublicSection?: 'requests' | 'providers' | 'stats' | 'reviews' | 'profile' | null;
  hasAccessToken: boolean;
};

export type WorkspaceDataLoadPlan = {
  shouldLoadPublicRequests: boolean;
  shouldLoadPrivateOverview: boolean;
  shouldLoadWorkspaceRequests: boolean;
  shouldLoadMyRequests: boolean;
  shouldLoadMyOffers: boolean;
  shouldLoadMyClientOffers: boolean;
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
  requestsScope = 'market',
  activePublicSection = null,
  hasAccessToken,
}: WorkspaceDataPlanArgs): WorkspaceDataLoadPlan {
  const shouldLoadUnifiedPrivateRequests =
    isWorkspaceAuthed &&
    shouldLoadPrivateData &&
    requestsScope === 'my' &&
    activePublicSection === 'requests';
  const shouldLoadPrivateOverviewRequests =
    isWorkspaceAuthed &&
    shouldLoadPrivateData &&
    activePublicSection === null;
  const shouldLoadPublicRequests =
    isWorkspacePublicSection ||
    !isWorkspaceAuthed ||
    shouldLoadPrivateOverviewRequests;
  const shouldLoadPrivateOverview = isWorkspaceAuthed && shouldLoadPrivateData && hasAccessToken;
  const shouldLoadWorkspaceRequests = shouldLoadUnifiedPrivateRequests;
  const shouldLoadMyRequests =
    !shouldLoadUnifiedPrivateRequests
    && isWorkspaceAuthed
    && shouldLoadPrivateData
    && activeWorkspaceTab === 'my-requests';
  const shouldLoadMyOffers =
    shouldLoadUnifiedPrivateRequests
    || (
      isWorkspaceAuthed
      && shouldLoadPrivateData
      && activeWorkspaceTab === 'my-offers'
    );
  const shouldLoadMyClientOffers = false;
  const shouldLoadMyContracts =
    !shouldLoadUnifiedPrivateRequests
    && isWorkspaceAuthed
    && shouldLoadPrivateData
    && activeWorkspaceTab === 'completed-jobs';
  const shouldLoadFavoriteRequests =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'favorites';
  const shouldLoadFavoriteProviders = isAuthed && shouldLoadPrivateData;
  const shouldLoadOfferRequests = shouldLoadMyOffers && activeWorkspaceTab === 'my-offers';
  const shouldLoadReviews =
    isWorkspaceAuthed && shouldLoadPrivateData && activeWorkspaceTab === 'reviews';
  const shouldLoadProviders = !isWorkspacePublicSection && shouldLoadPrivateData;

  return {
    shouldLoadPublicRequests,
    shouldLoadPrivateOverview,
    shouldLoadWorkspaceRequests,
    shouldLoadMyRequests,
    shouldLoadMyOffers,
    shouldLoadMyClientOffers,
    shouldLoadMyContracts,
    shouldLoadFavoriteRequests,
    shouldLoadFavoriteProviders,
    shouldLoadOfferRequests,
    shouldLoadReviews,
    shouldLoadProviders,
  };
}
