import type {
  WorkspaceStatisticsCityDemandDto,
  WorkspaceStatisticsOverviewDto,
} from '@/lib/api/dto/workspace';

export type WorkspaceStatisticsSource = 'bff' | 'fallback';

export type WorkspaceStatisticsCitySourceDto = Omit<
  WorkspaceStatisticsCityDemandDto,
  'auftragSuchenCount' | 'anbieterSuchenCount' | 'marketBalanceRatio' | 'signal'
> & {
  auftragSuchenCount?: number | null;
  anbieterSuchenCount?: number | null;
  marketBalanceRatio?: number | null;
  signal?: 'high' | 'medium' | 'low' | 'none';
};

export type WorkspaceStatisticsOverviewSourceDto = Omit<
  WorkspaceStatisticsOverviewDto,
  'demand' | 'opportunityRadar' | 'priceIntelligence'
> & {
  demand: Omit<WorkspaceStatisticsOverviewDto['demand'], 'cities'> & {
    cities: WorkspaceStatisticsCitySourceDto[];
  };
  opportunityRadar?: WorkspaceStatisticsOverviewDto['opportunityRadar'];
  priceIntelligence?: WorkspaceStatisticsOverviewDto['priceIntelligence'];
  __source: WorkspaceStatisticsSource;
};
