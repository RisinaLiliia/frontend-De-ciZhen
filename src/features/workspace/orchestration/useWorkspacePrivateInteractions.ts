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
} from '@/features/workspace/orchestration/workspacePrivateInteractions.model';

type InteractionsParams = WorkspacePrivateInteractionsParams;

export function useWorkspacePrivateInteractions({
  enabled = true,
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
  favoriteRequestIds,
  requestById,
  favoriteProviderLookup,
  providerById,
}: InteractionsParams & {
  enabled?: boolean;
}): WorkspacePrivateInteractionsResult {
  const router = useRouter();
  const qc = useQueryClient();
  const shouldBuildRequestInteractions =
    enabled && shouldBuildWorkspacePrivateRequestInteractions(activeWorkspaceTab);
  const shouldBuildRequestFavoriteInteractions = enabled && shouldBuildWorkspacePrivateRequestFavoriteInteractions({
    activePublicSection,
    activeWorkspaceTab,
    requestsScope,
  });
  const shouldBuildProviderInteractions = enabled && shouldBuildWorkspacePrivateProviderInteractions({
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
      isWorkspaceAuthed: enabled && isWorkspaceAuthed,
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
