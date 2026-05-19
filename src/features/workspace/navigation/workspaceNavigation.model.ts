'use client';

import {
  buildLegacyWorkspaceTabRedirectHref,
} from '@/features/workspace/state';
import type {
  FavoritesView,
  WorkspaceStatusFilter,
  WorkspaceTab,
} from '@/features/workspace/state';
import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';

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
  next.set('tab', tab);
  next.set('status', 'all');
  if (tab !== 'favorites') next.delete('fav');
  next.delete('reviewRole');
  const redirectedHref = buildLegacyWorkspaceTabRedirectHref({
    currentSearch: next,
  });
  return redirectedHref.startsWith('/workspace')
    ? redirectedHref.replace('/workspace', workspacePath)
    : redirectedHref;
}

export function buildWorkspaceStatusFilterHref({
  search,
  workspacePath,
  activeWorkspaceTab,
  status,
}: BuildWorkspaceStatusFilterHrefArgs) {
  const next = new URLSearchParams(search);
  next.set('tab', activeWorkspaceTab);
  next.set('status', status);
  next.delete('reviewRole');
  const redirectedHref = buildLegacyWorkspaceTabRedirectHref({
    currentSearch: next,
  });
  return redirectedHref.startsWith('/workspace')
    ? redirectedHref.replace('/workspace', workspacePath)
    : redirectedHref;
}

export function buildWorkspaceFavoritesViewHref({
  search,
  workspacePath,
  view,
}: BuildWorkspaceFavoritesViewHrefArgs) {
  return buildWorkspaceHref({
    currentSearch: search,
    section: view === 'providers' ? 'providers' : 'requests',
    patch: view === 'providers'
      ? undefined
      : { scope: 'market' },
    removeKeys: ['tab', 'status', 'reviewRole', 'fav'],
  }).replace('/workspace', workspacePath);
}
