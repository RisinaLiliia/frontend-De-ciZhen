import type {
  WorkspaceStatisticsCityDemandDto,
  WorkspaceStatisticsOverviewDto,
} from '@/lib/api/dto/workspace';

export type WorkspaceStatisticsSource = 'bff' | 'fallback';

export type WorkspaceStatisticsCitySourceDto = Omit<
  WorkspaceStatisticsCityDemandDto,
  'auftragSuchenCount' | 'anbieterSuchenCount'
> & {
  auftragSuchenCount?: number;
  anbieterSuchenCount?: number;
};

export type WorkspaceStatisticsOverviewSourceDto = Omit<WorkspaceStatisticsOverviewDto, 'demand'> & {
  demand: Omit<WorkspaceStatisticsOverviewDto['demand'], 'cities'> & {
    cities: WorkspaceStatisticsCitySourceDto[];
  };
  __source: WorkspaceStatisticsSource;
};
