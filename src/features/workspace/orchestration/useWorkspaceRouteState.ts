'use client';

import * as React from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import {
  resolveFavoritesView,
  resolveStatusFilter,
  type WorkspaceTab,
  resolveWorkspaceRequestsPeriod,
  resolveWorkspaceRequestsRole,
  resolveWorkspaceRequestsScope,
  resolveWorkspaceRequestsState,
} from '@/features/workspace/state';
import {
  type PublicWorkspaceSection,
} from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { resolveWorkspaceRouteCompatibility } from '@/features/workspace/navigation/workspaceRouteCompatibility';
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
  const routeCompatibility = React.useMemo(
    () => resolveWorkspaceRouteCompatibility({
      searchParams,
      authStatus: isAuthed ? 'authenticated' : 'unauthenticated',
    }),
    [isAuthed, searchParams],
  );
  const canonicalSearchParams = routeCompatibility.canonicalSearchParams;
  const hasExplicitWorkspaceTab = routeCompatibility.hasExplicitWorkspaceTab;
  const resolvedPublicSection = forcedPublicSection ?? routeCompatibility.publicSection;
  const normalizedPublicSection = resolvedPublicSection === 'overview' ? null : resolvedPublicSection;
  const requestsScope = resolveWorkspaceRequestsScope(canonicalSearchParams.get('scope'), isAuthed);
  const isRequestsSection =
    !forcedWorkspaceTab && !hasExplicitWorkspaceTab && normalizedPublicSection === 'requests';
  const isPrivateRequestsScope = isRequestsSection && requestsScope === 'my';
  const isChatSection = normalizedPublicSection === 'chat';
  const isActionsSection = normalizedPublicSection === 'actions';
  const isSettingsSection = normalizedPublicSection === 'settings';
  const isHelpSection = normalizedPublicSection === 'help';
  const isAuthedShellSection =
    isAuthed &&
    (normalizedPublicSection === 'providers' ||
      normalizedPublicSection === 'stats' ||
      normalizedPublicSection === 'actions' ||
      normalizedPublicSection === 'profile');

  const activePublicSection =
    forcedWorkspaceTab || hasExplicitWorkspaceTab ? null : normalizedPublicSection;
  const isWorkspacePublicSection =
    activePublicSection !== null &&
    !isPrivateRequestsScope &&
    !isChatSection &&
    !isActionsSection &&
    !isSettingsSection &&
    !isHelpSection &&
    !isAuthedShellSection;

  const activeWorkspaceTab = React.useMemo(
    () => forcedWorkspaceTab ?? routeCompatibility.activeWorkspaceTab,
    [forcedWorkspaceTab, routeCompatibility.activeWorkspaceTab],
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
    () => resolveWorkspaceRequestsRole(canonicalSearchParams.get('role')),
    [canonicalSearchParams],
  );
  const activeRequestsState = React.useMemo(
    () => resolveWorkspaceRequestsState(canonicalSearchParams.get('state')),
    [canonicalSearchParams],
  );
  const activeRequestsPeriod = React.useMemo(
    () => resolveWorkspaceRequestsPeriod(canonicalSearchParams.get('period') ?? canonicalSearchParams.get('range')),
    [canonicalSearchParams],
  );
  const activeRequestsSort = React.useMemo(
    () => canonicalSearchParams.get('sort'),
    [canonicalSearchParams],
  );

  const nextPath = React.useMemo(() => {
    const nextParams = new URLSearchParams(canonicalSearchParams.toString());
    WORKSPACE_OVERLAY_QUERY_KEYS.forEach((key) => nextParams.delete(key));
    const qs = nextParams.toString();
    return `${workspacePath}${qs ? `?${qs}` : ''}`;
  }, [canonicalSearchParams, workspacePath]);

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
