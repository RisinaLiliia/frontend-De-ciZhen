'use client';

import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePrivateInteractions } from '@/features/workspace/page/useWorkspacePrivateInteractions';
import { useWorkspacePrivateSources } from '@/features/workspace/page/useWorkspacePrivateSources';

export function useWorkspacePrivateDataFlow({
  t,
  locale,
  auth,
  isAuthed,
  isWorkspaceAuthed,
  routeState,
}: WorkspaceBranchProps) {
  const {
    activePublicSection,
    activeWorkspaceTab,
    activeStatusFilter,
    activeFavoritesView,
    activeReviewsView,
    nextPath,
    guestLoginHref,
    onGuestLockedAction,
  } = routeState;

  const sources = useWorkspacePrivateSources({
    t,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    activePublicSection,
    activeWorkspaceTab,
    activeReviewsView,
  });

  const interactions = useWorkspacePrivateInteractions({
    t,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    authUserId: auth.user?.id,
    activeWorkspaceTab,
    nextPath,
    platformRequestsTotal: sources.platformRequestsTotal,
    myOffers: sources.myOffers,
    favoriteRequestIds: sources.favoriteRequestIds,
    requestById: sources.requestById,
    favoriteProviderLookup: sources.favoriteProviderLookup,
    providerById: sources.providerById,
  });

  return {
    activePublicSection,
    activeWorkspaceTab,
    activeStatusFilter,
    activeFavoritesView,
    activeReviewsView,
    guestLoginHref,
    onGuestLockedAction,
    ...sources,
    ...interactions,
  };
}
