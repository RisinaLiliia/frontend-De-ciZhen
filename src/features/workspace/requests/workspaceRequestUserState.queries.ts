'use client';

import { listFavorites } from '@/lib/api/favorites';
import { listMyProviderOffers } from '@/lib/api/offers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import type { WorkspaceDataLoadPlan } from '@/features/workspace/requests/workspaceData.model';

type BuildWorkspaceRequestUserStateQueriesArgs = {
  loadPlan: WorkspaceDataLoadPlan;
};

export function buildWorkspaceRequestUserStateQueries({
  loadPlan,
}: BuildWorkspaceRequestUserStateQueriesArgs) {
  return {
    myOffers: {
      queryKey: workspaceQK.offersMy(),
      enabled: loadPlan.shouldLoadMyOffers,
      queryFn: () => withStatusFallback(() => listMyProviderOffers(), []),
    },
    favoriteRequests: {
      queryKey: workspaceQK.favoriteRequests(),
      enabled: loadPlan.shouldLoadFavoriteRequests,
      queryFn: () => withStatusFallback(() => listFavorites('request'), []),
    },
  };
}
