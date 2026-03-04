'use client';

import * as React from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import {
  resolveFavoritesView,
  resolveReviewsView,
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
  const activePublicSection = forcedWorkspaceTab
    ? null
    : (forcedPublicSection ?? resolvePublicWorkspaceSection(searchParams.get('section')));
  const isWorkspacePublicSection = activePublicSection !== null;

  const activeWorkspaceTab = React.useMemo(
    () => forcedWorkspaceTab ?? resolveWorkspaceTab(searchParams.get('tab')),
    [forcedWorkspaceTab, searchParams],
  );
  const activeStatusFilter = React.useMemo(
    () => resolveStatusFilter(searchParams.get('status')),
    [searchParams],
  );
  const activeFavoritesView = React.useMemo(
    () => resolveFavoritesView(searchParams.get('fav')),
    [searchParams],
  );
  const activeReviewsView = React.useMemo(
    () => resolveReviewsView(searchParams.get('reviewRole')),
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
    activeReviewsView,
    nextPath,
    guestLoginHref,
    onGuestLockedAction,
  };
}
