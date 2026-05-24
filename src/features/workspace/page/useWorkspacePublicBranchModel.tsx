'use client';

import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePublicDataFlow } from '@/features/workspace/page/useWorkspacePublicDataFlow';
import { useWorkspacePublicPresentationFlow } from '@/features/workspace/page/useWorkspacePublicPresentationFlow';

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
