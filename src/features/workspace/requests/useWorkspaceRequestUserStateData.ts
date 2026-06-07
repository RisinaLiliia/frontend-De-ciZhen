'use client';

import { useWorkspaceOfferData } from '@/features/workspace/requests/useWorkspaceOfferData';
import { useWorkspaceFavoriteRequestData } from '@/features/workspace/requests/useWorkspaceFavoriteRequestData';
import type { buildWorkspaceRequestUserStateQueries } from '@/features/workspace/requests/workspaceRequestUserState.queries';

type WorkspaceRequestUserStateQueries = ReturnType<typeof buildWorkspaceRequestUserStateQueries>;

type Args = {
  workspaceRequestUserStateQueries: WorkspaceRequestUserStateQueries;
  locale: string;
  shouldLoadOfferRequests: boolean;
};

export function useWorkspaceRequestUserStateData({
  workspaceRequestUserStateQueries,
  locale,
  shouldLoadOfferRequests,
}: Args) {
  const offerData = useWorkspaceOfferData({
    workspaceRequestUserStateQueries,
    locale,
    shouldLoadOfferRequests,
  });

  const favoriteRequestData = useWorkspaceFavoriteRequestData({
    workspaceRequestUserStateQueries,
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
