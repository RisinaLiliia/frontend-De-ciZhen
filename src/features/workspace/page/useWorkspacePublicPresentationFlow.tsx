'use client';

import * as React from 'react';

import { WorkspacePublicIntro } from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePublicDataFlow } from '@/features/workspace/page/useWorkspacePublicDataFlow';
import {
  buildWorkspacePublicIntroProps,
} from '@/features/workspace/page/workspacePublicBranch.model';
import {
  buildWorkspacePublicIntroArgs,
  resolveWorkspacePublicPresentationFlowResult,
} from '@/features/workspace/page/workspacePublicPresentationFlow.model';
import { useWorkspacePublicRequestsSection } from '@/features/workspace/page/useWorkspacePublicRequestsSection';

type UseWorkspacePublicPresentationFlowParams = {
  branch: WorkspaceBranchProps;
  data: ReturnType<typeof useWorkspacePublicDataFlow>;
};

export function useWorkspacePublicPresentationFlow({
  branch,
  data,
}: UseWorkspacePublicPresentationFlowParams) {
  const isRequestsSection = data.activePublicSection === 'requests';
  const {
    publicMain: publicRequestsMain,
    publicAside: publicRequestsAside,
  } = useWorkspacePublicRequestsSection({
    branch,
    enabled: isRequestsSection,
  });
  const workspaceIntroNode = React.useMemo(
    () => (
      <WorkspacePublicIntro
        {...buildWorkspacePublicIntroProps(
          buildWorkspacePublicIntroArgs({
            branch,
            data,
          }),
        )}
      />
    ),
    [branch, data],
  );

  return React.useMemo(
    () =>
      resolveWorkspacePublicPresentationFlowResult({
        branch,
        data,
        workspaceIntroNode,
        publicRequestsMain,
        publicRequestsAside,
      }),
    [
      branch,
      data,
      publicRequestsAside,
      publicRequestsMain,
      workspaceIntroNode,
    ],
  );
}
