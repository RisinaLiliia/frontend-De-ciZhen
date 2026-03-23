'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAccessToken } from '@/lib/auth/token';
import {
  buildWorkspaceOfferRequestIds,
  resolveWorkspaceDataPlan,
} from '@/features/workspace/requests/workspaceData.model';
import {
  buildWorkspaceDataQueries,
  buildWorkspaceOfferRequestsQuery,
} from '@/features/workspace/requests/workspaceData.queries';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { WorkspacePublicOverviewQuery } from '@/lib/api/workspace';

type Params = {
  filter: WorkspacePublicOverviewQuery;
  locale: string;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  shouldLoadPrivateData: boolean;
  activeWorkspaceTab: WorkspaceTab;
};

export function useWorkspaceData(params: Params) {
  const {
    filter,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    isWorkspacePublicSection,
    shouldLoadPrivateData,
    activeWorkspaceTab,
  } = params;
  const hasAccessToken = Boolean(getAccessToken());
  const loadPlan = React.useMemo(
    () =>
      resolveWorkspaceDataPlan({
        isAuthed,
        isWorkspaceAuthed,
        isWorkspacePublicSection,
        shouldLoadPrivateData,
        activeWorkspaceTab,
        hasAccessToken,
      }),
    [
      activeWorkspaceTab,
      hasAccessToken,
      isAuthed,
      isWorkspaceAuthed,
      isWorkspacePublicSection,
      shouldLoadPrivateData,
    ],
  );

  const workspaceDataQueries = React.useMemo(
    () =>
      buildWorkspaceDataQueries({
        filter,
        loadPlan,
        hasAccessToken,
      }),
    [
      filter,
      hasAccessToken,
      loadPlan,
    ],
  );

  const { data: publicOverview, isLoading, isError } = useQuery(workspaceDataQueries.publicOverview);
  const publicRequests = publicOverview?.requests;

  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery(workspaceDataQueries.publicSummary);
  const allRequestsSummary = publicSummaryOverview?.summary;
  const publicCityActivity = publicSummaryOverview?.cityActivity;

  const { data: workspacePrivateOverview } = useQuery(workspaceDataQueries.privateOverview);

  const { data: myOffers = [], isLoading: isMyOffersLoading } = useQuery(workspaceDataQueries.myOffers);

  const myOfferRequestIds = React.useMemo(
    () => buildWorkspaceOfferRequestIds(myOffers),
    [myOffers],
  );

  const myOfferRequestsQuery = React.useMemo(
    () =>
      buildWorkspaceOfferRequestsQuery({
        locale,
        requestIds: myOfferRequestIds,
        enabled: loadPlan.shouldLoadOfferRequests,
      }),
    [loadPlan.shouldLoadOfferRequests, locale, myOfferRequestIds],
  );

  const { data: myOfferRequestsById = new Map() } = useQuery(myOfferRequestsQuery);

  const { data: favoriteRequests = [], isLoading: isFavoriteRequestsLoading } = useQuery(
    workspaceDataQueries.favoriteRequests,
  );

  const { data: favoriteProviders = [], isLoading: isFavoriteProvidersLoading } = useQuery(
    workspaceDataQueries.favoriteProviders,
  );

  const { data: myReviews = [], isLoading: isMyReviewsLoading } = useQuery(workspaceDataQueries.myReviews);

  const { data: myRequests = [], isLoading: isMyRequestsLoading } = useQuery(workspaceDataQueries.myRequests);

  const { data: myProviderContracts = [], isLoading: isProviderContractsLoading } = useQuery(
    workspaceDataQueries.myProviderContracts,
  );

  const { data: myClientContracts = [], isLoading: isClientContractsLoading } = useQuery(
    workspaceDataQueries.myClientContracts,
  );

  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery(workspaceDataQueries.providers);

  return {
    publicRequests,
    isLoading,
    isError,
    allRequestsSummary,
    publicCityActivity,
    isPublicSummaryLoading,
    isPublicSummaryError,
    workspacePrivateOverview,
    myOffers,
    isMyOffersLoading,
    myOfferRequestsById,
    favoriteRequests,
    isFavoriteRequestsLoading,
    favoriteProviders,
    isFavoriteProvidersLoading,
    myReviews,
    isMyReviewsLoading,
    myRequests,
    isMyRequestsLoading,
    myProviderContracts,
    isProviderContractsLoading,
    myClientContracts,
    isClientContractsLoading,
    providers,
    isProvidersLoading,
    isProvidersError,
  };
}
