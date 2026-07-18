'use client';

import type { ComponentProps } from 'react';

import type { WorkspacePublicIntro } from '@/features/workspace/intro';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import type { useWorkspacePrivateDataFlow } from '@/features/workspace/orchestration/useWorkspacePrivateDataFlow';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';
import type { WorkspaceRequestsViewCard } from '@/features/workspace/requests/workspaceRequestsView.model';
import type { WorkspaceRequestsViewModel } from '@/features/workspace/requests/workspaceRequestsView.model';
import type { useWorkspacePresentation } from '@/features/workspace';
import type { useWorkspacePrivateState } from '@/features/workspace/state/useWorkspacePrivateState';
import type { WorkspacePrivateOverviewState } from '@/features/workspace/state/workspacePrivateState.model';
import { isWorkspaceOverviewMode } from '@/features/workspace/navigation/resolveActiveWorkspaceMode';

type WorkspacePrivateDataFlowResult = ReturnType<typeof useWorkspacePrivateDataFlow>;
type WorkspacePrivateStateArgs = Parameters<typeof useWorkspacePrivateState>[0];
type WorkspacePresentationArgs = Parameters<typeof useWorkspacePresentation>[0];

type BuildArgs = {
  branch: WorkspaceBranchProps;
  data: WorkspacePrivateDataFlowResult;
};

type BuildPresentationArgs = {
  branch: WorkspaceBranchProps;
  data: WorkspacePrivateDataFlowResult;
  WorkspacePrivateIntroComponent: WorkspacePresentationArgs['WorkspacePrivateIntroComponent'];
  preferredRequestsRole?: 'customer' | 'provider' | null;
  privateState: Pick<
    ReturnType<typeof useWorkspacePrivateState>,
    | 'topProviders'
    | 'preferredRequestsRole'
  >;
};

type BuildPublicIntroArgs = {
  branch: WorkspaceBranchProps;
  data: Pick<
    WorkspacePrivateDataFlowResult,
    | 'activePublicSection'
    | 'activeWorkspaceTab'
    | 'allRequestsSummary'
    | 'publicCityActivity'
    | 'isPublicSummaryLoading'
    | 'isPublicSummaryError'
  > & {
    preferredRequestsRole?: 'customer' | 'provider' | null;
  };
};

type BuildWorkspacePublicSummaryViewArgs = Pick<
  WorkspacePrivateDataFlowResult,
  'allRequestsSummary' | 'publicCityActivity' | 'isPublicSummaryLoading' | 'isPublicSummaryError'
>;

type ResolveWorkspaceEffectiveRequestsRoleArgs = {
  activeRequestsRole: WorkspacePrivateDataFlowResult['activeRequestsRole'];
  preferredRequestsRole: 'customer' | 'provider' | null;
};

type ResolveWorkspacePrivateRequestsLoadingArgs = {
  workspaceRequests: WorkspacePrivateDataFlowResult['workspaceRequests'];
  isWorkspaceRequestsLoading: WorkspacePrivateDataFlowResult['isWorkspaceRequestsLoading'];
};

type ResolveWorkspacePrivateRenderModesArgs = {
  activePublicSection: WorkspacePrivateDataFlowResult['activePublicSection'];
  activeWorkspaceTab: WorkspacePrivateDataFlowResult['activeWorkspaceTab'];
  pathname: string;
  sectionParam: string | null;
  hasExplicitWorkspaceTab: boolean;
  requestsScope: WorkspacePrivateDataFlowResult['requestsScope'];
};

type BuildWorkspaceOverviewMarketCardsStateArgs = {
  data: Pick<WorkspacePrivateDataFlowResult, 'favoriteRequestIds' | 'onToggleRequestFavorite' | 'pendingFavoriteRequestIds'> & {
    overviewMarketRequestsState: {
      model: WorkspaceRequestsViewModel;
      isLoading: boolean;
      isError: boolean;
    };
  };
  isOverviewMode: boolean;
};

export function resolveWorkspacePrivateRenderModes({
  activePublicSection,
  activeWorkspaceTab,
  pathname,
  sectionParam,
  hasExplicitWorkspaceTab,
  requestsScope,
}: ResolveWorkspacePrivateRenderModesArgs) {
  const isOverviewMode = isWorkspaceOverviewMode({
    activePublicSection,
    activeWorkspaceTab,
    pathname,
    sectionParam,
    hasExplicitWorkspaceTab,
  });
  const isUnifiedPrivateRequests =
    activePublicSection === 'requests' &&
    requestsScope === 'my';

  return {
    isOverviewMode,
    isUnifiedPrivateRequests,
  };
}

