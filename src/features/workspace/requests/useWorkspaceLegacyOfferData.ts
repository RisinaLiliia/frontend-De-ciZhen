'use client';

import * as React from 'react';
import { useQueries } from '@tanstack/react-query';
import type { OfferDto } from '@/lib/api/dto/offers';

import {
  buildWorkspaceOfferRequestsQuery,
} from '@/features/workspace/data/workspaceData.queries';
import { type buildWorkspaceRequestUserStateQueries } from '@/features/workspace/requests/workspaceRequestUserState.queries';
import { buildWorkspaceOfferRequestIds } from '@/features/workspace/data/workspaceData.model';

type WorkspaceRequestUserStateQueries = ReturnType<typeof buildWorkspaceRequestUserStateQueries>;
type WorkspaceLegacyOfferQuery = WorkspaceRequestUserStateQueries['myOffers'];
type WorkspaceLegacyOfferRequestsQuery = ReturnType<typeof buildWorkspaceOfferRequestsQuery>;

type Args = {
  workspaceRequestUserStateQueries: WorkspaceRequestUserStateQueries;
  locale: string;
  shouldLoadOfferRequests: boolean;
};

export function useWorkspaceLegacyOfferData({
  workspaceRequestUserStateQueries,
  locale,
  shouldLoadOfferRequests,
}: Args) {
  const offerQueryEntries = React.useMemo(
    (): Array<{ key: 'myOffers'; query: WorkspaceLegacyOfferQuery }> =>
      workspaceRequestUserStateQueries.myOffers.enabled
        ? [{ key: 'myOffers', query: workspaceRequestUserStateQueries.myOffers }]
        : [],
    [workspaceRequestUserStateQueries.myOffers],
  );

  const offerQueryResults = useQueries({
    queries: offerQueryEntries.map((entry) => entry.query),
  });

  const myOffersData = offerQueryResults[0]?.data as OfferDto[] | undefined;
  const myOffers = myOffersData ?? [];
  const isMyOffersLoading = offerQueryResults[0]?.isLoading ?? false;

  const myOfferRequestIds = React.useMemo(
    () => buildWorkspaceOfferRequestIds(myOffersData ?? []),
    [myOffersData],
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

  const offerRequestQueryEntries = React.useMemo(
    (): Array<{ key: 'myOfferRequests'; query: WorkspaceLegacyOfferRequestsQuery }> =>
      myOfferRequestsQuery.enabled
        ? [{ key: 'myOfferRequests', query: myOfferRequestsQuery }]
        : [],
    [myOfferRequestsQuery],
  );

  const offerRequestQueryResults = useQueries({
    queries: offerRequestQueryEntries.map((entry) => entry.query),
  });

  const myOfferRequestsById =
    (offerRequestQueryResults[0]?.data as ReturnType<typeof myOfferRequestsQuery.queryFn> extends Promise<infer TResult> ? TResult : never) ?? new Map();
  const isMyOfferRequestsLoading = offerRequestQueryResults[0]?.isLoading ?? false;

  return {
    myOffers,
    isMyOffersLoading,
    myOfferRequestsById,
    isMyOfferRequestsLoading,
  };
}
