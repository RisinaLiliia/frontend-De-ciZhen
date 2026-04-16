'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import WorkspacePageClient from '@/features/workspace/WorkspacePageClient';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import {
  buildLegacyWorkspaceTabRedirectHref,
  buildWorkspaceRequestsScopeHref,
  isWorkspaceTab,
  type WorkspaceTab,
} from '@/features/workspace/requests';

import {
  type PublicWorkspaceSection,
  resolvePublicWorkspaceSection,
} from '@/features/workspace/shell/workspace.types';

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

  const sectionParam = searchParams.get('section');
  const tabParam = searchParams.get('tab');
  const isOverviewRoute = sectionParam === 'overview';
  const hasExplicitWorkspaceTab = isWorkspaceTab(tabParam);
  const hasLegacyRequestsTab =
    tabParam === 'my-requests' || tabParam === 'my-offers' || tabParam === 'completed-jobs';
  const resolvedSection = resolvePublicWorkspaceSection(sectionParam);
  const shouldPromoteReviewsSectionToTab =
    auth.status === 'authenticated' &&
    !forcedWorkspaceTab &&
    !hasExplicitWorkspaceTab &&
    (forcedPublicSection ?? resolvedSection) === 'reviews';
  const resolvedWorkspaceTab = shouldPromoteReviewsSectionToTab ? 'reviews' : forcedWorkspaceTab;
  const activePublicSection = auth.status === 'loading' || auth.status === 'idle'
    ? (forcedPublicSection ?? resolvedSection ?? (isOverviewRoute ? null : 'requests'))
    : (forcedPublicSection
      ?? resolvedSection
      ?? (isOverviewRoute ? null : (auth.status === 'unauthenticated' ? 'requests' : null)));
  const resolvedPublicSection = resolvedWorkspaceTab ? null : activePublicSection;

  React.useEffect(() => {
    if (!hasLegacyRequestsTab) return;
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

    router.replace(
      buildWorkspaceRequestsScopeHref({
        currentSearch: searchParams,
        scope: 'market',
      }),
      { scroll: false },
    );
  }, [auth.status, hasLegacyRequestsTab, router, searchParams]);

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

  return (
    <WorkspacePageClient
      activePublicSection={resolvedPublicSection}
      activeWorkspaceTab={resolvedWorkspaceTab}
    />
  );
}
