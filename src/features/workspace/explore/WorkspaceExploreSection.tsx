'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import {
  WorkspaceOverlaySurface,
  useIsDesktop,
} from '@/features/workspace/shared';
import { resolveWorkspaceViewerMode } from '@/features/workspace/state';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import { WorkspaceExploreRail, isWorkspaceExploreRailSection } from './WorkspaceExploreRail';

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

const ProfileOnboardingPanel = dynamic(
  () => import('@/features/profile/onboarding').then((mod) => mod.WorkspaceProfileOnboardingForm),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

type WorkspaceExploreSectionProps = {
  intro?: React.ReactNode | null;
  activeSection: PublicWorkspaceSection;
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
  renderIntro?: boolean;
  renderRail?: boolean;
};

export const WorkspaceExploreSection = React.memo(function WorkspaceExploreSection({
  intro,
  activeSection,
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
  renderIntro = true,
  renderRail = true,
}: WorkspaceExploreSectionProps) {
  const searchParams = useSearchParams();
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));
  const isDesktop = useIsDesktop();
  const isRailSection = isDesktop && isWorkspaceExploreRailSection(activeSection);
  const exploreGridClassName = [
    'workspace-explore-grid',
    renderRail && isDesktop ? 'workspace-explore-grid--with-rail' : 'workspace-explore-grid--single',
  ]
    .filter(Boolean)
    .join(' ');
  const shouldRenderIntro = renderIntro && intro != null;
  const renderedIntro = React.useMemo(() => {
    if (!shouldRenderIntro || !isRailSection || !React.isValidElement(intro)) return intro;

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
  }, [intro, isRailSection, shouldRenderIntro]);

  const content = (
    <div className={exploreGridClassName}>
      <div>
        {activeSection === 'profile' ? (
          <ProfileOnboardingPanel viewerMode={viewerMode} />
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

      {isDesktop && renderRail ? (
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
  );

  if (!shouldRenderIntro) {
    return content;
  }

  return (
    <WorkspaceOverlaySurface intro={renderedIntro}>
      {content}
    </WorkspaceOverlaySurface>
  );
});
