'use client';

import * as React from 'react';

import {
  buildWorkspaceCollections,
  type WorkspaceCollectionsArgs as Args,
} from '@/features/workspace/private/workspaceCollections.model';

export function useWorkspaceCollections({
  includeRequestCollections = true,
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
      favoriteProviders,
      favoriteRequests,
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
