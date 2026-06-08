'use client';

import * as React from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import {
  isWorkspaceTab,
  resolveWorkspaceRequestsPeriod,
  resolveWorkspaceRequestsRole,
  resolveWorkspaceRequestsScope,
  resolveWorkspaceRequestsState,
  resolveFavoritesView,
  resolveStatusFilter,
  type WorkspaceTab,
  resolveWorkspaceTab,
} from '@/features/workspace/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import {
  type PublicWorkspaceSection,
  resolvePublicWorkspaceSection,
} from '@/features/workspace/shell/workspace.types';

type Translator = (key: I18nKey) => string;

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
  const isRequestsSection = !forcedWorkspaceTab && !hasExplicitWorkspaceTab && resolvedPublicSection === 'requests';
  const isPrivateRequestsScope = isRequestsSection && requestsScope === 'my';

  const activePublicSection = forcedWorkspaceTab || hasExplicitWorkspaceTab
    ? null
    : resolvedPublicSection;
  const isWorkspacePublicSection = activePublicSection !== null && !isPrivateRequestsScope;

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
  const activeRequestsSort = React.useMemo(
    () => searchParams.get('sort'),
    [searchParams],
  );

  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
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
