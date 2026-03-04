import type { ReviewsView } from '@/features/workspace/requests/workspace.types';

export const workspaceQK = {
  workspacePublicOverview: (args: {
    cityId: string | undefined;
    categoryKey: string | undefined;
    subcategoryKey: string | undefined;
    sort: string | undefined;
    page: number | undefined;
    limit: number | undefined;
    activityRange: string | undefined;
    cityActivityLimit: number | undefined;
  }) => [
    'workspace-public-overview',
    args.cityId,
    args.categoryKey,
    args.subcategoryKey,
    args.sort,
    args.page,
    args.limit,
    args.activityRange,
    args.cityActivityLimit,
  ] as const,
  workspacePublicSummary: () => ['workspace-public-summary'] as const,
  workspacePrivateOverview: () => ['workspace-private-overview'] as const,
  requestsPublic: (args: {
    cityId: string | undefined;
    categoryKey: string | undefined;
    subcategoryKey: string | undefined;
    sort: string | undefined;
    page: number | undefined;
    limit: number | undefined;
    locale: string;
  }) => [
    'requests-public',
    args.cityId,
    args.categoryKey,
    args.subcategoryKey,
    args.sort,
    args.page,
    args.limit,
    args.locale,
  ] as const,
  requestsPublicSummaryTotal: (locale: string) => ['requests-public-summary-total', locale] as const,
  requestsPublicCityActivity: (locale: string, limit: number) =>
    ['requests-public-city-activity', locale, limit] as const,
  offersMy: () => ['offers-my'] as const,
  requestsByMyOfferIds: (locale: string, requestIds: readonly string[]) =>
    ['requests-by-my-offer-ids', locale, ...requestIds] as const,
  favoriteRequests: () => ['favorite-requests'] as const,
  favoriteProviders: () => ['favorite-providers'] as const,
  reviewsMy: (role: ReviewsView) => ['reviews-my', role] as const,
  requestsMy: () => ['requests-my'] as const,
  contractsMyProvider: () => ['contracts-my-provider'] as const,
  contractsMyClient: () => ['contracts-my-client'] as const,
  providersPublic: () => ['providers-public'] as const,
  requestsByContractIds: (locale: string, requestIds: readonly string[]) =>
    ['requests-by-contract-ids', locale, ...requestIds] as const,
  chatInbox: () => ['chat-inbox'] as const,
};
