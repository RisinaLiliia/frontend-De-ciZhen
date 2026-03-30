import type {
  WorkspaceStatisticsCityDemandDto,
  WorkspaceStatisticsOverviewDto,
} from '@/lib/api/dto/workspace';

export type WorkspaceStatisticsSource = 'bff' | 'fallback';

export type WorkspaceStatisticsCitySourceDto = Omit<
  WorkspaceStatisticsCityDemandDto,
  'auftragSuchenCount' | 'anbieterSuchenCount' | 'providersActive' | 'marketBalanceRatio' | 'score' | 'rank' | 'signal' | 'peerContext'
> & {
  auftragSuchenCount?: number | null;
  anbieterSuchenCount?: number | null;
  providersActive?: number | null;
  marketBalanceRatio?: number | null;
  score?: number | null;
  rank?: number | null;
  signal?: 'high' | 'medium' | 'low' | 'none';
  peerContext?: WorkspaceStatisticsCityDemandDto['peerContext'];
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
