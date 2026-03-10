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
  searchParams: ReadonlyURLSearchParams;
  workspacePath: string;
  t: Translator;
};

export function useWorkspaceRouteState({
  forcedPublicSection,
  forcedWorkspaceTab,
  searchParams,
  workspacePath,
  t,
}: Args) {
  const tabParam = searchParams.get('tab');
  const hasExplicitWorkspaceTab = isWorkspaceTab(tabParam);
  const sectionParam = searchParams.get('section');

  const activePublicSection = forcedWorkspaceTab || hasExplicitWorkspaceTab
    ? null
    : (forcedPublicSection ?? resolvePublicWorkspaceSection(sectionParam));
  const isWorkspacePublicSection = activePublicSection !== null;

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
    nextPath,
    guestLoginHref,
    onGuestLockedAction,
  };
}
