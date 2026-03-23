'use client';

import type { QueryClient } from '@tanstack/react-query';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import type { usePublicRequestsSeenTotal } from '@/features/workspace';
import type {
  useWorkspaceActions,
  useWorkspaceFavoriteToggles,
  useWorkspaceFormatters,
  useWorkspaceNavigation,
  useWorkspaceTabPersistence,
} from '@/features/workspace';
import { WORKSPACE_PATH } from '@/features/workspace/page/workspacePage.constants';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

export type WorkspacePrivateInteractionsParams = {
  t: WorkspaceBranchProps['t'];
  locale: WorkspaceBranchProps['locale'];
  isAuthed: boolean;
  isWorkspaceAuthed: boolean;
  authUserId?: string | null;
  activeWorkspaceTab: WorkspaceBranchProps['routeState']['activeWorkspaceTab'];
  nextPath: WorkspaceBranchProps['routeState']['nextPath'];
  platformRequestsTotal: number;
  myOffers: Parameters<typeof useWorkspaceActions>[0]['myOffers'];
  favoriteRequestIds: Parameters<typeof useWorkspaceFavoriteToggles>[0]['favoriteRequestIds'];
  requestById: Parameters<typeof useWorkspaceFavoriteToggles>[0]['requestById'];
  favoriteProviderLookup: Parameters<typeof useWorkspaceFavoriteToggles>[0]['favoriteProviderLookup'];
  providerById: Parameters<typeof useWorkspaceFavoriteToggles>[0]['providerById'];
};

export type WorkspacePrivateInteractionsResult = {
  pendingFavoriteRequestIds: FavoriteTogglesResult['pendingFavoriteRequestIds'];
  pendingFavoriteProviderIds: FavoriteTogglesResult['pendingFavoriteProviderIds'];
  onToggleRequestFavorite: FavoriteTogglesResult['onToggleRequestFavorite'];
  onToggleProviderFavorite: FavoriteTogglesResult['onToggleProviderFavorite'];
  pendingOfferRequestId: WorkspaceActionsResult['pendingOfferRequestId'];
  ownerRequestActions: WorkspaceActionsResult['ownerRequestActions'];
  onOpenOfferSheet: WorkspaceActionsResult['onOpenOfferSheet'];
  onWithdrawOffer: WorkspaceActionsResult['onWithdrawOffer'];
  onOpenChatThread: WorkspaceActionsResult['onOpenChatThread'];
  localeTag: WorkspaceFormattersResult['localeTag'];
  formatNumber: WorkspaceFormattersResult['formatNumber'];
  formatDate: WorkspaceFormattersResult['formatDate'];
  formatPrice: WorkspaceFormattersResult['formatPrice'];
  chartMonthLabel: WorkspaceFormattersResult['chartMonthLabel'];
  markPublicRequestsSeen: PublicRequestsSeenResult['markPublicRequestsSeen'];
  setWorkspaceTab: WorkspaceNavigationResult['setWorkspaceTab'];
  setStatusFilter: WorkspaceNavigationResult['setStatusFilter'];
  setFavoritesView: WorkspaceNavigationResult['setFavoritesView'];
};

type InteractionsParams = WorkspacePrivateInteractionsParams;
type FavoriteTogglesResult = ReturnType<typeof useWorkspaceFavoriteToggles>;
type WorkspaceActionsResult = ReturnType<typeof useWorkspaceActions>;
type WorkspaceFormattersResult = ReturnType<typeof useWorkspaceFormatters>;
type PublicRequestsSeenResult = ReturnType<typeof usePublicRequestsSeenTotal>;
type WorkspaceNavigationResult = ReturnType<typeof useWorkspaceNavigation>;

type BuildFavoriteToggleArgsParams = Pick<
  InteractionsParams,
  | 'isAuthed'
  | 'nextPath'
  | 't'
  | 'favoriteRequestIds'
  | 'requestById'
  | 'favoriteProviderLookup'
  | 'providerById'
> & {
  router: AppRouterInstance;
  qc: QueryClient;
};

type BuildActionsArgsParams = Pick<
  InteractionsParams,
  | 'isAuthed'
  | 'myOffers'
  | 't'
> & {
  router: AppRouterInstance;
  qc: QueryClient;
};

type ResolveResultParams = {
  favoriteToggles: FavoriteTogglesResult;
  actions: WorkspaceActionsResult;
  formatters: WorkspaceFormattersResult;
  markPublicRequestsSeen: PublicRequestsSeenResult['markPublicRequestsSeen'];
  navigation: WorkspaceNavigationResult;
};

export function buildWorkspacePrivateFavoriteToggleArgs({
  isAuthed,
  nextPath,
  router,
  t,
  qc,
  favoriteRequestIds,
  requestById,
  favoriteProviderLookup,
  providerById,
}: BuildFavoriteToggleArgsParams): Parameters<typeof useWorkspaceFavoriteToggles>[0] {
  return {
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteRequestIds,
    requestById,
    favoriteProviderLookup,
    providerById,
  };
}

export function buildWorkspacePrivateActionsArgs({
  isAuthed,
  myOffers,
  t,
  qc,
  router,
}: BuildActionsArgsParams): Parameters<typeof useWorkspaceActions>[0] {
  return {
    isAuthed,
    myOffers,
    t,
    qc,
    router,
  };
}

export function buildWorkspacePrivateSeenTotalArgs({
  isAuthed,
  authUserId,
  platformRequestsTotal,
}: Pick<InteractionsParams, 'isAuthed' | 'authUserId' | 'platformRequestsTotal'>): Parameters<typeof usePublicRequestsSeenTotal>[0] {
  return {
    isAuthed,
    userId: authUserId,
    platformRequestsTotal,
    autoMarkSeen: false,
  };
}

export function buildWorkspacePrivateTabPersistenceArgs({
  isWorkspaceAuthed,
  activeWorkspaceTab,
}: Pick<InteractionsParams, 'isWorkspaceAuthed' | 'activeWorkspaceTab'>): Parameters<typeof useWorkspaceTabPersistence>[0] {
  return {
    isWorkspaceAuthed,
    isWorkspacePublicSection: false,
    activeWorkspaceTab,
  };
}

export function buildWorkspacePrivateNavigationArgs({
  activeWorkspaceTab,
}: Pick<InteractionsParams, 'activeWorkspaceTab'>): Parameters<typeof useWorkspaceNavigation>[0] {
  return {
    activeWorkspaceTab,
    workspacePath: WORKSPACE_PATH,
  };
}

export function resolveWorkspacePrivateInteractionsResult({
  favoriteToggles,
  actions,
  formatters,
  markPublicRequestsSeen,
  navigation,
}: ResolveResultParams): WorkspacePrivateInteractionsResult {
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
    localeTag: formatters.localeTag,
    formatNumber: formatters.formatNumber,
    formatDate: formatters.formatDate,
    formatPrice: formatters.formatPrice,
    chartMonthLabel: formatters.chartMonthLabel,
    markPublicRequestsSeen,
    setWorkspaceTab: navigation.setWorkspaceTab,
    setStatusFilter: navigation.setStatusFilter,
    setFavoritesView: navigation.setFavoritesView,
  };
}
