'use client';

import type { ReactNode } from 'react';

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
  publicRequestsMain?: ReactNode;
  publicRequestsAside?: ReactNode;
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
  publicRequestsMain,
  publicRequestsAside,
}: ResolveWorkspacePublicPresentationFlowResultParams) {
  return {
    workspaceLayoutProps: buildWorkspacePublicLayoutProps({
      t: branch.t,
      locale: branch.locale,
      isWorkspaceAuthed: branch.isWorkspaceAuthed,
      activePublicSection: data.activePublicSection,
      activeWorkspaceTab: data.activeWorkspaceTab,
      exploreWithSeed: data.exploreWithSeed,
      workspaceIntroNode,
      publicRequestsMain,
      publicRequestsAside,
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
