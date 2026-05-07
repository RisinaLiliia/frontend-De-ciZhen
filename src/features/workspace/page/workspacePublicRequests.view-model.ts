'use client';

import type { ComponentProps } from 'react';

import { RequestsExplorerRequestsContent } from '@/components/requests/RequestsExplorerRequestsContent';
import { RequestsPrivateActionRail } from '@/features/workspace/requests';
import {
  buildRequestsWorkspaceDecisionRailProps,
  buildRequestsWorkspaceSummaryStripProps,
} from '@/features/workspace/requests/requestsWorkspaceSurface.model';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { WorkspaceRequestsResponseDto } from '@/lib/api/dto/workspace';

export function buildWorkspacePublicRequestsSummaryStripProps(params: {
  locale: WorkspaceBranchProps['locale'];
  items: NonNullable<NonNullable<WorkspaceRequestsResponseDto['summary']>['items']>;
  onSelect: (key: string) => void;
}) {
  return buildRequestsWorkspaceSummaryStripProps({
    locale: params.locale,
    items: params.items,
    onSelect: params.onSelect,
    variant: 'market',
  });
}

export function buildWorkspacePublicRequestsListProps(
  props: ComponentProps<typeof RequestsExplorerRequestsContent>,
): ComponentProps<typeof RequestsExplorerRequestsContent> {
  return props;
}

export function buildWorkspacePublicRequestsAsideProps(params: {
  locale: WorkspaceBranchProps['locale'];
  panel: NonNullable<WorkspaceRequestsResponseDto['decisionPanel']>;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
}): ComponentProps<typeof RequestsPrivateActionRail> {
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