export function buildWorkspaceOverviewMarketCardsState({
  data,
  isOverviewMode,
}: BuildWorkspaceOverviewMarketCardsStateArgs): {
  cards: WorkspaceRequestsViewCard[];
  isLoading: boolean;
  isError: boolean;
  favoriteRequestIds: ReadonlySet<string>;
  pendingFavoriteRequestIds: ReadonlySet<string>;
  onToggleFavorite: (requestId: string) => void;
} {
  if (!isOverviewMode) {
    return {
      cards: [],
      isLoading: false,
      isError: false,
      favoriteRequestIds: data.favoriteRequestIds,
      pendingFavoriteRequestIds: data.pendingFavoriteRequestIds,
      onToggleFavorite: data.onToggleRequestFavorite,
    };
  }

  return {
    cards: data.overviewMarketRequestsState.model.cards,
    isLoading: data.overviewMarketRequestsState.isLoading,
    isError: data.overviewMarketRequestsState.isError,
    favoriteRequestIds: data.favoriteRequestIds,
    pendingFavoriteRequestIds: data.pendingFavoriteRequestIds,
    onToggleFavorite: data.onToggleRequestFavorite,
  };
}

export function buildWorkspacePrivateStateArgs({
  branch,
  data,
}: BuildArgs): WorkspacePrivateStateArgs {
  const privateOverviewState: WorkspacePrivateOverviewState | null =
    data.privateOverviewState
      ? {
        ...data.privateOverviewState,
        preferredRequestsRole:
          data.activePublicSection === 'requests' &&
          data.requestsScope === 'my' &&
          data.activeRequestsRole !== 'all'
            ? data.activeRequestsRole
            : data.privateOverviewState.preferredRequestsRole,
      }
      : null;

  return {
    t: branch.t,
    locale: branch.locale,
    isPersonalized: branch.isPersonalized,
    activeWorkspaceTab: data.activeWorkspaceTab,
    activePublicSection: data.activePublicSection,
    requestsScope: data.requestsScope,
    userName: branch.auth.user?.name,
    providers: data.providerDirectoryState.items,
    publicRequestsCount: data.platformRequestsTotal,
    publicProvidersCount: data.allRequestsSummary?.totalActiveProviders ?? data.providerDirectoryState.items.length,
    publicStatsCount: data.platformRequestsTotal,
    privateOverviewState,
    setWorkspaceTab: data.setWorkspaceTab,
    markPublicRequestsSeen: data.markPublicRequestsSeen,
    guestLoginHref: data.guestLoginHref,
    onGuestLockedAction: data.onGuestLockedAction,
    formatNumber: data.formatNumber,
  };
}

export function buildWorkspacePrivatePresentationArgs({
  branch,
  data,
  WorkspacePrivateIntroComponent,
  preferredRequestsRole = null,
  privateState,
}: BuildPresentationArgs): WorkspacePresentationArgs {
  return {
    t: branch.t,
    locale: branch.locale,
    activePublicSection: data.activePublicSection,
    activeWorkspaceTab: data.activeWorkspaceTab,
    WorkspacePrivateIntroComponent,
    isProvidersLoading: data.providerDirectoryState.isLoading,
    isProvidersError: data.providerDirectoryState.isError,
    topProviders: privateState.topProviders,
    favoriteProviderIds: data.favoriteProvidersState.ids,
    preferredRequestsRole: preferredRequestsRole ?? privateState.preferredRequestsRole,
  };
}

export function buildWorkspacePublicIntroProps({
  branch,
  data,
}: BuildPublicIntroArgs): ComponentProps<typeof WorkspacePublicIntro> {
  const publicSummaryView = buildWorkspacePublicSummaryView(data);

  return {
    t: branch.t,
    locale: branch.locale,
    activePublicSection: data.activePublicSection,
    activeWorkspaceTab: data.activeWorkspaceTab,
    ...publicSummaryView,
    hideDemandMapOnMobile: data.activePublicSection !== 'stats',
    quickActionHref: DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF,
    showQuickAction: data.activePublicSection !== 'stats' && data.activePublicSection !== 'requests',
    preferredRequestsRole: data.preferredRequestsRole ?? null,
  };
}

export function buildWorkspacePublicSummaryView(
  data: BuildWorkspacePublicSummaryViewArgs,
) {
  return {
    cityActivity: data.publicCityActivity,
    summary: data.allRequestsSummary,
    isMapLoading: data.isPublicSummaryLoading,
    isMapError: data.isPublicSummaryError,
  };
}

export function resolveWorkspaceEffectiveRequestsRole({
  activeRequestsRole,
  preferredRequestsRole,
}: ResolveWorkspaceEffectiveRequestsRoleArgs) {
  return activeRequestsRole === 'all'
    ? preferredRequestsRole
    : activeRequestsRole;
}

export function resolveWorkspacePrivateRequestsLoading({
  workspaceRequests,
  isWorkspaceRequestsLoading,
}: ResolveWorkspacePrivateRequestsLoadingArgs) {
  return Boolean(workspaceRequests) && isWorkspaceRequestsLoading;
}
