'use client';

import type { ComponentProps } from 'react';

import { WorkspaceRequestsActionRail } from '@/features/workspace/ai-rail/WorkspaceRequestsActionRail';
import {
  buildRequestsWorkspaceDecisionRailProps,
} from '@/features/workspace/requests/requestsWorkspaceSurface.model';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { WorkspaceRequestsResponseDto } from '@/lib/api/dto/workspace';

export function buildWorkspacePublicRequestsAsideProps(params: {
  locale: WorkspaceBranchProps['locale'];
  panel: NonNullable<WorkspaceRequestsResponseDto['decisionPanel']>;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
}): ComponentProps<typeof WorkspaceRequestsActionRail> {
  return buildRequestsWorkspaceDecisionRailProps({
    locale: params.locale,
    panel: params.panel,
    mode: 'default',
    activeRequestId: null,
    onStartDecisionMode: params.onStartDecisionMode,
    onOpenQueueItem: params.onOpenQueueItem,
    variant: 'market',
  });
}
