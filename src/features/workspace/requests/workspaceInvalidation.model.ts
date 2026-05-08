'use client';

import type { QueryKey } from '@tanstack/react-query';

import { workspaceQK } from '@/features/workspace/requests/queryKeys';

export function buildWorkspacePublicRequestLifecycleQueryKeys(): QueryKey[] {
  return [
    workspaceQK.requestsExplorerPublicPrefix(),
    workspaceQK.requestsPublicPrefix(),
    workspaceQK.workspacePublicOverviewPrefix(),
    workspaceQK.workspacePublicSummaryPrefix(),
    workspaceQK.requestsPublicSummaryTotalPrefix(),
    workspaceQK.requestsPublicCityActivityPrefix(),
    workspaceQK.homeNearbyRequestsPrefix(),
    workspaceQK.requestsLatestPrefix(),
    workspaceQK.requestSimilarPrefix(),
  ];
}

export function buildWorkspacePrivateShellQueryKeys(): QueryKey[] {
  return [
    workspaceQK.workspaceRequestsPrefix(),
    workspaceQK.workspacePrivateOverviewPrefix(),
  ];
}

export function buildWorkspaceOwnerRequestMutationQueryKeys(): QueryKey[] {
  return [
    workspaceQK.requestsMy(),
    workspaceQK.favoriteRequests(),
    workspaceQK.offersMy(),
    workspaceQK.offersMyClient(),
    workspaceQK.chatInbox(),
    ...buildWorkspacePrivateShellQueryKeys(),
    ...buildWorkspacePublicRequestLifecycleQueryKeys(),
  ];
}

export function buildWorkspaceDecisionMutationQueryKeys(requestId: string): QueryKey[] {
  return [
    workspaceQK.contractsMyClient(),
    workspaceQK.requestsMy(),
    ...buildWorkspacePrivateShellQueryKeys(),
    workspaceQK.requestDetail(requestId),
    workspaceQK.managedRequestPrefix(requestId),
  ];
}

export function buildWorkspaceOfferReviewMutationQueryKeys(requestId: string): QueryKey[] {
  return [
    ['workspace-request-offers', requestId],
    workspaceQK.offersMyClient(),
    ...buildWorkspaceDecisionMutationQueryKeys(requestId),
  ];
}

export function buildWorkspaceProviderOfferMutationQueryKeys(): QueryKey[] {
  return [
    workspaceQK.offersMy(),
    workspaceQK.requestsMy(),
    ...buildWorkspacePrivateShellQueryKeys(),
  ];
}

export function buildWorkspaceCompletionReviewMutationQueryKeys(): QueryKey[] {
  return [
    workspaceQK.reviewsMyPrefix(),
    workspaceQK.bookingsMyReviewable(),
    workspaceQK.contractsMyClient(),
    workspaceQK.requestsMy(),
    ...buildWorkspacePrivateShellQueryKeys(),
  ];
}
