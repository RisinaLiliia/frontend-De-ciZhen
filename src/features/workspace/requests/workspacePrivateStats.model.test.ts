import { describe, expect, it } from 'vitest';

import { EMPTY_WORKSPACE_PRIVATE_OVERVIEW } from '@/features/workspace/requests/workspacePrivateState.constants';
import { buildWorkspacePrivateStatsModel, resolveCompletedMoMDelta } from './workspacePrivateStats.model';

function makeOverview() {
  return structuredClone(EMPTY_WORKSPACE_PRIVATE_OVERVIEW);
}

describe('workspacePrivateStats.model', () => {
  it('resolves completed month-over-month delta variants', () => {
    const percentOverview = makeOverview();
    percentOverview.insights.providerCompletedDeltaKind = 'percent';
    percentOverview.insights.providerCompletedDeltaPercent = 18;
    expect(resolveCompletedMoMDelta(percentOverview)).toEqual({ kind: 'percent', value: 18 });

    const newOverview = makeOverview();
    newOverview.insights.providerCompletedDeltaKind = 'new';
    expect(resolveCompletedMoMDelta(newOverview)).toEqual({ kind: 'new' });
  });

  it('builds provider-first stats payload when provider activity dominates', () => {
    const overview = makeOverview();
    overview.requestsByStatus.total = 5;
    overview.kpis.myOpenRequests = 2;
    overview.providerOffersByStatus.sent = 8;
    overview.providerOffersByStatus.accepted = 3;
    overview.providerOffersByStatus.declined = 1;
    overview.providerContractsByStatus.completed = 4;
    overview.kpis.providerActiveContracts = 2;
    overview.kpis.clientActiveContracts = 1;
    overview.clientContractsByStatus.completed = 1;
    overview.kpis.acceptanceRate = 62;
    overview.kpis.avgResponseMinutes = 24;
    overview.kpis.recentOffers7d = 5;
    overview.profiles.providerCompleteness = 90;
    overview.profiles.clientCompleteness = 40;
    overview.insights.providerCompletedThisMonth = 4;
    overview.insights.providerCompletedDeltaKind = 'percent';
    overview.insights.providerCompletedDeltaPercent = 15;
    overview.providerMonthlySeries = [{ monthStart: '2026-01-01T00:00:00.000Z', bars: 4, line: 2 }];
    overview.clientMonthlySeries = [{ monthStart: '2026-01-01T00:00:00.000Z', bars: 1, line: 1 }];

    const model = buildWorkspacePrivateStatsModel({
      t: (key) => String(key),
      locale: 'en',
      overview,
      chartMonthLabel: new Intl.DateTimeFormat('en-US', { month: 'short' }),
      formatNumber: new Intl.NumberFormat('en-US'),
    });

    expect(model.hasAnyStatsActivity).toBe(true);
    expect(model.statsOrder[0]?.tab).toBe('provider');
    expect(model.providerStatsPayload.secondary.progressValue).toBe(62);
    expect(model.providerStatsPayload.chartDelta).toBe('+15%');
    expect(model.clientStatsPayload.kpis[0]?.value).toBe('5');
  });
});
