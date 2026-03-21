'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { useDeferredMount } from '@/hooks/useDeferredMount';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';

class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('WorkspaceExploreSection error boundary:', error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import { WorkspacePublicDemandMapPanel } from './WorkspacePublicDemandMapPanel';
import { WorkspaceOverlaySurface } from './WorkspaceOverlaySurface';
import { WorkspacePlatformReviewsRail } from './WorkspacePlatformReviewsRail';
import { workspaceQK } from './queryKeys';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from './workspace.constants';

const ExploreRequestsPanel = dynamic(
  () => import('@/components/home/HomeRequestsExplorePanel').then((mod) => mod.HomeRequestsExplorePanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

const WorkspaceStatisticsExperience = dynamic(
  () => import('@/features/workspace/requests/stats/WorkspaceStatisticsExperience').then((mod) => mod.WorkspaceStatisticsExperience),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-168 w-full" />
      </section>
    ),
  },
);

const PlatformReviewsPanel = dynamic(
  () => import('@/features/workspace/requests/WorkspacePlatformReviewsPanel').then((mod) => mod.WorkspacePlatformReviewsPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

const ProfileOnboardingPanel = dynamic(
  () => import('@/features/workspace/requests/WorkspaceProfileOnboardingForm').then((mod) => mod.WorkspaceProfileOnboardingForm),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

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

type WorkspaceExploreSectionProps = {
  intro: React.ReactNode;
  activeSection: PublicWorkspaceSection;
  isWorkspaceAuthed: boolean;
  t: (key: I18nKey) => string;
  locale: Locale;
  onListDensityChange: (value: 'single' | 'double') => void;
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

export const WorkspaceExploreSection = React.memo(function WorkspaceExploreSection({
  intro,
  activeSection,
  t,
  locale,
  onListDensityChange,
  sidebarNearbyLimit,
  sidebarTopProvidersLimit,
  sidebarProofCases,
  proofIndex,
  trustPanelClassName,
  initialPublicRequests,
  preferInitialPublicRequests,
  initialPublicRequestsLoading,
  initialPublicRequestsError,
}: WorkspaceExploreSectionProps) {
  const isDesktop = useIsDesktop();
  const isSidebarReady = useDeferredMount(140);
  const exploreGridClassName = activeSection === 'reviews'
    ? 'requests-grid'
    : 'requests-grid requests-grid--equal-cols';
  const showExploreRailMap = isDesktop && (
    activeSection === 'requests'
    || activeSection === 'providers'
    || activeSection === 'reviews'
    || activeSection === 'profile'
  );
  const showExploreRailQuickAction = isDesktop && (
    activeSection === 'requests'
    || activeSection === 'providers'
    || activeSection === 'reviews'
    || activeSection === 'profile'
  );
  const renderedIntro = React.useMemo(() => {
    if (!(showExploreRailMap || showExploreRailQuickAction) || !React.isValidElement(intro)) return intro;

    return React.cloneElement(
      intro as React.ReactElement<{
        showDemandMap?: boolean;
        showQuickAction?: boolean;
      }>,
      {
        showDemandMap: showExploreRailMap ? false : undefined,
        showQuickAction: showExploreRailQuickAction ? false : undefined,
      },
    );
  }, [intro, showExploreRailMap, showExploreRailQuickAction]);
  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery({
    queryKey: workspaceQK.workspacePublicSummary(WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT),
    enabled: showExploreRailMap,
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
  const showRailMap = showExploreRailMap
    && Boolean(publicCityActivity || publicSummary || isPublicSummaryLoading || isPublicSummaryError);

  if (activeSection === 'stats') {
    return (
      <ErrorBoundary fallback={(
        <section className="panel">
          <div className="panel__body">{t(I18N_KEYS.requestsPage.statsLoadError)}</div>
        </section>
      )}>
        <WorkspaceStatisticsExperience
          intro={intro}
          t={t}
          locale={locale}
        />
      </ErrorBoundary>
    );
  }

  return (
    <WorkspaceOverlaySurface intro={renderedIntro}>
      <div className={exploreGridClassName}>
        <div>
          {activeSection === 'reviews' ? (
            <PlatformReviewsPanel t={t} locale={locale} showInlineRail={!isDesktop} />
          ) : activeSection === 'profile' ? (
            <ProfileOnboardingPanel />
          ) : (
            <ExploreRequestsPanel
              t={t}
              locale={locale}
              contentType={activeSection === 'providers' ? 'providers' : 'requests'}
              showHeading={false}
              showBack={false}
              backHref="/"
              onListDensityChange={onListDensityChange}
              showTopFilters
              initialPublicRequests={initialPublicRequests}
              preferInitialPublicRequests={preferInitialPublicRequests}
              initialPublicRequestsLoading={initialPublicRequestsLoading}
              initialPublicRequestsError={initialPublicRequestsError}
            />
          )}
        </div>

        {isDesktop ? (
          <aside className="stack-md hide-mobile">
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

                {showExploreRailQuickAction ? (
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

                {activeSection === 'reviews' ? null : (
                  <ProofPanel
                    t={t}
                    proofCases={sidebarProofCases}
                    proofIndex={sidebarProofCases.length ? proofIndex % sidebarProofCases.length : 0}
                  />
                )}

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
        ) : null}
      </div>
    </WorkspaceOverlaySurface>
  );
});

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isDesktop;
}
