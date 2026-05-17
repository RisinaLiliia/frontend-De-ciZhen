'use client';

import type { ReactNode } from 'react';

import type { WorkspaceSectionRenderModel } from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { useWorkspacePublicDataFlow } from '@/features/workspace/page/useWorkspacePublicDataFlow';
import {
  buildWorkspacePublicLayoutProps,
  buildWorkspacePublicRenderMetricPayload,
} from '@/features/workspace/page/workspacePublicPresentation.model';

type WorkspacePublicDataFlowResult = ReturnType<typeof useWorkspacePublicDataFlow>;

type BuildWorkspacePublicIntroArgsParams = {
  branch: Pick<WorkspaceBranchProps, 't' | 'locale'>;
  data: Pick<
    WorkspacePublicDataFlowResult,
    | 'activePublicSection'
    | 'activeWorkspaceTab'
    | 'cityActivity'
    | 'platformSummary'
    | 'isSummaryLoading'
    | 'isSummaryError'
  >;
};

type ResolveWorkspacePublicPresentationFlowResultParams = {
  branch: Pick<WorkspaceBranchProps, 't' | 'locale' | 'isWorkspaceAuthed' | 'isAuthed'>;
  data: Pick<
    WorkspacePublicDataFlowResult,
    | 'activePublicSection'
    | 'activeWorkspaceTab'
    | 'platformRequestsTotal'
    | 'localeTag'
    | 'exploreWithSeed'
  >;
  workspaceIntroNode: ReactNode;
  publicSectionModel: WorkspaceSectionRenderModel;
};

export function buildWorkspacePublicIntroArgs({
  branch,
  data,
}: BuildWorkspacePublicIntroArgsParams) {
  return {
    branch,
    activePublicSection: data.activePublicSection,
    activeWorkspaceTab: data.activeWorkspaceTab,
    cityActivity: data.cityActivity,
    platformSummary: data.platformSummary,
    isSummaryLoading: data.isSummaryLoading,
    isSummaryError: data.isSummaryError,
  };
}

export function resolveWorkspacePublicPresentationFlowResult({
  branch,
  data,
  workspaceIntroNode,
  publicSectionModel,
}: ResolveWorkspacePublicPresentationFlowResultParams) {
  return {
    workspaceLayoutProps: buildWorkspacePublicLayoutProps({
      t: branch.t,
      locale: branch.locale,
      isWorkspaceAuthed: branch.isWorkspaceAuthed,
      activePublicSection: data.activePublicSection,
      activeWorkspaceTab: data.activeWorkspaceTab,
      workspaceIntroNode,
      publicSectionModel,
    }),
    renderMetricPayload: buildWorkspacePublicRenderMetricPayload({
      isAuthed: branch.isAuthed,
      activeWorkspaceTab: data.activeWorkspaceTab,
      activePublicSection: data.activePublicSection,
      platformRequestsTotal: data.platformRequestsTotal,
      localeTag: data.localeTag,
    }),
  };
}
