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

export type WorkspaceStatisticsActivityMetricsDto = {
  offerRatePercent: number;
  responseMedianMinutes: number | null;
  unansweredRequests24h: number;
  cancellationRatePercent: number;
  completedJobs: number;
  gmvAmount: number;
  platformRevenueAmount: number;
  takeRatePercent: number;
};

export type WorkspaceStatisticsActivityDto = {
  range: WorkspaceStatisticsRange;
  interval: WorkspacePublicActivityInterval;
  points: WorkspaceStatisticsActivityPointDto[];
  totals: WorkspaceStatisticsActivityTotalsDto;
  metrics: WorkspaceStatisticsActivityMetricsDto;
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
  periodLabel: string;
  stage1: number;
  stage2: number;
  stage3: number;
  stage4: number;
  requestsTotal: number;
  offersTotal: number;
  confirmedResponsesTotal: number;
  closedContractsTotal: number;
  completedJobsTotal: number;
  profitAmount: number;
  offerResponseRatePercent: number;
  confirmationRatePercent: number;
  contractClosureRatePercent: number;
  completionRatePercent: number;
  conversionRate: number;
  totalConversionPercent: number;
  summaryText: string;
  stages: Array<{
    id: 'requests' | 'offers' | 'confirmations' | 'contracts' | 'completed' | 'revenue';
    label: string;
    value: number;
    displayValue: string;
    widthPercent: number;
    rateLabel: string | null;
    ratePercent: number | null;
    helperText: string | null;
  }>;
};

export type WorkspaceStatisticsInsightDto = {
  id?: string;
  type?: 'demand' | 'opportunity' | 'performance' | 'growth' | 'risk' | 'promotion';
  priority?: 'high' | 'medium' | 'low';
  audience?: 'all' | 'provider' | 'client' | 'guest';
  score?: number;
  title?: string;
  body?: string;
  shortLabel?: string;
  icon?: string;
  confidence?: number;
  metrics?: Array<{
    key: string;
    value: string | number;
  }>;
  action?: {
    label: string;
    actionType: 'internal_link' | 'modal' | 'promotion' | 'none';
    href?: string;
    payload?: Record<string, unknown>;
  };
  validUntil?: string;
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
