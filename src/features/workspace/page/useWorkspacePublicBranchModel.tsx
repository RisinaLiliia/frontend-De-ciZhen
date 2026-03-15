'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getPlatformReviewsOverview } from '@/lib/api/reviews';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useWorkspacePublicState } from '@/features/workspace/requests';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import {
  useExploreSidebar,
  usePublicRequestsSeenTotal,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
  WorkspacePublicIntro,
} from '@/features/workspace';
import {
  PUBLIC_REQUESTS_SEED_LIMIT,
  WORKSPACE_PATH,
} from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

const EMPTY_PLATFORM_REVIEWS_OVERVIEW = {
  items: [],
  total: 0,
  limit: 1,
  offset: 0,
  summary: {
    total: 0,
    averageRating: 0,
    distribution: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    },
  },
};

export function useWorkspacePublicBranchModel({
  t,
  locale,
  auth,
  isAuthed,
  isWorkspaceAuthed,
  isPersonalized,
  routeState,
}: WorkspaceBranchProps) {
  const { activePublicSection, activeWorkspaceTab, guestLoginHref, onGuestLockedAction } = routeState;

  const {
    data: platformReviewsOverview,
  } = useQuery({
    queryKey: ['platform-reviews-overview', 'summary'],
    queryFn: () =>
      withStatusFallback(
        () => getPlatformReviewsOverview({ limit: 1, offset: 0, sort: 'created_desc' }),
        EMPTY_PLATFORM_REVIEWS_OVERVIEW,
        [400, 404],
      ),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    notifyOnChangeProps: ['data'],
  });

  const {
    data: platformSnapshot,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery({
    queryKey: workspaceQK.workspacePublicOverview({
      cityId: undefined,
      categoryKey: undefined,
      subcategoryKey: undefined,
      sort: 'date_desc',
      page: 1,
      limit: PUBLIC_REQUESTS_SEED_LIMIT,
      activityRange: '30d',
      cityActivityLimit: WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
    }),
    queryFn: () =>
      getWorkspacePublicOverview({
        sort: 'date_desc',
        page: 1,
        limit: PUBLIC_REQUESTS_SEED_LIMIT,
        activityRange: '30d',
        cityActivityLimit: WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    notifyOnChangeProps: ['data', 'isLoading', 'isError'],
  });

  const platformRequestsTotal = platformSnapshot?.summary.totalPublishedRequests ?? 0;
  const platformProvidersTotal = platformSnapshot?.summary.totalActiveProviders ?? 0;
  const platformRatingAvg = Number(platformReviewsOverview?.summary.averageRating ?? 0);
  const platformReviewsCount = Number(platformReviewsOverview?.summary.total ?? 0);
  const cityActivity = platformSnapshot?.cityActivity;
  const platformSummary = platformSnapshot?.summary;
  const { localeTag, formatNumber } = useWorkspaceFormatters(locale);
  const explore = useExploreSidebar(t);
  const exploreWithSeed = React.useMemo(
    () => ({
      ...explore,
      initialPublicRequests: platformSnapshot?.requests,
      preferInitialPublicRequests: true,
      initialPublicRequestsLoading: isSummaryLoading,
      initialPublicRequestsError: isSummaryError,
    }),
    [explore, isSummaryError, isSummaryLoading, platformSnapshot?.requests],
  );

  const { setWorkspaceTab } = useWorkspaceNavigation({
    activeWorkspaceTab,
    workspacePath: WORKSPACE_PATH,
  });

  const { markPublicRequestsSeen } = usePublicRequestsSeenTotal({
    isAuthed,
    userId: auth.user?.id,
    platformRequestsTotal,
    autoMarkSeen:
      isWorkspaceAuthed &&
      activePublicSection === 'requests' &&
      !isSummaryLoading &&
      !isSummaryError,
  });

  const { navTitle, navSubtitle, activityProgress, personalNavItems, insightText } = useWorkspacePublicState({
    t,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName: auth.user?.name,
    publicRequestsCount: platformRequestsTotal,
    publicProvidersCount: platformProvidersTotal,
    publicStatsCount: platformRequestsTotal,
    platformRatingAvg: Number.isFinite(platformRatingAvg) ? platformRatingAvg : 0,
    platformReviewsCount: Number.isFinite(platformReviewsCount) ? Math.max(0, Math.round(platformReviewsCount)) : 0,
    setWorkspaceTab,
    markPublicRequestsSeen,
    guestLoginHref,
    onGuestLockedAction,
    formatNumber,
  });

  const workspaceIntroNode = React.useMemo(
    () => (
      <WorkspacePublicIntro
        t={t}
        locale={locale}
        navTitle={navTitle}
        navSubtitle={navSubtitle}
        personalNavItems={personalNavItems}
        insightText={isPersonalized ? insightText : ''}
        activityProgress={activityProgress}
        cityActivity={cityActivity}
        summary={platformSummary}
        isMapLoading={isSummaryLoading}
        isMapError={isSummaryError}
        quickActionHref="/request/create"
        showQuickAction={activePublicSection !== 'stats'}
      />
    ),
    [
      activePublicSection,
      activityProgress,
      insightText,
      isPersonalized,
      locale,
      navTitle,
      navSubtitle,
      personalNavItems,
      cityActivity,
      platformSummary,
      isSummaryLoading,
      isSummaryError,
      t,
    ],
  );

  return {
    activePublicSection,
    activeWorkspaceTab,
    platformRequestsTotal,
    localeTag,
    exploreWithSeed,
    workspaceIntroNode,
  };
}
