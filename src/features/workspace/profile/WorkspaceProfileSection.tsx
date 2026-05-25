'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { resolveWorkspaceViewerMode } from '@/features/workspace/state';

const WorkspaceProfileOnboardingPanel = dynamic(
  () => import('@/features/workspace/profile/onboarding').then((mod) => mod.WorkspaceProfileOnboardingForm),
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
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));

  return (
    <div className="workspace-profile-section workspace-explore-grid workspace-explore-grid--single">
      <div>
        <WorkspaceProfileOnboardingPanel viewerMode={viewerMode} />
      </div>
    </div>
  );
});
