'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  buildWorkspaceOfferRequestsQuery,
  type buildWorkspaceDataQueries,
} from '@/features/workspace/requests/workspaceData.queries';
import { buildWorkspaceOfferRequestIds } from '@/features/workspace/requests/workspaceData.model';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
  locale: string;
  shouldLoadOfferRequests: boolean;
};

export function useWorkspaceLegacyOfferData({
  workspaceDataQueries,
  locale,
  shouldLoadOfferRequests,
}: Args) {
  const { data: myOffers = [], isLoading: isMyOffersLoading } = useQuery(workspaceDataQueries.myOffers);
  const myOfferRequestIds = React.useMemo(
    () => buildWorkspaceOfferRequestIds(myOffers),
    [myOffers],
  );

  const myOfferRequestsQuery = React.useMemo(
    () =>
      buildWorkspaceOfferRequestsQuery({
        locale,
        requestIds: myOfferRequestIds,
        enabled: shouldLoadOfferRequests,
      }),
    [locale, myOfferRequestIds, shouldLoadOfferRequests],
  );

  const {
    data: myOfferRequestsById = new Map(),
    isLoading: isMyOfferRequestsLoading,
  } = useQuery(myOfferRequestsQuery);

  return {
    myOffers,
    isMyOffersLoading,
    myOfferRequestsById,
    isMyOfferRequestsLoading,
  };
}
