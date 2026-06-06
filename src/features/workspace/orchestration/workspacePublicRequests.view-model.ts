'use client';

import type { ComponentProps } from 'react';

import { WorkspaceRequestsActionRail } from '@/features/workspace/ai-rail/WorkspaceRequestsActionRail';
import {
  buildRequestsWorkspaceDecisionRailProps,
} from '@/features/workspace/requests/requestsWorkspaceSurface.model';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import type { WorkspaceRequestsResponseDto } from '@/lib/api/dto/workspace';

export function buildWorkspacePublicRequestsAsideProps(params: {
  locale: WorkspaceBranchProps['locale'];
  summaryItems?: WorkspaceRequestsResponseDto['summary']['items'] | null;
  panel: NonNullable<WorkspaceRequestsResponseDto['decisionPanel']>;
  sidePanel?: WorkspaceRequestsResponseDto['sidePanel'];
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
}): ComponentProps<typeof WorkspaceRequestsActionRail> {
  return buildRequestsWorkspaceDecisionRailProps({
    locale: params.locale,
    summaryItems: params.summaryItems,
    panel: params.panel,
    sidePanel: params.sidePanel ?? null,
    mode: 'default',
    activeRequestId: null,
    onStartDecisionMode: params.onStartDecisionMode,
    onOpenQueueItem: params.onOpenQueueItem,
    variant: 'market',
  });
}
