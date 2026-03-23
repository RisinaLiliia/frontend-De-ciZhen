'use client';

import type { ComponentProps, ReactNode } from 'react';

import type {
  usePublicRequestsSeenTotal,
  useWorkspaceNavigation,
  WorkspacePageLayout,
} from '@/features/workspace';
import type { useWorkspacePublicState } from '@/features/workspace/requests';
import {
  EMPTY_ASIDE_BASE_PROPS,
  EMPTY_PROVIDER_IDS,
  NOOP_PROVIDER_TOGGLE,
  WORKSPACE_PATH,
} from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { shouldAutoMarkPublicRequestsSeen } from '@/features/workspace/page/workspacePublicBranch.model';

type WorkspacePublicStateArgs = Parameters<typeof useWorkspacePublicState>[0];

type BuildPublicNavigationArgsParams = {
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
};

type BuildPublicSeenArgsParams = Pick<WorkspaceBranchProps, 'auth' | 'isAuthed' | 'isWorkspaceAuthed'> & {
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  platformRequestsTotal: number;
  isSummaryLoading: boolean;
  isSummaryError: boolean;
};

type BuildPublicStateArgsParams = Pick<WorkspaceBranchProps, 't' | 'isPersonalized'> & {
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  userName: string | null | undefined;
  platformRequestsTotal: number;
  platformProvidersTotal: number;
  platformRatingAvg: number;
  platformReviewsCount: number;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  setWorkspaceTab: WorkspacePublicStateArgs['setWorkspaceTab'];
  markPublicRequestsSeen: WorkspacePublicStateArgs['markPublicRequestsSeen'];
  formatNumber: WorkspacePublicStateArgs['formatNumber'];
};

type BuildPublicRenderMetricPayloadArgs = {
  isAuthed: boolean;
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  platformRequestsTotal: number;
  localeTag: string;
};

type BuildPublicLayoutPropsArgs = Pick<WorkspaceBranchProps, 't' | 'locale' | 'isWorkspaceAuthed'> & {
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  exploreWithSeed: ComponentProps<typeof WorkspacePageLayout>['explore'];
  workspaceIntroNode: ReactNode;
};

export function buildWorkspacePublicNavigationArgs({
  activeWorkspaceTab,
}: BuildPublicNavigationArgsParams): Parameters<typeof useWorkspaceNavigation>[0] {
  return {
    activeWorkspaceTab,
    workspacePath: WORKSPACE_PATH,
  };
}

export function buildWorkspacePublicSeenArgs({
  auth,
  isAuthed,
  isWorkspaceAuthed,
  activePublicSection,
  platformRequestsTotal,
  isSummaryLoading,
  isSummaryError,
}: BuildPublicSeenArgsParams): Parameters<typeof usePublicRequestsSeenTotal>[0] {
  return {
    isAuthed,
    userId: auth.user?.id,
    platformRequestsTotal,
    autoMarkSeen: shouldAutoMarkPublicRequestsSeen({
      isWorkspaceAuthed,
      activePublicSection,
      isSummaryLoading,
      isSummaryError,
    }),
  };
}

export function buildWorkspacePublicStateArgs({
  t,
  isPersonalized,
  activeWorkspaceTab,
  activePublicSection,
  userName,
  platformRequestsTotal,
  platformProvidersTotal,
  platformRatingAvg,
  platformReviewsCount,
  guestLoginHref,
  onGuestLockedAction,
  setWorkspaceTab,
  markPublicRequestsSeen,
  formatNumber,
}: BuildPublicStateArgsParams): WorkspacePublicStateArgs {
  return {
    t,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName,
    publicRequestsCount: platformRequestsTotal,
    publicProvidersCount: platformProvidersTotal,
    publicStatsCount: platformRequestsTotal,
    platformRatingAvg,
    platformReviewsCount,
    setWorkspaceTab,
    markPublicRequestsSeen,
    guestLoginHref,
    onGuestLockedAction,
    formatNumber,
  };
}

export function buildWorkspacePublicRenderMetricPayload({
  isAuthed,
  activeWorkspaceTab,
  activePublicSection,
  platformRequestsTotal,
  localeTag,
}: BuildPublicRenderMetricPayloadArgs) {
  return {
    isAuthed,
    activeWorkspaceTab,
    activePublicSection,
    platformRequestsTotal,
    localeTag,
  };
}

export function buildWorkspacePublicLayoutProps({
  t,
  locale,
  isWorkspaceAuthed,
  activePublicSection,
  activeWorkspaceTab,
  exploreWithSeed,
  workspaceIntroNode,
}: BuildPublicLayoutPropsArgs): ComponentProps<typeof WorkspacePageLayout> {
  return {
    isWorkspacePublicSection: true,
    isWorkspaceAuthed,
    activePublicSection,
    activeWorkspaceTab,
    t,
    locale,
    intro: workspaceIntroNode,
    explore: exploreWithSeed,
    privateMain: null,
    publicMain: null,
    workspaceAsideBaseProps: EMPTY_ASIDE_BASE_PROPS,
    pendingFavoriteProviderIds: EMPTY_PROVIDER_IDS,
    onToggleProviderFavorite: NOOP_PROVIDER_TOGGLE,
  };
}
