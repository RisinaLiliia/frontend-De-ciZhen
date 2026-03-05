'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import { useDevRenderMetric } from '@/lib/perf/useDevRenderMetric';
import { useWorkspacePublicState } from '@/features/workspace/requests';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import {
  useExploreSidebar,
  usePublicRequestsSeenTotal,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  WorkspacePageLayout,
  WorkspacePublicIntro,
} from '@/features/workspace';
import {
  EMPTY_ASIDE_BASE_PROPS,
  EMPTY_PROVIDER_IDS,
  NOOP_PROVIDER_TOGGLE,
  PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
  PUBLIC_REQUESTS_SEED_LIMIT,
  WORKSPACE_PATH,
} from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

export function WorkspacePublicBranch({
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
      cityActivityLimit: PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
    }),
    queryFn: () =>
      getWorkspacePublicOverview({
        sort: 'date_desc',
        page: 1,
        limit: PUBLIC_REQUESTS_SEED_LIMIT,
        activityRange: '30d',
        cityActivityLimit: PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const platformRequestsTotal = platformSnapshot?.summary.totalPublishedRequests ?? 0;
  const platformProvidersTotal = platformSnapshot?.summary.totalActiveProviders ?? 0;
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

  const { navTitle, activityProgress, personalNavItems, insightText } = useWorkspacePublicState({
    t,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName: auth.user?.name,
    publicRequestsCount: platformRequestsTotal,
    publicProvidersCount: platformProvidersTotal,
    publicStatsCount: platformRequestsTotal,
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
        personalNavItems={personalNavItems}
        insightText={isPersonalized ? insightText : ''}
        activityProgress={activityProgress}
        cityActivity={cityActivity}
        summary={platformSummary}
        quickActionHref="/request/create"
      />
    ),
    [
      activityProgress,
      insightText,
      isPersonalized,
      locale,
      navTitle,
      personalNavItems,
      cityActivity,
      platformSummary,
      t,
    ],
  );

  useDevRenderMetric('workspace.public', () => ({
    isAuthed,
    activeWorkspaceTab,
    activePublicSection,
    platformRequestsTotal,
    localeTag,
  }));

  return (
    <WorkspacePageLayout
      isWorkspacePublicSection={true}
      isWorkspaceAuthed={isWorkspaceAuthed}
      activePublicSection={activePublicSection}
      t={t}
      locale={locale}
      intro={workspaceIntroNode}
      explore={exploreWithSeed}
      privateMain={null}
      publicMain={null}
      workspaceAsideBaseProps={EMPTY_ASIDE_BASE_PROPS}
      pendingFavoriteProviderIds={EMPTY_PROVIDER_IDS}
      onToggleProviderFavorite={NOOP_PROVIDER_TOGGLE}
    />
  );
}
