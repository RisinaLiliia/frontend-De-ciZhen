'use client';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';
import type {
  WorkspaceRequestsRole,
  WorkspaceRequestsScope,
} from '@/features/workspace/state';

type WorkspaceDataPlanArgs = {
  enabled?: boolean;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  shouldLoadPrivateData: boolean;
  activeWorkspaceTab: WorkspaceTab;
  requestsScope?: WorkspaceRequestsScope;
  activeRequestsRole?: WorkspaceRequestsRole;
  activePublicSection?: PublicWorkspaceSection | null;
  hasAccessToken: boolean;
};

export type WorkspaceDataLoadPlan = {
  shouldLoadPrivateOverview: boolean;
  shouldLoadWorkspaceRequests: boolean;
  shouldLoadMyOffers: boolean;
  shouldLoadFavoriteRequests: boolean;
  shouldLoadOfferRequests: boolean;
};

export function buildWorkspaceOfferRequestIds(myOffers: OfferDto[]) {
  return Array.from(new Set(myOffers.map((offer) => offer.requestId).filter(Boolean)));
}

export function resolveWorkspaceDataPlan({
  enabled = true,
  isWorkspaceAuthed,
  isWorkspacePublicSection,
  shouldLoadPrivateData,
  activeWorkspaceTab,
  requestsScope = 'market',
  activePublicSection = null,
  hasAccessToken,
}: WorkspaceDataPlanArgs): WorkspaceDataLoadPlan {
  if (!enabled) {
    return {
      shouldLoadPrivateOverview: false,
      shouldLoadWorkspaceRequests: false,
      shouldLoadMyOffers: false,
      shouldLoadFavoriteRequests: false,
      shouldLoadOfferRequests: false,
    };
  }

  const shouldLoadUnifiedPrivateRequests =
    isWorkspaceAuthed &&
    shouldLoadPrivateData &&
    requestsScope === 'my' &&
    activePublicSection === 'requests';
  const shouldLoadUnifiedMarketRequests =
    isWorkspacePublicSection &&
    activePublicSection === 'requests' &&
    requestsScope === 'market';
  const shouldLoadPrivateOverviewRequests =
    isWorkspaceAuthed &&
    shouldLoadPrivateData &&
    activePublicSection === null &&
    activeWorkspaceTab === 'my-requests';
  const isLegacyPrivateTabMode = activePublicSection === null;
  const shouldLoadPrivateOverview = isWorkspaceAuthed && shouldLoadPrivateData && hasAccessToken;
  const shouldLoadWorkspaceRequests =
    shouldLoadUnifiedPrivateRequests ||
    shouldLoadUnifiedMarketRequests ||
    shouldLoadPrivateOverviewRequests;
  const shouldLoadMyOffers =
    isLegacyPrivateTabMode &&
    isWorkspaceAuthed &&
    shouldLoadPrivateData;
  const shouldLoadFavoriteRequests =
    isLegacyPrivateTabMode &&
    isWorkspaceAuthed &&
    shouldLoadPrivateData;
  const shouldLoadOfferRequests = shouldLoadMyOffers;

  return {
    shouldLoadPrivateOverview,
    shouldLoadWorkspaceRequests,
    shouldLoadMyOffers,
    shouldLoadFavoriteRequests,
    shouldLoadOfferRequests,
  };
}
