'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { resolveWorkspaceViewerModeToggleItems } from '@/features/workspace/context';
import { getWorkspaceStatisticsCopy } from '@/features/workspace/stats';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { resolveWorkspaceViewerMode } from '@/features/workspace/state';
import { useI18n } from '@/lib/i18n/I18nProvider';

const WorkspaceProfileOnboardingPanel = dynamic(
  () =>
    import('@/features/workspace/profile/onboarding').then(
      (mod) => mod.WorkspaceProfileOnboardingForm,
    ),
  {
    loading: () => (
      <section className={workspacePanelShell()}>
        <div className="skeleton h-96 w-full" />
      </section>
    ),
  },
);

export const WorkspaceProfileSection = React.memo(function WorkspaceProfileSection() {
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));
  const statsCopy = getWorkspaceStatisticsCopy(locale);
  const viewerModeItems = React.useMemo(
    () =>
      resolveWorkspaceViewerModeToggleItems({
        viewerMode,
        providerLabel: statsCopy.viewerModeProviderLabel,
        customerLabel: statsCopy.viewerModeCustomerLabel,
        invertLabels: true,
      }),
    [statsCopy.viewerModeCustomerLabel, statsCopy.viewerModeProviderLabel, viewerMode],
  );
  const buildViewerModeHref = React.useCallback(
    (nextViewerMode: 'provider' | 'customer') => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('section', 'profile');
      params.set('viewerMode', nextViewerMode);
      return `/workspace?${params.toString()}`;
    },
    [searchParams],
  );

  return (
    <div className="workspace-profile-section">
      <nav className="workspace-profile-section__toolbar" aria-label={statsCopy.viewerModeLabel}>
        <div
          className="workspace-context-toggle-tabs"
          role="group"
          aria-label={statsCopy.viewerModeLabel}
        >
          {viewerModeItems.map((item) => (
            <Link
              key={item.value}
              href={buildViewerModeHref(item.value)}
              prefetch={false}
              aria-current={item.isActive ? 'page' : undefined}
              className={`workspace-context-toggle-tab ${item.isActive ? 'is-active' : ''}`.trim()}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="workspace-profile-section__main">
        <WorkspaceProfileOnboardingPanel viewerMode={viewerMode} />
      </div>
    </div>
  );
});
