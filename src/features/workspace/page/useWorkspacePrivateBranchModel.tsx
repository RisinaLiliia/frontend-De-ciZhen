'use client';

import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePrivateDataFlow } from '@/features/workspace/page/useWorkspacePrivateDataFlow';
import { useWorkspacePrivatePresentationFlow } from '@/features/workspace/page/useWorkspacePrivatePresentationFlow';

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
