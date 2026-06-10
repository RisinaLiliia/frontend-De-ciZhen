'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceProviderDetailStage } from '@/features/workspace/providers/WorkspaceProviderDetailStage';
import { WORKSPACE_PROVIDER_ID_QUERY_KEY } from '@/features/workspace/providers/workspaceProviderRoute.model';

const ExploreRequestsPanel = dynamic(
  () =>
    import('@/components/requests/RequestsExplorePanel').then((mod) => mod.RequestsExplorePanel),
  {
    loading: () => (
      <section className={workspacePanelShell()}>
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

type WorkspaceProvidersSectionProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  onListDensityChange: (value: 'single' | 'double') => void;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

export const WorkspaceProvidersSection = React.memo(function WorkspaceProvidersSection({
  t,
  locale,
  onListDensityChange,
  initialPublicRequests,
  preferInitialPublicRequests,
  initialPublicRequestsLoading,
  initialPublicRequestsError,
}: WorkspaceProvidersSectionProps) {
  const searchParams = useSearchParams();
  const activeProviderId = searchParams.get(WORKSPACE_PROVIDER_ID_QUERY_KEY)?.trim() || null;
  const rootClassName =
    'workspace-section-pane workspace-explore-grid workspace-explore-grid--single';

  if (activeProviderId) {
    return (
      <div className={rootClassName}>
        <WorkspaceProviderDetailStage providerId={activeProviderId} />
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <ExploreRequestsPanel
        t={t}
        locale={locale}
        layoutVariant="workspace"
        contentType="providers"
        providerLinkMode="workspace"
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
