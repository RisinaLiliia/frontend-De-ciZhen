'use client';

import { useSearchParams } from 'next/navigation';

import { WorkspaceProfileOnboardingForm } from '@/features/workspace/requests/WorkspaceProfileOnboardingForm';
import { resolveWorkspaceViewerMode } from '@/features/workspace/state';

export function WorkspaceProfilePage() {
  const searchParams = useSearchParams();
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));

  return <WorkspaceProfileOnboardingForm viewerMode={viewerMode} />;
}
