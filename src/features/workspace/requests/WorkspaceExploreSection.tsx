'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import { WorkspaceExploreRail, isWorkspaceExploreRailSection } from './WorkspaceExploreRail';
import { WorkspaceOverlaySurface } from './WorkspaceOverlaySurface';
import { WorkspaceSectionErrorBoundary } from './WorkspaceSectionErrorBoundary';
import { useIsDesktop } from './useIsDesktop';

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

type WorkspaceExploreSectionProps = {
  intro: React.ReactNode;
  activeSection: PublicWorkspaceSection;
  isWorkspaceAuthed: boolean;
  t: (key: I18nKey) => string;
  locale: Locale;
  onListDensityChange: (value: 'single' | 'double') => void;
  exploreListDensity: 'single' | 'double';
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
  isWorkspaceAuthed,
  t,
  locale,
  onListDensityChange,
  exploreListDensity,
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
  const isRailSection = isDesktop && isWorkspaceExploreRailSection(activeSection);
  const exploreGridClassName = activeSection === 'reviews'
    ? 'requests-grid'
    : 'requests-grid requests-grid--equal-cols';
  const renderedIntro = React.useMemo(() => {
    if (!isRailSection || !React.isValidElement(intro)) return intro;

    return React.cloneElement(
      intro as React.ReactElement<{
        showDemandMap?: boolean;
        showQuickAction?: boolean;
      }>,
      {
        showDemandMap: false,
        showQuickAction: false,
      },
    );
  }, [intro, isRailSection]);

  if (activeSection === 'stats') {
    return (
      <WorkspaceSectionErrorBoundary logLabel="WorkspaceExploreSection error boundary" fallback={(
        <section className="panel">
          <div className="panel__body">{t(I18N_KEYS.requestsPage.statsLoadError)}</div>
        </section>
      )}>
        <WorkspaceStatisticsExperience
          intro={intro}
          isWorkspaceAuthed={isWorkspaceAuthed}
          t={t}
          locale={locale}
        />
      </WorkspaceSectionErrorBoundary>
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
              showTopFilters={false}
              initialPublicRequests={initialPublicRequests}
              preferInitialPublicRequests={preferInitialPublicRequests}
              initialPublicRequestsLoading={initialPublicRequestsLoading}
              initialPublicRequestsError={initialPublicRequestsError}
            />
          )}
        </div>

        {isDesktop ? (
          <WorkspaceExploreRail
            activeSection={activeSection}
            t={t}
            locale={locale}
            exploreListDensity={exploreListDensity}
            sidebarNearbyLimit={sidebarNearbyLimit}
            sidebarTopProvidersLimit={sidebarTopProvidersLimit}
            sidebarProofCases={sidebarProofCases}
            proofIndex={proofIndex}
            trustPanelClassName={trustPanelClassName}
          />
        ) : null}
      </div>
    </WorkspaceOverlaySurface>
  );
});
