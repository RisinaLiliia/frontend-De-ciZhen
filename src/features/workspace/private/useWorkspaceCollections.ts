'use client';

import * as React from 'react';

import {
  buildWorkspaceCollections,
  type WorkspaceCollectionsArgs as Args,
} from '@/features/workspace/private/workspaceCollections.model';

export function useWorkspaceCollections({
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
