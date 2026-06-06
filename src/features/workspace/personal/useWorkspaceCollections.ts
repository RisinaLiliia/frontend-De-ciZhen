'use client';

import * as React from 'react';

import {
  buildWorkspaceCollections,
  type WorkspaceCollectionsArgs as Args,
} from '@/features/workspace/personal/workspaceCollections.model';

export function useWorkspaceCollections({
  includeRequestCollections = true,
  includeFavoriteProviderBackfill = true,
  includeFavoriteProviderPresentation = true,
  requests,
  favoriteRequests,
  providers,
  favoriteProviders,
  myOffers,
  myProviderContracts,
  myClientContracts,
  cityById,
  serviceByKey,
  locale,
}: Args) {
  return React.useMemo(
    () =>
      buildWorkspaceCollections({
        includeRequestCollections,
        includeFavoriteProviderBackfill,
        includeFavoriteProviderPresentation,
        requests,
        favoriteRequests,
        providers,
        favoriteProviders,
        myOffers,
        myProviderContracts,
        myClientContracts,
        cityById,
        serviceByKey,
        locale,
      }),
    [
      cityById,
      includeFavoriteProviderBackfill,
      favoriteProviders,
      favoriteRequests,
      includeFavoriteProviderPresentation,
      includeRequestCollections,
      locale,
      myClientContracts,
      myOffers,
      myProviderContracts,
      providers,
      requests,
      serviceByKey,
    ],
  );
}
