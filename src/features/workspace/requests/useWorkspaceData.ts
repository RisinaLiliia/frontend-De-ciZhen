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
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceRequestsScope } from '@/features/workspace/requests/workspaceRequestsScope.model';
import type { WorkspaceRequestsPeriodDto } from '@/lib/api/dto/workspace';

type Params = {
  filter: WorkspacePublicOverviewQuery;
  locale: string;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  shouldLoadPrivateData: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection?: PublicWorkspaceSection | null;
  requestsScope: WorkspaceRequestsScope;
  activeRequestsPeriod: WorkspaceRequestsPeriodDto;
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
    activePublicSection = null,
    requestsScope,
    activeRequestsPeriod,
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
        activePublicSection,
        requestsScope,
        hasAccessToken,
      }),
    [
      activeWorkspaceTab,
      activePublicSection,
      hasAccessToken,
      isAuthed,
      isWorkspaceAuthed,
      isWorkspacePublicSection,
      requestsScope,
      shouldLoadPrivateData,
    ],
  );

  const workspaceDataQueries = React.useMemo(
    () =>
      buildWorkspaceDataQueries({
        filter,
        loadPlan,
        hasAccessToken,
        activeRequestsPeriod,
      }),
    [
      filter,
      activeRequestsPeriod,
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

  const {
    data: workspacePrivateOverview,
    isLoading: isWorkspacePrivateOverviewLoading,
  } = useQuery(workspaceDataQueries.privateOverview);

  const { data: myOffers = [], isLoading: isMyOffersLoading } = useQuery(workspaceDataQueries.myOffers);
  const { data: myClientOffers = [], isLoading: isMyClientOffersLoading } = useQuery(
    workspaceDataQueries.myClientOffers,
  );

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
    isWorkspacePrivateOverviewLoading,
    myOffers,
    isMyOffersLoading,
    myClientOffers,
    isMyClientOffersLoading,
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
