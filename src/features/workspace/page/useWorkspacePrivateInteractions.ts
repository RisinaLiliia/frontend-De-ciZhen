'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

import {
  usePublicRequestsSeenTotal,
  useWorkspaceActions,
  useWorkspaceFavoriteToggles,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  useWorkspaceTabPersistence,
} from '@/features/workspace';
import { WORKSPACE_PATH } from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

type InteractionsParams = {
  t: WorkspaceBranchProps['t'];
  locale: WorkspaceBranchProps['locale'];
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  authUserId?: string | null;
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  nextPath: WorkspaceBranchProps['routeState']['nextPath'];
  platformRequestsTotal: number;
  myOffers: OfferDto[];
  favoriteRequestIds: ReadonlySet<string>;
  requestById: ReadonlyMap<string, RequestResponseDto>;
  favoriteProviderLookup: ReadonlySet<string>;
  providerById: ReadonlyMap<string, ProviderPublicDto>;
};

export function useWorkspacePrivateInteractions({
  t,
  locale,
  isAuthed,
  isWorkspaceAuthed,
  authUserId,
  activeWorkspaceTab,
  nextPath,
  platformRequestsTotal,
  myOffers,
  favoriteRequestIds,
  requestById,
  favoriteProviderLookup,
  providerById,
}: InteractionsParams) {
  const router = useRouter();
  const qc = useQueryClient();

  const {
    pendingFavoriteRequestIds,
    pendingFavoriteProviderIds,
    onToggleRequestFavorite,
    onToggleProviderFavorite,
  } = useWorkspaceFavoriteToggles({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteRequestIds,
    requestById,
    favoriteProviderLookup,
    providerById,
  });

  const {
    pendingOfferRequestId,
    ownerRequestActions,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
  } = useWorkspaceActions({
    isAuthed,
    myOffers,
    t,
    qc,
    router,
  });

  const { localeTag, formatNumber, formatDate, formatPrice, chartMonthLabel } =
    useWorkspaceFormatters(locale);

  const { markPublicRequestsSeen } = usePublicRequestsSeenTotal({
    isAuthed,
    userId: authUserId,
    platformRequestsTotal,
    autoMarkSeen: false,
  });

  useWorkspaceTabPersistence({
    isWorkspaceAuthed,
    isWorkspacePublicSection: false,
    activeWorkspaceTab,
  });

  const {
    setWorkspaceTab,
    setStatusFilter,
    setFavoritesView,
    setReviewsView,
  } = useWorkspaceNavigation({
    activeWorkspaceTab,
    workspacePath: WORKSPACE_PATH,
  });

  return {
    pendingFavoriteRequestIds,
    pendingFavoriteProviderIds,
    onToggleRequestFavorite,
    onToggleProviderFavorite,
    pendingOfferRequestId,
    ownerRequestActions,
    onOpenOfferSheet,
    onWithdrawOffer,
    onOpenChatThread,
    localeTag,
    formatNumber,
    formatDate,
    formatPrice,
    chartMonthLabel,
    markPublicRequestsSeen,
    setWorkspaceTab,
    setStatusFilter,
    setFavoritesView,
    setReviewsView,
  };
}
