export const workspaceQK = {
  requestsExplorerPublic: (args: {
    cityId: string | undefined;
    categoryKey: string | undefined;
    subcategoryKey: string | undefined;
    sort: string | undefined;
    page: number | undefined;
    limit: number | undefined;
    locale: string;
  }) => [
    'requests-explorer-public',
    args.cityId,
    args.categoryKey,
    args.subcategoryKey,
    args.sort,
    args.page,
    args.limit,
    args.locale,
  ] as const,
  requestsExplorerPublicPrefix: () => ['requests-explorer-public'] as const,
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
  workspacePublicOverviewPrefix: () => ['workspace-public-overview'] as const,
  workspacePublicSummary: (cityActivityLimit: number) => ['workspace-public-summary', cityActivityLimit] as const,
  workspacePublicSummaryPrefix: () => ['workspace-public-summary'] as const,
  workspacePrivateOverview: (period?: string | null) => ['workspace-private-overview', period ?? 'default'] as const,
  workspacePrivateOverviewPrefix: () => ['workspace-private-overview'] as const,
  workspaceRequests: (args: {
    scope: string;
    role: string;
    state: string;
    period: string;
    sort: string | null;
  }) => [
    'workspace-requests',
    args.scope,
    args.role,
    args.state,
    args.period,
    args.sort ?? 'default',
  ] as const,
  workspaceRequestsPrefix: () => ['workspace-requests'] as const,
  managedRequest: (args: {
    requestId: string;
    locale: string;
    attemptOwner: boolean;
    preferOwner: boolean;
  }) => [
    'workspace-managed-request',
    args.requestId,
    args.locale,
    args.attemptOwner ? 'owner-attempt' : 'public-only',
    args.preferOwner ? 'prefer-owner' : 'default',
  ] as const,
  managedRequestPrefix: (requestId?: string) =>
    requestId ? (['workspace-managed-request', requestId] as const) : (['workspace-managed-request'] as const),
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
  requestsPublicPrefix: () => ['requests-public'] as const,
  requestsPublicSummaryTotal: (locale: string) => ['requests-public-summary-total', locale] as const,
  requestsPublicSummaryTotalPrefix: () => ['requests-public-summary-total'] as const,
  requestsPublicCityActivity: (locale: string, limit: number) =>
    ['requests-public-city-activity', locale, limit] as const,
  requestsPublicCityActivityPrefix: () => ['requests-public-city-activity'] as const,
  offersMy: () => ['offers-my'] as const,
  offersMyClient: () => ['offers-my-client'] as const,
  requestsByMyOfferIds: (locale: string, requestIds: readonly string[]) =>
    ['requests-by-my-offer-ids', locale, ...requestIds] as const,
  favoriteRequests: () => ['favorite-requests'] as const,
  favoriteProviders: () => ['favorite-providers'] as const,
  reviewsMy: () => ['reviews-my', 'all'] as const,
  requestsMy: () => ['requests-my'] as const,
  contractsMyAll: () => ['contracts-my-all'] as const,
  contractsMyProvider: () => ['contracts-my-provider'] as const,
  contractsMyClient: () => ['contracts-my-client'] as const,
  providersPublic: () => ['providers-public'] as const,
  requestsByContractIds: (locale: string, requestIds: readonly string[]) =>
    ['requests-by-contract-ids', locale, ...requestIds] as const,
  chatInbox: () => ['chat-inbox'] as const,
  chatInboxAll: () => ['chat-inbox', 'all'] as const,
  requestDetail: (requestId: string) => ['request-detail', requestId] as const,
  requestDetailData: (args: {
    requestId: string | undefined;
    locale: string;
    preferOwner: boolean;
  }) => ['request-detail', args.requestId, args.locale, args.preferOwner ? 'owner' : 'default'] as const,
  requestSimilar: (args: {
    requestId: string | undefined;
    categoryKey: string | null | undefined;
    serviceKey: string | null | undefined;
    locale: string;
  }) => ['request-similar', args.requestId, args.categoryKey, args.serviceKey, args.locale] as const,
  requestsLatest: (locale: string) => ['requests-latest', locale] as const,
  requestsLatestPrefix: () => ['requests-latest'] as const,
  requestSimilarPrefix: () => ['request-similar'] as const,
  homeNearbyRequests: (cityId: string | undefined, targetItems: number, locale: string) =>
    ['home-nearby-requests', cityId, targetItems, locale] as const,
  homeNearbyRequestsPrefix: () => ['home-nearby-requests'] as const,
  reviewsMyPrefix: () => ['reviews-my'] as const,
  bookingsMyReviewable: () => ['bookings-my-reviewable'] as const,
  workspaceReviewBookingRequests: (requestIds: readonly string[]) =>
    ['workspace-review-booking-requests', ...requestIds] as const,
  platformReviewsOverview: (args: {
    sort: string;
    range?: string;
    page?: number;
    limit?: number;
  }) => [
    'platform-reviews-overview',
    args.sort,
    args.range ?? 'all',
    args.page ?? 1,
    args.limit ?? 1,
  ] as const,
  platformReviewsOverviewSummary: () => ['platform-reviews-overview', 'summary'] as const,
  platformReviewsOverviewPrefix: () => ['platform-reviews-overview'] as const,
};
