'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

import { useDeferredMount } from '@/hooks/useDeferredMount';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';

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

const PlatformActivityPanel = dynamic(
  () => import('@/components/home/HomePlatformActivityPanel').then((mod) => mod.HomePlatformActivityPanel),
  {
    loading: () => (
      <section className="panel">
        <div className="skeleton h-96 w-full" />
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

export function WorkspaceExploreSection({
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

  return (
    <div className="stack-md">
      {intro}
      <div className="requests-grid requests-grid--equal-cols">
        <div>
          {activeSection === 'stats' ? (
            <PlatformActivityPanel t={t} locale={locale} />
          ) : activeSection === 'reviews' ? (
            <PlatformReviewsPanel t={t} locale={locale} />
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
                {activeSection === 'providers' ? (
                  <NearbyProvidersPanel
                    t={t}
                    viewAllHref="/workspace?section=requests"
                    itemsLimit={sidebarNearbyLimit}
                    visibleRows={sidebarNearbyLimit}
                  />
                ) : (
                  <TopProvidersPanel t={t} locale={locale} limit={sidebarTopProvidersLimit} />
                )}

                <ProofPanel
                  t={t}
                  proofCases={sidebarProofCases}
                  proofIndex={sidebarProofCases.length ? proofIndex % sidebarProofCases.length : 0}
                />

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
    </div>
  );
}

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
