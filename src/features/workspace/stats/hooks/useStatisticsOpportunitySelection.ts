'use client';

import * as React from 'react';
import { selectOpportunityAnalysisItem } from '../sections/opportunity/opportunity.utils';
import type { WorkspaceStatisticsModel } from '../statistics.model';

type UseStatisticsOpportunitySelectionArgs = {
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
};

export function useStatisticsOpportunitySelection({ opportunityRadar }: UseStatisticsOpportunitySelectionArgs) {
  const defaultOpportunityRank = React.useMemo(
    () => selectOpportunityAnalysisItem(opportunityRadar)?.rank ?? null,
    [opportunityRadar],
  );

  const [selectedOpportunityRank, setSelectedOpportunityRank] = React.useState<
    WorkspaceStatisticsModel['opportunityRadar'][number]['rank'] | null
  >(defaultOpportunityRank);

  const selectedOpportunity = React.useMemo(
    () => selectOpportunityAnalysisItem(opportunityRadar, selectedOpportunityRank),
    [opportunityRadar, selectedOpportunityRank],
  );

  React.useEffect(() => {
    if (selectedOpportunityRank !== null && opportunityRadar.some((item) => item.rank === selectedOpportunityRank)) {
      return;
    }

    setSelectedOpportunityRank(defaultOpportunityRank);
  }, [defaultOpportunityRank, opportunityRadar, selectedOpportunityRank]);

  return {
    selectedOpportunityRank,
    setSelectedOpportunityRank,
    selectedOpportunity,
  };
}
