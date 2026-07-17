'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

const ExploreRequestsPanel = dynamic(
  () =>
    import('@/components/requests/RequestsExplorePanel').then(
      (mod) => mod.RequestsExplorePanel,
    ),
  {
    loading: () => (
      <section className={workspacePanelShell()}>
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

type WorkspaceExploreSectionProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  onListDensityChange: (value: 'single' | 'double') => void;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

export const WorkspaceExploreSection = React.memo(function WorkspaceExploreSection({
  t,
  locale,
  onListDensityChange,
  initialPublicRequests,
  preferInitialPublicRequests,
  initialPublicRequestsLoading,
  initialPublicRequestsError,
}: WorkspaceExploreSectionProps) {
  return (
    <div className="workspace-section-pane workspace-explore-grid workspace-explore-grid--single">
      <ExploreRequestsPanel
        t={t}
        locale={locale}
        layoutVariant="workspace"
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
    </div>
  );
});
