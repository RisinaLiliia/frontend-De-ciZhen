'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { useDeferredMount } from '@/hooks/useDeferredMount';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { WorkspacePublicDemandMapPanel } from './WorkspacePublicDemandMapPanel';
import { WorkspacePlatformReviewsRail } from './WorkspacePlatformReviewsRail';
import { workspaceQK } from './queryKeys';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from './workspace.constants';

const NearbyProvidersPanel = dynamic(
  () => import('@/components/home/HomeNearbyPanel').then((mod) => mod.HomeNearbyPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);

const TopProvidersPanel = dynamic(
  () => import('@/components/home/HomeTopProvidersPanel').then((mod) => mod.HomeTopProvidersPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);

const ProofPanel = dynamic(
  () => import('@/components/home/HomeProofPanel').then((mod) => mod.HomeProofPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);

const TrustLivePanel = dynamic(
  () => import('@/components/home/HomeTrustLivePanel').then((mod) => mod.HomeTrustLivePanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);

type Props = {
  activeSection: PublicWorkspaceSection;
  t: (key: I18nKey) => string;
  locale: Locale;
  exploreListDensity: 'single' | 'double';
  sidebarNearbyLimit: number;
  sidebarTopProvidersLimit: number;
  sidebarProofCases: ProofCase[];
  proofIndex: number;
  trustPanelClassName?: string;
};

export function isWorkspaceExploreRailSection(section: PublicWorkspaceSection) {
  return (
    section === 'requests'
    || section === 'providers'
    || section === 'reviews'
    || section === 'profile'
  );
}

export function WorkspaceExploreRail({
  activeSection,
  t,
  locale,
  exploreListDensity,
  sidebarNearbyLimit,
  sidebarTopProvidersLimit,
  sidebarProofCases,
  proofIndex,
  trustPanelClassName,
}: Props) {
  const isSidebarReady = useDeferredMount(140);
  const isRailSection = isWorkspaceExploreRailSection(activeSection);
  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery({
    queryKey: workspaceQK.workspacePublicSummary(WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT),
    enabled: isRailSection,
    queryFn: () =>
      getWorkspacePublicOverview({
        page: 1,
        limit: 1,
        cityActivityLimit: WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const publicCityActivity = publicSummaryOverview?.cityActivity;
  const publicSummary = publicSummaryOverview?.summary;
  const showRailMap = isRailSection
    && Boolean(publicCityActivity || publicSummary || isPublicSummaryLoading || isPublicSummaryError);

  return (
    <aside className="stack-md hide-below-desktop">
      {isSidebarReady ? (
        <>
          {activeSection === 'reviews' ? <WorkspacePlatformReviewsRail t={t} /> : null}

          {showRailMap ? (
            <WorkspacePublicDemandMapPanel
              t={t}
              locale={locale}
              cityActivity={publicCityActivity}
              summary={publicSummary}
              isLoading={isPublicSummaryLoading}
              isError={isPublicSummaryError}
            />
          ) : null}

          {isRailSection ? (
            <section className="panel stack-sm" aria-label="Workspace quick action">
              <CreateRequestCard href="/request/create" />
            </section>
          ) : null}

          {activeSection === 'reviews' ? null : activeSection === 'providers' ? (
            <NearbyProvidersPanel
              t={t}
              viewAllHref="/workspace?section=requests"
              itemsLimit={sidebarNearbyLimit}
              visibleRows={sidebarNearbyLimit}
            />
          ) : (
            <TopProvidersPanel t={t} locale={locale} limit={sidebarTopProvidersLimit} />
          )}

          {activeSection === 'reviews' ? null : (exploreListDensity === 'double') ? (
            <ProofPanel
              t={t}
              proofCases={sidebarProofCases}
              proofIndex={sidebarProofCases.length ? proofIndex % sidebarProofCases.length : 0}
            />
          ) : null}

          <TrustLivePanel className={trustPanelClassName} t={t} />
        </>
      ) : (
        <>
          <section className="panel">
            <div className="skeleton h-64 w-full" />
          </section>
          <section className="panel">
            <div className="skeleton h-64 w-full" />
          </section>
          <section className="panel">
            <div className="skeleton h-64 w-full" />
          </section>
        </>
      )}
    </aside>
  );
}
