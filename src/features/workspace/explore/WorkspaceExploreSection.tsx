'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { resolveWorkspaceViewerMode } from '@/features/workspace/state';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

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
  activeSection: PublicWorkspaceSection;
  t: (key: I18nKey) => string;
  locale: Locale;
  onListDensityChange: (value: 'single' | 'double') => void;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

export const WorkspaceExploreSection = React.memo(function WorkspaceExploreSection({
  activeSection,
  t,
  locale,
  onListDensityChange,
  initialPublicRequests,
  preferInitialPublicRequests,
  initialPublicRequestsLoading,
  initialPublicRequestsError,
}: WorkspaceExploreSectionProps) {
  const searchParams = useSearchParams();
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));

  return (
    <div className="workspace-explore-grid workspace-explore-grid--single">
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
    </div>
  );
});
