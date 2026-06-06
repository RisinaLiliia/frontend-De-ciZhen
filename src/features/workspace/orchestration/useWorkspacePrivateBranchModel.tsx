'use client';

import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import { useWorkspacePrivateDataFlow } from '@/features/workspace/orchestration/useWorkspacePrivateDataFlow';
import { useWorkspacePrivatePresentationFlow } from '@/features/workspace/orchestration/useWorkspacePrivatePresentationFlow';

type Options = {
  enabled?: boolean;
};

export function useWorkspacePrivateBranchModel(
  branch: WorkspaceBranchProps,
  { enabled = true }: Options = {},
) {
  const data = useWorkspacePrivateDataFlow(branch, { enabled });
  return useWorkspacePrivatePresentationFlow({
    branch,
    data,
  });
}
