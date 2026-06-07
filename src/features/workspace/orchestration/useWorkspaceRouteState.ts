'use client';

import * as React from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import {
  isWorkspaceTab,
  resolveFavoritesView,
  resolveStatusFilter,
  type WorkspaceTab,
  resolveWorkspaceTab,
  resolveWorkspaceRequestsPeriod,
  resolveWorkspaceRequestsRole,
  resolveWorkspaceRequestsScope,
  resolveWorkspaceRequestsState,
} from '@/features/workspace/state';
import {
  type PublicWorkspaceSection,
  resolvePublicWorkspaceSection,
} from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import {
  WORKSPACE_REQUEST_CREATE_QUERY_KEY,
  WORKSPACE_REQUEST_ID_QUERY_KEY,
  WORKSPACE_REQUEST_INTENT_QUERY_KEY,
  WORKSPACE_REQUEST_PANEL_QUERY_KEY,
  WORKSPACE_REQUEST_PROFILE_QUERY_KEY,
} from '@/features/workspace/requests/workspaceRequestRoute.model';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type Translator = (key: I18nKey) => string;

const WORKSPACE_OVERLAY_QUERY_KEYS = [
  WORKSPACE_REQUEST_CREATE_QUERY_KEY,
  WORKSPACE_REQUEST_ID_QUERY_KEY,
  WORKSPACE_REQUEST_INTENT_QUERY_KEY,
  WORKSPACE_REQUEST_PANEL_QUERY_KEY,
  WORKSPACE_REQUEST_PROFILE_QUERY_KEY,
] as const;

type Args = {
  forcedPublicSection?: PublicWorkspaceSection | null;
  forcedWorkspaceTab?: WorkspaceTab | null;
  isAuthed?: boolean;
  searchParams: ReadonlyURLSearchParams;
  workspacePath: string;
  t: Translator;
};

export function useWorkspaceRouteState({
  forcedPublicSection,
  forcedWorkspaceTab,
  isAuthed = false,
  searchParams,
  workspacePath,
  t,
}: Args) {
  const tabParam = searchParams.get('tab');
  const hasExplicitWorkspaceTab = isWorkspaceTab(tabParam);
  const sectionParam = searchParams.get('section');
  const resolvedPublicSection = forcedPublicSection ?? resolvePublicWorkspaceSection(sectionParam);
  const requestsScope = resolveWorkspaceRequestsScope(searchParams.get('scope'), isAuthed);
  const isRequestsSection =
    !forcedWorkspaceTab && !hasExplicitWorkspaceTab && resolvedPublicSection === 'requests';
  const isPrivateRequestsScope = isRequestsSection && requestsScope === 'my';
  const isChatSection = resolvedPublicSection === 'chat';
  const isSettingsSection = resolvedPublicSection === 'settings';
  const isHelpSection = resolvedPublicSection === 'help';
  const isAuthedShellSection =
    isAuthed &&
    (resolvedPublicSection === 'providers' ||
      resolvedPublicSection === 'stats' ||
      resolvedPublicSection === 'profile');

  const activePublicSection =
    forcedWorkspaceTab || hasExplicitWorkspaceTab ? null : resolvedPublicSection;
  const isWorkspacePublicSection =
    activePublicSection !== null &&
    !isPrivateRequestsScope &&
    !isChatSection &&
    !isSettingsSection &&
    !isHelpSection &&
    !isAuthedShellSection;

  const activeWorkspaceTab = React.useMemo(
    () => forcedWorkspaceTab ?? resolveWorkspaceTab(tabParam),
    [forcedWorkspaceTab, tabParam],
  );
  const activeStatusFilter = React.useMemo(
    () => resolveStatusFilter(searchParams.get('status')),
    [searchParams],
  );
  const activeFavoritesView = React.useMemo(
    () => resolveFavoritesView(searchParams.get('fav')),
    [searchParams],
  );
  const activeRequestsRole = React.useMemo(
    () => resolveWorkspaceRequestsRole(searchParams.get('role')),
    [searchParams],
  );
  const activeRequestsState = React.useMemo(
    () => resolveWorkspaceRequestsState(searchParams.get('state')),
    [searchParams],
  );
  const activeRequestsPeriod = React.useMemo(
    () => resolveWorkspaceRequestsPeriod(searchParams.get('period') ?? searchParams.get('range')),
    [searchParams],
  );
  const activeRequestsSort = React.useMemo(() => searchParams.get('sort'), [searchParams]);

  const nextPath = React.useMemo(() => {
    const nextParams = new URLSearchParams(searchParams?.toString());
    WORKSPACE_OVERLAY_QUERY_KEYS.forEach((key) => nextParams.delete(key));
    const qs = nextParams.toString();
    return `${workspacePath}${qs ? `?${qs}` : ''}`;
  }, [searchParams, workspacePath]);

  const guestLoginHref = React.useMemo(
    () => `/auth/login?next=${encodeURIComponent(nextPath)}`,
    [nextPath],
  );

  const onGuestLockedAction = React.useCallback(() => {
    toast.message(t(I18N_KEYS.requestDetails.loginRequired));
  }, [t]);

  return {
    activePublicSection,
    isWorkspacePublicSection,
    activeWorkspaceTab,
    activeStatusFilter,
    activeFavoritesView,
    requestsScope,
    activeRequestsRole,
    activeRequestsState,
    activeRequestsPeriod,
    activeRequestsSort,
    nextPath,
    guestLoginHref,
    onGuestLockedAction,
  };
}
