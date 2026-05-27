'use client';

import type {
  PrivateInput,
  PublicInput,
} from '@/features/workspace/presentation/workspaceViewModel.types';
import type { WorkspaceStatusFilter } from '@/features/workspace/state';
import type { PublicContentProps } from '@/features/workspace/requests/PublicContent';
import type { WorkspaceContentProps } from '@/features/workspace/requests/workspaceContent.types';
import { buildWorkspacePager } from '@/features/workspace/presentation/workspaceViewModel.helpers';
import { buildWorkspacePrivateContentProps } from '@/features/workspace/presentation/workspaceViewModel.private';
import {
  buildWorkspacePublicContentProps,
  buildWorkspacePublicFiltersProps,
} from '@/features/workspace/presentation/workspaceViewModel.public';

export function buildWorkspacePrivateViewModel(params: PrivateInput): {
  workspaceContentProps: WorkspaceContentProps;
} {
  return {
    workspaceContentProps: buildWorkspacePrivateContentProps(params),
  };
}

export function buildWorkspacePublicViewModel(params: PublicInput): {
  publicContentProps: PublicContentProps;
} {
  const onStatusFilterChange = (status: string) => params.setStatusFilter(status as WorkspaceStatusFilter);
  const { onPrevPage, onNextPage } = buildWorkspacePager({
    page: params.page,
    totalPages: params.totalPages,
    setPage: params.setPage,
  });
  const filtersProps = buildWorkspacePublicFiltersProps(params);

  return {
    publicContentProps: buildWorkspacePublicContentProps({
      ...params,
      filtersProps,
      onStatusFilterChange,
      onPrevPage,
      onNextPage,
    }),
  };
}
