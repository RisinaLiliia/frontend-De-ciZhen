'use client';

import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import { useWorkspacePrivateInteractions } from '@/features/workspace/orchestration/useWorkspacePrivateInteractions';
import { useWorkspacePrivateSources } from '@/features/workspace/orchestration/useWorkspacePrivateSources';

type Options = {
  enabled?: boolean;
};

export function useWorkspacePrivateDataFlow(
  { t, locale, auth, isAuthed, isWorkspaceAuthed, routeState }: WorkspaceBranchProps,
  { enabled = true }: Options = {},
) {
  const {
    activePublicSection,
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
  } = routeState;

  const sources = useWorkspacePrivateSources({
    enabled,
    t,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    activePublicSection,
    activeWorkspaceTab,
    requestsScope,
    activeRequestsRole,
    activeRequestsState,
    activeRequestsPeriod,
    activeRequestsSort,
  });

  const interactions = useWorkspacePrivateInteractions({
    enabled,
    t,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    authUserId: auth.user?.id,
    activePublicSection,
    activeWorkspaceTab,
    requestsScope,
    nextPath,
    platformRequestsTotal: sources.platformRequestsTotal,
    favoriteRequestIds: sources.favoriteRequestIds,
    requestById: sources.requestById,
    favoriteProviderLookup: sources.favoriteProvidersState.lookup,
    providerById: sources.providerDirectoryState.byId,
  });

  return {
    activePublicSection,
    activeWorkspaceTab,
    activeStatusFilter,
    activeFavoritesView,
    requestsScope,
    activeRequestsRole,
    activeRequestsState,
    activeRequestsPeriod,
    activeRequestsSort,
    guestLoginHref,
    onGuestLockedAction,
    ...sources,
    ...interactions,
  };
}
