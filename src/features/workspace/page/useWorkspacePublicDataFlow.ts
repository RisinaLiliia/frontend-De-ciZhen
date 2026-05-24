'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  useExploreSidebar,
  usePublicRequestsSeenTotal,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
} from '@/features/workspace';
import { useWorkspacePublicState } from '@/features/workspace/state/useWorkspacePublicState';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import {
  buildWorkspacePublicExploreWithSeed,
  buildWorkspacePublicReviewsQuery,
  buildWorkspacePublicSnapshotQuery,
  resolveWorkspacePublicBranchSnapshot,
  shouldLoadWorkspacePublicShellSnapshot,
} from '@/features/workspace/page/workspacePublicBranch.model';
import { resolveWorkspacePublicDataFlowResult } from '@/features/workspace/page/workspacePublicDataFlow.model';
import {
  buildWorkspacePublicNavigationArgs,
  buildWorkspacePublicSeenArgs,
  buildWorkspacePublicStateArgs,
} from '@/features/workspace/page/workspacePublicPresentation.model';

type Options = {
  enabled?: boolean;
};

export function useWorkspacePublicDataFlow({
  t,
  locale,
  auth,
  isAuthed,
  isWorkspaceAuthed,
  isPersonalized,
  routeState,
}: WorkspaceBranchProps, {
  enabled = true,
}: Options = {}) {
  const { activePublicSection, activeWorkspaceTab, guestLoginHref, onGuestLockedAction } = routeState;
  const shouldLoadShellSnapshot = enabled && shouldLoadWorkspacePublicShellSnapshot(activePublicSection);

  const { data: platformReviewsOverview } = useQuery({
    ...buildWorkspacePublicReviewsQuery(),
    enabled,
  });
  const {
    data: platformSnapshot,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery({
    ...buildWorkspacePublicSnapshotQuery(),
    enabled: shouldLoadShellSnapshot,
  });

  const {
    platformRequestsTotal,
    platformProvidersTotal,
    platformRatingAvg,
    platformReviewsCount,
    cityActivity,
    platformSummary,
  } = React.useMemo(
    () => resolveWorkspacePublicBranchSnapshot({ platformSnapshot, platformReviewsOverview }),
    [platformReviewsOverview, platformSnapshot],
  );

  const { localeTag, formatNumber } = useWorkspaceFormatters(locale);
  const explore = useExploreSidebar(t);
  const exploreWithSeed = React.useMemo(
    () => buildWorkspacePublicExploreWithSeed({
      explore,
      platformSnapshot,
      isSummaryLoading,
      isSummaryError,
      enableSeed: shouldLoadShellSnapshot,
    }),
    [explore, isSummaryError, isSummaryLoading, platformSnapshot, shouldLoadShellSnapshot],
  );

  const { setWorkspaceTab } = useWorkspaceNavigation(
    buildWorkspacePublicNavigationArgs({ activeWorkspaceTab }),
  );

  const { markPublicRequestsSeen } = usePublicRequestsSeenTotal(
    buildWorkspacePublicSeenArgs({
      auth,
      isAuthed,
      isWorkspaceAuthed,
      activePublicSection,
      platformRequestsTotal,
      isSummaryLoading,
      isSummaryError,
    }),
  );

  const publicState = useWorkspacePublicState(
    buildWorkspacePublicStateArgs({
      t,
      isPersonalized,
      activeWorkspaceTab,
      activePublicSection,
      userName: auth.user?.name,
      platformRequestsTotal,
      platformProvidersTotal,
      platformRatingAvg,
      platformReviewsCount,
      guestLoginHref,
      onGuestLockedAction,
      setWorkspaceTab,
      markPublicRequestsSeen,
      formatNumber,
    }),
  );

  return resolveWorkspacePublicDataFlowResult({
    routeState: {
      activePublicSection,
      activeWorkspaceTab,
    },
    snapshot: {
      platformRequestsTotal,
      platformProvidersTotal,
      platformRatingAvg,
      platformReviewsCount,
      cityActivity,
      platformSummary,
    },
    localeTag,
    exploreWithSeed,
    isSummaryLoading,
    isSummaryError,
    publicState,
  });
}
