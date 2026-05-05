'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  usePublicRequestsSeenTotal,
  useWorkspaceActions,
  useWorkspaceFavoriteToggles,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  useWorkspaceTabPersistence,
} from '@/features/workspace';
import {
  buildWorkspacePrivateActionsArgs,
  buildWorkspacePrivateFavoriteToggleArgs,
  buildWorkspacePrivateNavigationArgs,
  buildWorkspacePrivateSeenTotalArgs,
  buildWorkspacePrivateTabPersistenceArgs,
  resolveWorkspacePrivateInteractionsResult,
  shouldBuildWorkspacePrivateProviderInteractions,
  shouldBuildWorkspacePrivateRequestFavoriteInteractions,
  shouldBuildWorkspacePrivateRequestInteractions,
  type WorkspacePrivateInteractionsParams,
  type WorkspacePrivateInteractionsResult,
} from '@/features/workspace/page/workspacePrivateInteractions.model';

type InteractionsParams = WorkspacePrivateInteractionsParams;

export function useWorkspacePrivateInteractions({
  t,
  locale,
  isAuthed,
  isWorkspaceAuthed,
  authUserId,
  activePublicSection,
  activeWorkspaceTab,
  requestsScope = 'market',
  nextPath,
  platformRequestsTotal,
  myOffers,
  favoriteRequestIds,
  requestById,
  favoriteProviderLookup,
  providerById,
}: InteractionsParams): WorkspacePrivateInteractionsResult {
  const router = useRouter();
  const qc = useQueryClient();
  const shouldBuildRequestInteractions = shouldBuildWorkspacePrivateRequestInteractions(activeWorkspaceTab);
  const shouldBuildRequestFavoriteInteractions = shouldBuildWorkspacePrivateRequestFavoriteInteractions({
    activePublicSection,
    activeWorkspaceTab,
    requestsScope,
  });
  const shouldBuildProviderInteractions = shouldBuildWorkspacePrivateProviderInteractions({
    activePublicSection,
    requestsScope,
  });

  const favoriteToggles = useWorkspaceFavoriteToggles(
    buildWorkspacePrivateFavoriteToggleArgs({
      includeRequestToggle: shouldBuildRequestFavoriteInteractions,
      includeProviderToggle: shouldBuildProviderInteractions,
      isAuthed,
      nextPath,
      router,
      t,
      qc,
      favoriteRequestIds,
      requestById,
      favoriteProviderLookup,
      providerById,
    }),
  );

  const actions = useWorkspaceActions(
    buildWorkspacePrivateActionsArgs({
      enabled: shouldBuildRequestInteractions,
      isAuthed,
      myOffers,
      t,
      qc,
      router,
    }),
  );

  const formatters = useWorkspaceFormatters(locale);

  const { markPublicRequestsSeen } = usePublicRequestsSeenTotal(
    buildWorkspacePrivateSeenTotalArgs({
      isAuthed,
      authUserId,
      platformRequestsTotal,
    }),
  );

  useWorkspaceTabPersistence(
    buildWorkspacePrivateTabPersistenceArgs({
      isWorkspaceAuthed,
      activeWorkspaceTab,
    }),
  );

  const navigation = useWorkspaceNavigation(
    buildWorkspacePrivateNavigationArgs({
      activeWorkspaceTab,
    }),
  );

  return resolveWorkspacePrivateInteractionsResult({
    favoriteToggles,
    actions,
    formatters,
    markPublicRequestsSeen,
    navigation,
  });
}
