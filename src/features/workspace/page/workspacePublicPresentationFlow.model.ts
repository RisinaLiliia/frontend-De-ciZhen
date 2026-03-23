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
  branch: Pick<WorkspaceBranchProps, 't' | 'locale' | 'isPersonalized'>;
  data: Pick<
    WorkspacePublicDataFlowResult,
    | 'activePublicSection'
    | 'activityProgress'
    | 'personalNavItems'
    | 'insightText'
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
};

export function buildWorkspacePublicIntroArgs({
  branch,
  data,
}: BuildWorkspacePublicIntroArgsParams) {
  return {
    branch,
    activePublicSection: data.activePublicSection,
    state: {
      activityProgress: data.activityProgress,
      personalNavItems: data.personalNavItems,
      insightText: data.insightText,
    },
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
