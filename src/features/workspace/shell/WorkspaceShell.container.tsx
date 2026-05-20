'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import WorkspacePageClient from '@/features/workspace/WorkspacePageClient';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import {
  buildLegacyWorkspaceTabRedirectHref,
  buildWorkspaceRequestsScopeHref,
  isWorkspaceTab,
  type WorkspaceTab,
} from '@/features/workspace/state';
import { shouldAttemptRefreshOnBootstrap } from '@/lib/auth/session';

import {
  type PublicWorkspaceSection,
  resolvePublicWorkspaceSection,
} from '@/features/workspace/navigation/resolveActiveWorkspaceSection';

type WorkspaceShellProps = {
  forcedPublicSection?: PublicWorkspaceSection | null;
  forcedWorkspaceTab?: WorkspaceTab | null;
};

export function WorkspaceShell({
  forcedPublicSection = null,
  forcedWorkspaceTab = null,
}: WorkspaceShellProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuthSnapshot();
  const [bootstrapRefreshIntent, setBootstrapRefreshIntent] = React.useState(true);

  const sectionParam = searchParams.get('section');
  const isLegacyStatisticsRoute = sectionParam === 'statistics';
  const tabParam = searchParams.get('tab');
  const isOverviewRoute = sectionParam === 'overview';
  const hasExplicitWorkspaceTab = isWorkspaceTab(tabParam);
  const resolvedSection = isLegacyStatisticsRoute
    ? 'stats'
    : resolvePublicWorkspaceSection(sectionParam);
  const resolvedWorkspaceTab = forcedWorkspaceTab;
  const isGuestChatSection = auth.status === 'unauthenticated' && resolvedSection === 'chat';

  React.useEffect(() => {
    setBootstrapRefreshIntent(shouldAttemptRefreshOnBootstrap());
  }, []);

  const shouldBlockOnAuthBootstrap = React.useMemo(() => {
    if (auth.status !== 'idle' && auth.status !== 'loading') return false;
    return bootstrapRefreshIntent;
  }, [auth.status, bootstrapRefreshIntent]);
  const activePublicSection = auth.status === 'loading' || auth.status === 'idle'
    ? (forcedPublicSection ?? resolvedSection ?? (isOverviewRoute ? null : 'requests'))
    : (forcedPublicSection
      ?? resolvedSection
      ?? (isOverviewRoute ? null : (auth.status === 'unauthenticated' ? 'requests' : null)));
  const resolvedPublicSection = resolvedWorkspaceTab ? null : activePublicSection;

  React.useEffect(() => {
    if (!isLegacyStatisticsRoute) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('section', 'stats');
    const nextQuery = nextParams.toString();

    router.replace(nextQuery ? `/workspace?${nextQuery}` : '/workspace', { scroll: false });
  }, [isLegacyStatisticsRoute, router, searchParams]);

  React.useEffect(() => {
    if (!hasExplicitWorkspaceTab) return;
    if (auth.status === 'authenticated') {
      router.replace(
        buildLegacyWorkspaceTabRedirectHref({
          currentSearch: searchParams,
        }),
        { scroll: false },
      );
      return;
    }
    if (auth.status !== 'unauthenticated') return;

    if (tabParam === 'my-requests' || tabParam === 'my-offers' || tabParam === 'completed-jobs') {
      router.replace(
        buildWorkspaceRequestsScopeHref({
          currentSearch: searchParams,
          scope: 'market',
        }),
        { scroll: false },
      );
      return;
    }

    router.replace(
      buildLegacyWorkspaceTabRedirectHref({
        currentSearch: searchParams,
      }),
      { scroll: false },
    );
  }, [auth.status, hasExplicitWorkspaceTab, router, searchParams, tabParam]);

  React.useEffect(() => {
    if (auth.status !== 'unauthenticated') return;
    if (resolvedSection !== 'requests') return;
    if (searchParams.get('scope') !== 'my') return;

    router.replace(
      buildWorkspaceRequestsScopeHref({
        currentSearch: searchParams,
        scope: 'market',
      }),
      { scroll: false },
    );
  }, [auth.status, resolvedSection, router, searchParams]);

  React.useEffect(() => {
    if (!isGuestChatSection) return;

    const nextQuery = searchParams.toString();
    const nextPath = nextQuery ? `/workspace?${nextQuery}` : '/workspace?section=chat';
    router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}`, { scroll: false });
  }, [isGuestChatSection, router, searchParams]);

  if (shouldBlockOnAuthBootstrap || isGuestChatSection) {
    return <LoadingScreen />;
  }

  return (
    <WorkspacePageClient
      activePublicSection={resolvedPublicSection}
      activeWorkspaceTab={resolvedWorkspaceTab}
    />
  );
}
