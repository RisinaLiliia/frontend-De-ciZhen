'use client';

import * as React from 'react';

import type { WorkspaceSectionRenderModel } from '@/features/workspace';
import { WorkspacePublicIntro } from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import {
  buildWorkspaceExploreSectionModel,
  buildWorkspaceLegalSectionModel,
  buildWorkspacePublicRequestsSectionModel,
  resolveWorkspaceExploreSection,
} from '@/features/workspace/orchestration/sections/workspaceSectionAdapters';
import { useWorkspacePublicDataFlow } from '@/features/workspace/orchestration/useWorkspacePublicDataFlow';
import { buildWorkspacePublicIntroProps } from '@/features/workspace/orchestration/workspacePublicBranch.model';
import { WorkspaceLegalIntro } from '@/features/workspace/legal';
import {
  buildWorkspacePublicIntroArgs,
  resolveWorkspacePublicPresentationFlowResult,
} from '@/features/workspace/orchestration/workspacePublicPresentationFlow.model';
import { useWorkspacePublicRequestsSection } from '@/features/workspace/orchestration/useWorkspacePublicRequestsSection';

type UseWorkspacePublicPresentationFlowParams = {
  branch: WorkspaceBranchProps;
  data: ReturnType<typeof useWorkspacePublicDataFlow>;
};

export function useWorkspacePublicPresentationFlow({
  branch,
  data,
}: UseWorkspacePublicPresentationFlowParams) {
  const isRequestsSection = data.activePublicSection === 'requests';
  const legalSection =
    data.activePublicSection === 'privacy' || data.activePublicSection === 'cookies'
      ? data.activePublicSection
      : null;
  const { publicMain: publicRequestsMain, publicAside: publicRequestsAside } =
    useWorkspacePublicRequestsSection({
      branch,
      enabled: isRequestsSection,
    });
  const workspaceIntroNode = React.useMemo(() => {
    if (legalSection) {
      return <WorkspaceLegalIntro section={legalSection} />;
    }

    return (
      <WorkspacePublicIntro
        {...buildWorkspacePublicIntroProps(
          buildWorkspacePublicIntroArgs({
            branch,
            data,
          }),
        )}
      />
    );
  }, [branch, data, legalSection]);
  const publicSectionModel = React.useMemo<WorkspaceSectionRenderModel>(() => {
    if (isRequestsSection) {
      return buildWorkspacePublicRequestsSectionModel({
        content: publicRequestsMain,
        aiRail: publicRequestsAside,
      });
    }

    if (legalSection) {
      return buildWorkspaceLegalSectionModel({
        section: legalSection,
      });
    }

    return buildWorkspaceExploreSectionModel({
      branch,
      section: resolveWorkspaceExploreSection(data.activePublicSection),
      explore: data.exploreWithSeed,
    });
  }, [
    branch,
    data.activePublicSection,
    data.exploreWithSeed,
    legalSection,
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
    [branch, data, publicSectionModel, workspaceIntroNode],
  );
}
