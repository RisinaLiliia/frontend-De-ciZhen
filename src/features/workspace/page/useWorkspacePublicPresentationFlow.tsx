'use client';

import * as React from 'react';

import type { WorkspaceSectionRenderModel } from '@/features/workspace';
import { WorkspacePublicIntro } from '@/features/workspace';
import { WorkspaceExploreSection } from '@/features/workspace/requests';
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
  const publicSectionModel = React.useMemo<WorkspaceSectionRenderModel>(() => {
    if (isRequestsSection) {
      return {
        section: 'requests',
        content: publicRequestsMain,
        aiRail: publicRequestsAside,
        layout: 'withRail',
      };
    }

    if (!data.exploreWithSeed) {
      return {
        section: data.activePublicSection ?? 'requests',
        content: null,
        layout: 'singleColumn',
      };
    }

    return {
      section: data.activePublicSection ?? 'requests',
      content: (
        <WorkspaceExploreSection
          activeSection={data.activePublicSection ?? 'requests'}
          isWorkspaceAuthed={branch.isWorkspaceAuthed}
          t={branch.t}
          locale={branch.locale}
          onListDensityChange={data.exploreWithSeed.setExploreListDensity}
          exploreListDensity={data.exploreWithSeed.exploreListDensity}
          sidebarNearbyLimit={data.exploreWithSeed.sidebarNearbyLimit}
          sidebarTopProvidersLimit={data.exploreWithSeed.sidebarTopProvidersLimit}
          sidebarProofCases={data.exploreWithSeed.sidebarProofCases}
          proofIndex={data.exploreWithSeed.proofIndex}
          trustPanelClassName={data.exploreWithSeed.trustPanelClassName}
          initialPublicRequests={data.exploreWithSeed.initialPublicRequests}
          preferInitialPublicRequests={data.exploreWithSeed.preferInitialPublicRequests}
          initialPublicRequestsLoading={data.exploreWithSeed.initialPublicRequestsLoading}
          initialPublicRequestsError={data.exploreWithSeed.initialPublicRequestsError}
          renderIntro={false}
        />
      ),
      layout: 'singleColumn',
    };
  }, [
    branch.isWorkspaceAuthed,
    branch.locale,
    branch.t,
    data.activePublicSection,
    data.exploreWithSeed,
    isRequestsSection,
    publicRequestsAside,
    publicRequestsMain,
  ]);

  return React.useMemo(
    () =>
      resolveWorkspacePublicPresentationFlowResult({
        branch,
        data,
        workspaceIntroNode,
        publicSectionModel,
      }),
    [
      branch,
      data,
      publicSectionModel,
      workspaceIntroNode,
    ],
  );
}
