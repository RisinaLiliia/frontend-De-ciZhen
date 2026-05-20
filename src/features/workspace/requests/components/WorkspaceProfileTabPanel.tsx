'use client';

import { useSearchParams } from 'next/navigation';

import { WorkspaceProfileOnboardingForm } from '@/features/profile/onboarding';
import { resolveWorkspaceViewerMode } from '../../state';

export function WorkspaceProfileTabPanel() {
  const searchParams = useSearchParams();
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));

  return <WorkspaceProfileOnboardingForm viewerMode={viewerMode} />;
}
