'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  useExploreSidebar,
  usePublicRequestsSeenTotal,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
} from '@/features/workspace';
import { useWorkspacePublicState } from '@/features/workspace/requests';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import {
  buildWorkspacePublicExploreWithSeed,
  buildWorkspacePublicReviewsQuery,
  buildWorkspacePublicSnapshotQuery,
  resolveWorkspacePublicBranchSnapshot,
} from '@/features/workspace/page/workspacePublicBranch.model';
import { resolveWorkspacePublicDataFlowResult } from '@/features/workspace/page/workspacePublicDataFlow.model';
import {
  buildWorkspacePublicNavigationArgs,
  buildWorkspacePublicSeenArgs,
  buildWorkspacePublicStateArgs,
} from '@/features/workspace/page/workspacePublicPresentation.model';

export function useWorkspacePublicDataFlow({
  t,
  locale,
  auth,
  isAuthed,
  isWorkspaceAuthed,
  isPersonalized,
  routeState,
}: WorkspaceBranchProps) {
  const { activePublicSection, activeWorkspaceTab, guestLoginHref, onGuestLockedAction } = routeState;

  const { data: platformReviewsOverview } = useQuery(buildWorkspacePublicReviewsQuery());
  const {
    data: platformSnapshot,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery(buildWorkspacePublicSnapshotQuery());

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
    () => buildWorkspacePublicExploreWithSeed({ explore, platformSnapshot, isSummaryLoading, isSummaryError }),
    [explore, isSummaryError, isSummaryLoading, platformSnapshot],
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
