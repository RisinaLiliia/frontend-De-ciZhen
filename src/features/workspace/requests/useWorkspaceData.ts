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
import { useWorkspaceLegacyPrivateData } from '@/features/workspace/requests/useWorkspaceLegacyPrivateData';

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

  const legacyPrivateData = useWorkspaceLegacyPrivateData({
    workspaceDataQueries,
    locale,
    shouldLoadOfferRequests: loadPlan.shouldLoadOfferRequests,
  });

  return {
    contractData,
    legacyPrivateData,
  };
}
