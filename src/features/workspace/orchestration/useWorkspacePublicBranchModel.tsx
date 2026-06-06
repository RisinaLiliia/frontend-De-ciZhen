'use client';

import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import { useWorkspacePublicDataFlow } from '@/features/workspace/orchestration/useWorkspacePublicDataFlow';
import { useWorkspacePublicPresentationFlow } from '@/features/workspace/orchestration/useWorkspacePublicPresentationFlow';

type Options = {
  enabled?: boolean;
};

export function useWorkspacePublicBranchModel(
  branch: WorkspaceBranchProps,
  { enabled = true }: Options = {},
) {
  const data = useWorkspacePublicDataFlow(branch, { enabled });
  return useWorkspacePublicPresentationFlow({
    branch,
    data,
  });
}
