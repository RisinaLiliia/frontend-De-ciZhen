'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import WorkspacePageClient from '@/features/workspace/WorkspacePageClient';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { isWorkspaceTab, type WorkspaceTab } from '@/features/workspace/requests';

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
  const searchParams = useSearchParams();
  const auth = useAuthSnapshot();

  const sectionParam = searchParams.get('section');
  const tabParam = searchParams.get('tab');
  const isOverviewRoute = sectionParam === 'overview';
  const hasExplicitWorkspaceTab = isWorkspaceTab(tabParam);
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

  return (
    <WorkspacePageClient
      activePublicSection={resolvedPublicSection}
      activeWorkspaceTab={resolvedWorkspaceTab}
    />
  );
}
