'use client';

import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePrivateDataFlow } from '@/features/workspace/page/useWorkspacePrivateDataFlow';
import { useWorkspacePrivatePresentationFlow } from '@/features/workspace/page/useWorkspacePrivatePresentationFlow';

export function useWorkspacePrivateBranchModel(branch: WorkspaceBranchProps) {
  const data = useWorkspacePrivateDataFlow(branch);
  return useWorkspacePrivatePresentationFlow({
    branch,
    data,
  });
}
