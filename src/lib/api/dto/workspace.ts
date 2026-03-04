import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';

export type WorkspacePublicActivityRange = '24h' | '7d' | '30d';
export type WorkspacePublicActivityInterval = 'hour' | 'day';

export type WorkspacePublicActivityPointDto = {
  timestamp: string;
  requests: number;
  offers: number;
};

export type WorkspacePublicActivityDto = {
  range: WorkspacePublicActivityRange;
  interval: WorkspacePublicActivityInterval;
  source: 'real';
  data: WorkspacePublicActivityPointDto[];
  updatedAt: string;
};

export type WorkspacePublicSummaryDto = {
  totalPublishedRequests: number;
  totalActiveProviders: number;
};

export type WorkspacePublicCityActivityItemDto = {
  citySlug: string;
  cityName: string;
  cityId: string | null;
  requestCount: number;
};

export type WorkspacePublicCityActivityDto = {
  totalActiveCities: number;
  totalActiveRequests: number;
  items: WorkspacePublicCityActivityItemDto[];
};

export type WorkspacePublicOverviewDto = {
  updatedAt: string;
  summary: WorkspacePublicSummaryDto;
  activity: WorkspacePublicActivityDto;
  cityActivity: WorkspacePublicCityActivityDto;
  requests: PublicRequestsResponseDto;
};

export type WorkspacePublicRequestsBatchResponseDto = {
  items: RequestResponseDto[];
  missingIds: string[];
};

export type WorkspacePrivateStatusCountsDto = {
  draft: number;
  published: number;
  paused: number;
  matched: number;
  closed: number;
  cancelled: number;
  total: number;
};

export type WorkspacePrivateOfferStatusCountsDto = {
  sent: number;
  accepted: number;
  declined: number;
  withdrawn: number;
  total: number;
};

export type WorkspacePrivateContractStatusCountsDto = {
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total: number;
};

export type WorkspacePrivateFavoritesDto = {
  requests: number;
  providers: number;
};

export type WorkspacePrivateReviewsDto = {
  asProvider: number;
  asClient: number;
};

export type WorkspacePrivateProfilesDto = {
  providerCompleteness: number;
  clientCompleteness: number;
};

export type WorkspacePrivateKpisDto = {
  myOpenRequests: number;
  providerActiveContracts: number;
  clientActiveContracts: number;
  acceptanceRate: number;
  activityProgress: number;
  avgResponseMinutes: number | null;
  recentOffers7d: number;
};

export type WorkspacePrivateInsightsDto = {
  providerCompletedThisMonth: number;
  providerCompletedLastMonth: number;
  providerCompletedDeltaKind: 'percent' | 'new' | 'none';
  providerCompletedDeltaPercent: number | null;
};

export type WorkspacePrivateMonthlyPointDto = {
  monthStart: string;
  bars: number;
  line: number;
};

export type WorkspacePrivateOverviewDto = {
  updatedAt: string;
  user: {
    userId: string;
    role: 'client' | 'provider' | 'admin';
  };
  requestsByStatus: WorkspacePrivateStatusCountsDto;
  providerOffersByStatus: WorkspacePrivateOfferStatusCountsDto;
  clientOffersByStatus: WorkspacePrivateOfferStatusCountsDto;
  providerContractsByStatus: WorkspacePrivateContractStatusCountsDto;
  clientContractsByStatus: WorkspacePrivateContractStatusCountsDto;
  favorites: WorkspacePrivateFavoritesDto;
  reviews: WorkspacePrivateReviewsDto;
  profiles: WorkspacePrivateProfilesDto;
  kpis: WorkspacePrivateKpisDto;
  insights: WorkspacePrivateInsightsDto;
  providerMonthlySeries: WorkspacePrivateMonthlyPointDto[];
  clientMonthlySeries: WorkspacePrivateMonthlyPointDto[];
};
