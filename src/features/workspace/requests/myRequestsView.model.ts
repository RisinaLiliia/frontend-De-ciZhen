'use client';

import {
  buildWorkspaceRequestsViewModelFromResponse,
  type WorkspaceRequestsSummaryItem,
  type WorkspaceRequestsViewCard,
  type WorkspaceRequestsViewModel,
} from '@/features/workspace/requests/workspaceRequestsView.model';

export type MyRequestsViewCard = WorkspaceRequestsViewCard;
export type MyRequestsSummaryItem = WorkspaceRequestsSummaryItem;
export type MyRequestsViewModel = WorkspaceRequestsViewModel;

export function buildMyRequestsViewModelFromResponse(
  ...args: Parameters<typeof buildWorkspaceRequestsViewModelFromResponse>
) {
  return buildWorkspaceRequestsViewModelFromResponse(...args);
}
