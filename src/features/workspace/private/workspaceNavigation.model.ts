'use client';

import type {
  FavoritesView,
  WorkspaceStatusFilter,
  WorkspaceTab,
} from '@/features/workspace/requests';

type BuildWorkspaceNavigationHrefArgs = {
  search: string;
  workspacePath: string;
};

type BuildWorkspaceTabHrefArgs = BuildWorkspaceNavigationHrefArgs & {
  tab: WorkspaceTab;
};

type BuildWorkspaceStatusFilterHrefArgs = BuildWorkspaceNavigationHrefArgs & {
  activeWorkspaceTab: WorkspaceTab;
  status: WorkspaceStatusFilter;
};

type BuildWorkspaceFavoritesViewHrefArgs = BuildWorkspaceNavigationHrefArgs & {
  view: FavoritesView;
};

function toWorkspaceHref(workspacePath: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${workspacePath}?${query}` : workspacePath;
}

export function buildWorkspaceCurrentHref({
  search,
  workspacePath,
}: BuildWorkspaceNavigationHrefArgs) {
  return search ? `${workspacePath}?${search}` : workspacePath;
}

export function buildWorkspaceTabHref({
  search,
  workspacePath,
  tab,
}: BuildWorkspaceTabHrefArgs) {
  const next = new URLSearchParams(search);
  next.delete('section');
  next.set('tab', tab);
  next.set('status', 'all');
  if (tab !== 'favorites') next.delete('fav');
  next.delete('reviewRole');
  return toWorkspaceHref(workspacePath, next);
}

export function buildWorkspaceStatusFilterHref({
  search,
  workspacePath,
  activeWorkspaceTab,
  status,
}: BuildWorkspaceStatusFilterHrefArgs) {
  const next = new URLSearchParams(search);
  next.delete('section');
  next.set('tab', activeWorkspaceTab);
  next.set('status', status);
  next.delete('reviewRole');
  return toWorkspaceHref(workspacePath, next);
}

export function buildWorkspaceFavoritesViewHref({
  search,
  workspacePath,
  view,
}: BuildWorkspaceFavoritesViewHrefArgs) {
  const next = new URLSearchParams(search);
  next.delete('section');
  next.set('tab', 'favorites');
  next.set('fav', view);
  next.delete('reviewRole');
  return toWorkspaceHref(workspacePath, next);
}
