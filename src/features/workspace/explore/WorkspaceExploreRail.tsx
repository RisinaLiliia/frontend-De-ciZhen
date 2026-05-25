'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { useDeferredMount } from '@/hooks/useDeferredMount';
import { workspaceQK, WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '@/features/workspace/data';
import { WorkspacePublicDemandMapPanel } from '@/features/workspace/demand-map';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { WorkspaceRightRailStack } from '@/features/workspace/shared';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';

const TopProvidersPanel = dynamic(
  () => import('@/components/home/HomeTopProvidersPanel').then((mod) => mod.HomeTopProvidersPanel),
  {
    loading: () => (
      <section className={workspacePanelShell()}>
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);

const ProofPanel = dynamic(
  () => import('@/components/home/HomeProofPanel').then((mod) => mod.HomeProofPanel),
  {
    loading: () => (
      <section className={workspacePanelShell()}>
        <div className="skeleton h-64 w-full" />
      </section>
    ),
  },
);

const TrustLivePanel = dynamic(
  () => import('@/components/home/HomeTrustLivePanel').then((mod) => mod.HomeTrustLivePanel),
  {
    loading: () => (
      <section className={workspacePanelShell()}>
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
  return section === 'requests';
}

function shouldShowWorkspaceExploreRailMap(section: PublicWorkspaceSection) {
  return section === 'stats';
}

export function WorkspaceExploreRail({
  activeSection,
  t,
  locale,
  exploreListDensity,
  sidebarTopProvidersLimit,
  sidebarProofCases,
  proofIndex,
  trustPanelClassName,
}: Props) {
  const isSidebarReady = useDeferredMount(140);
  const isRailSection = isWorkspaceExploreRailSection(activeSection);
  const shouldShowRailMap = shouldShowWorkspaceExploreRailMap(activeSection);
  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery({
    queryKey: workspaceQK.workspacePublicSummary(WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT),
    enabled: shouldShowRailMap,
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
  const showRailMap = shouldShowRailMap
    && Boolean(publicCityActivity || publicSummary || isPublicSummaryLoading || isPublicSummaryError);

  return (
    <WorkspaceRightRailStack className="hide-below-tablet">
      {isSidebarReady ? (
        <>
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
            <section className={workspacePanelShell('stack-sm')} aria-label="Workspace quick action">
              <CreateRequestCard href="/request/create" />
            </section>
          ) : null}

          <TopProvidersPanel t={t} locale={locale} limit={sidebarTopProvidersLimit} />

          {exploreListDensity === 'double' ? (
            <ProofPanel
              t={t}
              proofCases={sidebarProofCases}
              proofIndex={sidebarProofCases.length ? proofIndex % sidebarProofCases.length : 0}
            />
          ) : (
            <TrustLivePanel className={trustPanelClassName} t={t} />
          )}
        </>
      ) : (
        <>
          <section className={workspacePanelShell()}>
            <div className="skeleton h-64 w-full" />
          </section>
          <section className={workspacePanelShell()}>
            <div className="skeleton h-64 w-full" />
          </section>
          <section className={workspacePanelShell()}>
            <div className="skeleton h-64 w-full" />
          </section>
        </>
      )}
    </WorkspaceRightRailStack>
  );
}
