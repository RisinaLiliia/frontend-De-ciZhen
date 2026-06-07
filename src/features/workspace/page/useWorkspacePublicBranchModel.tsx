'use client';

import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePublicDataFlow } from '@/features/workspace/page/useWorkspacePublicDataFlow';
import { useWorkspacePublicPresentationFlow } from '@/features/workspace/page/useWorkspacePublicPresentationFlow';

export function useWorkspacePublicBranchModel(branch: WorkspaceBranchProps) {
  const data = useWorkspacePublicDataFlow(branch);
  return useWorkspacePublicPresentationFlow({
    branch,
    data,
  });
}
