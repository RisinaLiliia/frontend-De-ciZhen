'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import WorkspacePageClient from '@/features/workspace/WorkspacePageClient';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import type { WorkspaceTab } from '@/features/workspace/requests';

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
  const resolvedSection = resolvePublicWorkspaceSection(sectionParam);
  const activePublicSection = auth.status === 'loading' || auth.status === 'idle'
    ? (forcedPublicSection ?? resolvedSection ?? 'requests')
    : (forcedPublicSection
      ?? resolvedSection
      ?? (auth.status === 'unauthenticated' ? 'requests' : null));

  return (
    <WorkspacePageClient
      activePublicSection={activePublicSection}
      activeWorkspaceTab={forcedWorkspaceTab}
    />
  );
}
