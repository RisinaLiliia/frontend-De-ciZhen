'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  useWorkspaceActions,
  useWorkspaceFavoriteToggles,
  useWorkspaceFormatters,
} from '@/features/workspace';
import {
  buildWorkspacePrivateActionsArgs,
  buildWorkspacePrivateFavoriteToggleArgs,
} from '@/features/workspace/page/workspacePrivateInteractions.model';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

type Params = {
  t: WorkspaceBranchProps['t'];
  locale: WorkspaceBranchProps['locale'];
  isAuthed: boolean;
  nextPath: string;
  favoriteRequestIds: Parameters<typeof useWorkspaceFavoriteToggles>[0]['favoriteRequestIds'];
  requestById: Parameters<typeof useWorkspaceFavoriteToggles>[0]['requestById'];
  favoriteProviderLookup: Parameters<typeof useWorkspaceFavoriteToggles>[0]['favoriteProviderLookup'];
  providerById: Parameters<typeof useWorkspaceFavoriteToggles>[0]['providerById'];
};

export function useWorkspaceRequestUserInteractions({
  t,
  locale,
  isAuthed,
  nextPath,
  favoriteRequestIds,
  requestById,
  favoriteProviderLookup,
  providerById,
}: Params) {
  const router = useRouter();
  const qc = useQueryClient();

  const favoriteToggles = useWorkspaceFavoriteToggles(
    buildWorkspacePrivateFavoriteToggleArgs({
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
      isAuthed,
      t,
      qc,
      router,
    }),
  );

  const formatters = useWorkspaceFormatters(locale);

  return {
    pendingFavoriteRequestIds: favoriteToggles.pendingFavoriteRequestIds,
    pendingFavoriteProviderIds: favoriteToggles.pendingFavoriteProviderIds,
    onToggleRequestFavorite: favoriteToggles.onToggleRequestFavorite,
    onToggleProviderFavorite: favoriteToggles.onToggleProviderFavorite,
    pendingOfferRequestId: actions.pendingOfferRequestId,
    ownerRequestActions: actions.ownerRequestActions,
    onOpenOfferSheet: actions.onOpenOfferSheet,
    onWithdrawOffer: actions.onWithdrawOffer,
    onOpenChatThread: actions.onOpenChatThread,
    onOpenChatConversation: actions.onOpenChatConversation,
    localeTag: formatters.localeTag,
    formatNumber: formatters.formatNumber,
    formatDate: formatters.formatDate,
    formatPrice: formatters.formatPrice,
    chartMonthLabel: formatters.chartMonthLabel,
  };
}
