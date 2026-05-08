'use client';

import { useWorkspaceLegacyOfferData } from '@/features/workspace/requests/useWorkspaceLegacyOfferData';
import { useWorkspaceFavoriteRequestData } from '@/features/workspace/requests/useWorkspaceFavoriteRequestData';
import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
  locale: string;
  shouldLoadOfferRequests: boolean;
};

export function useWorkspaceRequestUserStateData({
  workspaceDataQueries,
  locale,
  shouldLoadOfferRequests,
}: Args) {
  const offerData = useWorkspaceLegacyOfferData({
    workspaceDataQueries,
    locale,
    shouldLoadOfferRequests,
  });

  const favoriteRequestData = useWorkspaceFavoriteRequestData({
    workspaceDataQueries,
  });

  return {
    myOffers: offerData.myOffers,
    isMyOffersLoading: offerData.isMyOffersLoading,
    myOfferRequestsById: offerData.myOfferRequestsById,
    isMyOfferRequestsLoading: offerData.isMyOfferRequestsLoading,
    favoriteRequests: favoriteRequestData.favoriteRequests,
    isFavoriteRequestsLoading: favoriteRequestData.isFavoriteRequestsLoading,
  };
}
