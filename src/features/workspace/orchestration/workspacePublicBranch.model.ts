'use client';

import { queryOptions } from '@tanstack/react-query';
import type { ComponentProps } from 'react';

import type { ReviewOverviewDto } from '@/lib/api/dto/reviews';
import type { WorkspacePublicOverviewDto } from '@/lib/api/dto/workspace';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import { getPlatformReviewsOverview } from '@/lib/api/reviews';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { workspaceQK } from '@/features/workspace/data';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';
import {
  WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
  WorkspacePublicIntro,
} from '@/features/workspace';
import {
  PUBLIC_REQUESTS_SEED_LIMIT,
} from '@/features/workspace/orchestration/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import type { ProofCase } from '@/types/home';

type PublicIntroProps = ComponentProps<typeof WorkspacePublicIntro>;

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
type ExploreProps = {
  exploreListDensity: 'single' | 'double';
  setExploreListDensity: (value: 'single' | 'double') => void;
  sidebarNearbyLimit: number;
  sidebarTopProvidersLimit: number;
  sidebarProofCases: ProofCase[];
  proofIndex: number;
  trustPanelClassName?: string;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

type ResolvePublicBranchSnapshotArgs = {
  platformSnapshot: PlatformSnapshot;
  platformReviewsOverview: PlatformReviewsOverview | undefined;
};

type BuildExploreWithSeedArgs = {
  explore: ExploreProps;
  platformSnapshot: PlatformSnapshot;
  isSummaryLoading: boolean;
  isSummaryError: boolean;
  enableSeed?: boolean;
};

type BuildPublicIntroArgs = {
  branch: Pick<WorkspaceBranchProps, 't' | 'locale'>;
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'];
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
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
    queryKey: workspaceQK.workspacePublicSnapshot({
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

export function shouldLoadWorkspacePublicShellSnapshot(
  activePublicSection: WorkspaceBranchProps['routeState']['activePublicSection'],
) {
  return activePublicSection !== 'requests';
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
  enableSeed = true,
}: BuildExploreWithSeedArgs): ExploreProps {
  if (!enableSeed) {
    return explore;
  }

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
  cityActivity,
  platformSummary,
  isSummaryLoading,
  isSummaryError,
}: BuildPublicIntroArgs): PublicIntroProps {
  const isRequestsSection = activePublicSection === 'requests';
  const isExploreSectionWithoutLegacyQuickAction =
    activePublicSection === 'providers'
    || activePublicSection === 'reviews'
    || activePublicSection === 'actions'
    || activePublicSection === 'profile'
    || activePublicSection === 'stats';

  return {
    t: branch.t,
    locale: branch.locale,
    activePublicSection,
    activeWorkspaceTab,
    cityActivity: isRequestsSection ? null : cityActivity,
    summary: isRequestsSection ? null : platformSummary,
    isMapLoading: isRequestsSection ? false : isSummaryLoading,
    isMapError: isRequestsSection ? false : isSummaryError,
    showDemandMap: false,
    hideDemandMapOnMobile: true,
    quickActionHref: DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF,
    showQuickAction: !isRequestsSection && !isExploreSectionWithoutLegacyQuickAction,
  };
}
