import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';

export type WorkspacePublicActivityRange = '24h' | '7d' | '30d' | '90d';
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
  lat: number | null;
  lng: number | null;
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

export type WorkspaceStatisticsRange = WorkspacePublicActivityRange;

export type WorkspaceStatisticsSummaryDto = {
  totalPublishedRequests: number;
  totalActiveProviders: number;
  totalActiveCities: number;
  platformRatingAvg: number;
  platformRatingCount: number;
};

export type WorkspaceStatisticsKpisDto = {
  requestsTotal: number;
  offersTotal: number;
  completedJobsTotal: number;
  successRate: number;
  avgResponseMinutes: number | null;
  profileCompleteness: number | null;
  openRequests: number | null;
  recentOffers7d: number | null;
};

export type WorkspaceStatisticsActivityPointDto = {
  timestamp: string;
  requests: number;
  offers: number;
};

export type WorkspaceStatisticsActivityTotalsDto = {
  requestsTotal: number;
  offersTotal: number;
  latestRequests: number;
  latestOffers: number;
  previousRequests: number;
  previousOffers: number;
  peakTimestamp: string | null;
  bestWindowTimestamp: string | null;
};

export type WorkspaceStatisticsActivityDto = {
  range: WorkspaceStatisticsRange;
  interval: WorkspacePublicActivityInterval;
  points: WorkspaceStatisticsActivityPointDto[];
  totals: WorkspaceStatisticsActivityTotalsDto;
};

export type WorkspaceStatisticsCategoryDemandDto = {
  categoryKey: string | null;
  categoryName: string;
  requestCount: number;
  sharePercent: number;
};

export type WorkspaceStatisticsCityDemandDto = {
  citySlug: string;
  cityName: string;
  cityId: string | null;
  requestCount: number;
  auftragSuchenCount: number;
  anbieterSuchenCount: number;
  lat: number | null;
  lng: number | null;
};

export type WorkspaceStatisticsDemandDto = {
  categories: WorkspaceStatisticsCategoryDemandDto[];
  cities: WorkspaceStatisticsCityDemandDto[];
};

export type WorkspaceStatisticsProfileFunnelDto = {
  stage1: number;
  stage2: number;
  stage3: number;
  stage4: number;
  conversionRate: number;
};

export type WorkspaceStatisticsInsightDto = {
  level: 'info' | 'trend' | 'warning';
  code: string;
  context: string | null;
};

export type WorkspaceStatisticsGrowthCardDto = {
  key: string;
  href: string;
};

export type WorkspaceStatisticsOverviewDto = {
  updatedAt: string;
  mode: 'platform' | 'personalized';
  range: WorkspaceStatisticsRange;
  summary: WorkspaceStatisticsSummaryDto;
  kpis: WorkspaceStatisticsKpisDto;
  activity: WorkspaceStatisticsActivityDto;
  demand: WorkspaceStatisticsDemandDto;
  profileFunnel: WorkspaceStatisticsProfileFunnelDto;
  insights: WorkspaceStatisticsInsightDto[];
  growthCards: WorkspaceStatisticsGrowthCardDto[];
};
