'use client';

import { queryOptions } from '@tanstack/react-query';
import type { ComponentProps } from 'react';

import type { ReviewOverviewDto } from '@/lib/api/dto/reviews';
import type { WorkspacePublicOverviewDto } from '@/lib/api/dto/workspace';
import { getPlatformReviewsOverview } from '@/lib/api/reviews';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import {
  WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
  WorkspacePageLayout,
  WorkspacePublicIntro,
} from '@/features/workspace';
import { buildWorkspaceLocalNavItems } from '@/features/workspace/shell/WorkspaceEnvironmentChrome';
import {
  PUBLIC_REQUESTS_SEED_LIMIT,
} from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

type PublicIntroProps = ComponentProps<typeof WorkspacePublicIntro>;
type PublicStateModel = Pick<PublicIntroProps, 'activityProgress' | 'personalNavItems' | 'insightText'>;

export const EMPTY_PLATFORM_REVIEWS_OVERVIEW = {
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

type PlatformReviewsOverview = ReviewOverviewDto;
type PlatformSnapshot = WorkspacePublicOverviewDto | undefined;
type ExploreProps = ComponentProps<typeof WorkspacePageLayout>['explore'];

type ResolvePublicBranchSnapshotArgs = {
  platformSnapshot: PlatformSnapshot;
  platformReviewsOverview: PlatformReviewsOverview | undefined;
};

type BuildExploreWithSeedArgs = {
  explore: ExploreProps;
  platformSnapshot: PlatformSnapshot;
  isSummaryLoading: boolean;
  isSummaryError: boolean;
};

type BuildPublicIntroArgs = {
  branch: Pick<WorkspaceBranchProps, 't' | 'locale' | 'isPersonalized'>;
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  state: PublicStateModel;
  cityActivity: PublicIntroProps['cityActivity'];
  platformSummary: PublicIntroProps['summary'];
  isSummaryLoading: boolean;
  isSummaryError: boolean;
};

export function buildWorkspacePublicReviewsQuery() {
  return queryOptions({
    queryKey: workspaceQK.platformReviewsOverviewSummary(),
    queryFn: () =>
      withStatusFallback(
        () => getPlatformReviewsOverview({ limit: 1, offset: 0, sort: 'created_desc' }),
        EMPTY_PLATFORM_REVIEWS_OVERVIEW,
        [400, 404],
      ),
    staleTime: 60_000,
    refetchOnWindowFocus: false as const,
    notifyOnChangeProps: ['data'],
  });
}

export function buildWorkspacePublicSnapshotQuery() {
  return queryOptions({
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
    refetchOnWindowFocus: false as const,
    placeholderData: (previousData: WorkspacePublicOverviewDto | undefined) => previousData,
    notifyOnChangeProps: ['data', 'isLoading', 'isError'],
  });
}

export function resolveWorkspacePublicBranchSnapshot({
  platformSnapshot,
  platformReviewsOverview,
}: ResolvePublicBranchSnapshotArgs) {
  const platformRequestsTotal = platformSnapshot?.summary.totalPublishedRequests ?? 0;
  const platformProvidersTotal = platformSnapshot?.summary.totalActiveProviders ?? 0;
  const rawPlatformRatingAvg = Number(platformReviewsOverview?.summary.averageRating ?? 0);
  const rawPlatformReviewsCount = Number(platformReviewsOverview?.summary.total ?? 0);

  return {
    platformRequestsTotal,
    platformProvidersTotal,
    platformRatingAvg: Number.isFinite(rawPlatformRatingAvg) ? rawPlatformRatingAvg : 0,
    platformReviewsCount: Number.isFinite(rawPlatformReviewsCount)
      ? Math.max(0, Math.round(rawPlatformReviewsCount))
      : 0,
    cityActivity: platformSnapshot?.cityActivity,
    platformSummary: platformSnapshot?.summary,
  };
}

export function buildWorkspacePublicExploreWithSeed({
  explore,
  platformSnapshot,
  isSummaryLoading,
  isSummaryError,
}: BuildExploreWithSeedArgs): ExploreProps {
  return {
    ...explore,
    initialPublicRequests: platformSnapshot?.requests,
    preferInitialPublicRequests: true,
    initialPublicRequestsLoading: isSummaryLoading,
    initialPublicRequestsError: isSummaryError,
  };
}

export function shouldAutoMarkPublicRequestsSeen(params: {
  isWorkspaceAuthed: boolean;
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  isSummaryLoading: boolean;
  isSummaryError: boolean;
}) {
  return (
    params.isWorkspaceAuthed &&
    params.activePublicSection === 'requests' &&
    !params.isSummaryLoading &&
    !params.isSummaryError
  );
}

export function buildWorkspacePublicIntroProps({
  branch,
  activePublicSection,
  activeWorkspaceTab,
  state,
  cityActivity,
  platformSummary,
  isSummaryLoading,
  isSummaryError,
}: BuildPublicIntroArgs): PublicIntroProps {
  return {
    t: branch.t,
    locale: branch.locale,
    activePublicSection,
    activeWorkspaceTab,
    personalNavItems: buildWorkspaceLocalNavItems(state.personalNavItems),
    insightText: branch.isPersonalized ? state.insightText : '',
    activityProgress: state.activityProgress,
    cityActivity,
    summary: platformSummary,
    isMapLoading: isSummaryLoading,
    isMapError: isSummaryError,
    hideDemandMapOnMobile: activePublicSection !== 'stats',
    quickActionHref: '/request/create',
    showQuickAction: activePublicSection !== 'stats',
  };
}
