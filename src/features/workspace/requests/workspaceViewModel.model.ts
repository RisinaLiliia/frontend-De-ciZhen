'use client';

import type { ComponentProps } from 'react';

import type { PublicContent } from '@/features/workspace/requests/PublicContent';
import type { WorkspaceContent } from '@/features/workspace/requests/WorkspaceContent';
import type {
  PrivateInput,
  PublicInput,
} from '@/features/workspace/requests/workspaceViewModel.types';
import type { WorkspaceStatusFilter } from '@/features/workspace/requests/workspace.types';
import { buildWorkspacePager } from '@/features/workspace/requests/workspaceViewModel.helpers';
import { buildWorkspacePrivateContentProps } from '@/features/workspace/requests/workspaceViewModel.private';
import {
  buildWorkspacePublicContentProps,
  buildWorkspacePublicFiltersProps,
} from '@/features/workspace/requests/workspaceViewModel.public';

export function buildWorkspacePrivateViewModel(params: PrivateInput): {
  workspaceContentProps: ComponentProps<typeof WorkspaceContent>;
} {
  return {
    workspaceContentProps: buildWorkspacePrivateContentProps(params),
  };
}

export function buildWorkspacePublicViewModel(params: PublicInput): {
  publicContentProps: ComponentProps<typeof PublicContent>;
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
