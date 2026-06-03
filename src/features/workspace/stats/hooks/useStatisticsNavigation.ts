'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import { buildDecisionPlan, buildPersonalizedDecisionPlan } from '../statisticsDecisionEngine.utils';

export type StatisticsDecisionPlan =
  | ReturnType<typeof buildDecisionPlan>
  | ReturnType<typeof buildPersonalizedDecisionPlan>;

type UseStatisticsNavigationParams = {
  model: WorkspaceStatisticsModel;
  decisionPlan: StatisticsDecisionPlan;
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
};

export function useStatisticsNavigation({ model, decisionPlan, selectedOpportunity }: UseStatisticsNavigationParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const applySelectedOpportunityFocus = React.useCallback(() => {
    if (!selectedOpportunity) return;

    if (decisionPlan.shouldApplyFocus) {
      model.setCityId(selectedOpportunity.cityId);
      model.setCategoryKey(selectedOpportunity.categoryKey);
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.set('section', 'requests');

    if (selectedOpportunity.cityId) {
      next.set('cityId', selectedOpportunity.cityId);
    } else {
      next.delete('cityId');
    }

    if (selectedOpportunity.categoryKey) {
      next.set('categoryKey', selectedOpportunity.categoryKey);
    } else {
      next.delete('categoryKey');
    }

    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }, [decisionPlan.shouldApplyFocus, model, pathname, router, searchParams, selectedOpportunity]);

  return {
    applySelectedOpportunityFocus,
  };
}
