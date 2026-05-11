'use client';

import * as React from 'react';

import { getAccessToken } from '@/lib/auth/token';
import {
  resolveWorkspaceDataPlan,
} from '@/features/workspace/requests/workspaceData.model';
import {
  buildWorkspaceDataQueries,
} from '@/features/workspace/requests/workspaceData.queries';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { WorkspacePublicOverviewQuery } from '@/lib/api/workspace';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type {
  WorkspaceRequestsRole,
  WorkspaceRequestsScope,
  WorkspaceRequestsState,
} from '@/features/workspace/requests/workspaceRequestsScope.model';
import type { WorkspaceRequestsPeriodDto } from '@/lib/api/dto/workspace';
import { useWorkspaceContractData } from '@/features/workspace/requests/useWorkspaceContractData';
import { useWorkspaceLegacyPublicOverviewData } from '@/features/workspace/requests/useWorkspaceLegacyPublicOverviewData';
import { useWorkspaceLegacyProviderSupportData } from '@/features/workspace/requests/useWorkspaceLegacyProviderSupportData';
import { useWorkspaceLegacyRequestSupportData } from '@/features/workspace/requests/useWorkspaceLegacyRequestSupportData';
import { useWorkspaceRequestUserStateData } from '@/features/workspace/requests/useWorkspaceRequestUserStateData';

type Params = {
  enabled?: boolean;
  includePrivateOverview?: boolean;
  includePublicSummary?: boolean;
  publicSummaryCityActivityLimit?: number;
  filter: WorkspacePublicOverviewQuery;
  locale: string;
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  isWorkspacePublicSection: boolean;
  shouldLoadPrivateData: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection?: PublicWorkspaceSection | null;
  requestsScope: WorkspaceRequestsScope;
  activeRequestsRole: WorkspaceRequestsRole;
  activeRequestsState: WorkspaceRequestsState;
  activeRequestsPeriod: WorkspaceRequestsPeriodDto;
  activeRequestsSort: string | null;
};

export function useWorkspaceData(params: Params) {
  const {
    enabled = true,
    includePrivateOverview = true,
    includePublicSummary = true,
    publicSummaryCityActivityLimit,
    filter,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    isWorkspacePublicSection,
    shouldLoadPrivateData,
    activeWorkspaceTab,
    activePublicSection = null,
    requestsScope,
    activeRequestsRole,
    activeRequestsState,
    activeRequestsPeriod,
    activeRequestsSort,
  } = params;
  const hasAccessToken = Boolean(getAccessToken());
  const loadPlan = React.useMemo(
    () =>
      resolveWorkspaceDataPlan({
        enabled,
        isAuthed,
        isWorkspaceAuthed,
        isWorkspacePublicSection,
        shouldLoadPrivateData,
        activeWorkspaceTab,
        activePublicSection,
        requestsScope,
        activeRequestsRole,
        hasAccessToken,
      }),
    [
      activeWorkspaceTab,
      activePublicSection,
      enabled,
      hasAccessToken,
      isAuthed,
      isWorkspaceAuthed,
      isWorkspacePublicSection,
      activeRequestsRole,
      requestsScope,
      shouldLoadPrivateData,
    ],
  );

  const workspaceDataQueries = React.useMemo(
    () =>
      buildWorkspaceDataQueries({
        enabled,
        includePrivateOverview,
        includePublicSummary,
        filter,
        loadPlan,
        hasAccessToken,
        publicSummaryCityActivityLimit,
        requestsScope,
        activeRequestsRole,
        activeRequestsState,
        activeRequestsPeriod,
        activeRequestsSort,
      }),
    [
      filter,
      enabled,
      includePrivateOverview,
      includePublicSummary,
      activeRequestsRole,
      activeRequestsPeriod,
      activeRequestsSort,
      activeRequestsState,
      hasAccessToken,
      loadPlan,
      publicSummaryCityActivityLimit,
      requestsScope,
    ],
  );

  const contractData = useWorkspaceContractData({
    workspaceDataQueries,
  });

  const legacyPublicOverviewData = useWorkspaceLegacyPublicOverviewData({
    workspaceDataQueries,
  });

  const requestUserStateData = useWorkspaceRequestUserStateData({
    workspaceDataQueries,
    locale,
    shouldLoadOfferRequests: loadPlan.shouldLoadOfferRequests,
  });

  const legacyRequestSupportData = useWorkspaceLegacyRequestSupportData({
    workspaceDataQueries,
  });

  const legacyProviderSupportData = useWorkspaceLegacyProviderSupportData({
    workspaceDataQueries,
  });

  return {
    contractData,
    legacyPublicOverviewData,
    requestUserStateData,
    legacyMyRequestsData: {
      myRequests: legacyRequestSupportData.myRequests,
      isMyRequestsLoading: legacyRequestSupportData.isMyRequestsLoading,
    },
    legacyContractSupportData: {
      myProviderContracts: legacyRequestSupportData.myProviderContracts,
      isProviderContractsLoading: legacyRequestSupportData.isProviderContractsLoading,
      myClientContracts: legacyRequestSupportData.myClientContracts,
      isClientContractsLoading: legacyRequestSupportData.isClientContractsLoading,
    },
    legacyReviewSupportData: {
      myReviews: legacyRequestSupportData.myReviews,
      isMyReviewsLoading: legacyRequestSupportData.isMyReviewsLoading,
    },
    legacyProviderSupportData,
  };
}
