import { describe, expect, it } from 'vitest';

import { getWorkspaceStatisticsCopy } from './workspaceStatistics.copy';
import type { WorkspaceStatisticsFunnelItemView } from './workspaceStatistics.model';
import { buildFunnelVisualRows } from './statisticsFunnel.utils';

function step(
  overrides: Partial<WorkspaceStatisticsFunnelItemView> = {},
): WorkspaceStatisticsFunnelItemView {
  return {
    key: 'requests',
    label: 'Anfragen',
    count: 100,
    value: '100',
    widthPercent: 100,
    rateFromPreviousPercent: null,
    railLabel: undefined,
    railValue: undefined,
    isCurrency: false,
    ...overrides,
  };
}

describe('statisticsFunnel.utils', () => {
  it('keeps revenue width aligned with completed stage', () => {
    const rows = buildFunnelVisualRows({
      copy: getWorkspaceStatisticsCopy('de'),
      isNarrowViewport: false,
      funnelContainerWidth: 900,
      funnel: [
        step({ key: 'requests', widthPercent: 100 }),
        step({ key: 'offers', widthPercent: 60 }),
        step({ key: 'confirmed', widthPercent: 45 }),
        step({ key: 'closed', widthPercent: 32 }),
        step({ key: 'completed', widthPercent: 24 }),
        step({ key: 'profit', widthPercent: 5, isCurrency: true }),
      ],
    });

    expect(rows[4]?.bottomWidthPercent).toBe(40);
    expect(rows[5]?.bottomWidthPercent).toBe(40);
    expect(rows[5]?.topWidthPercent).toBe(40);
  });

  it('switches to compact labels on narrow container', () => {
    const rows = buildFunnelVisualRows({
      copy: getWorkspaceStatisticsCopy('de'),
      isNarrowViewport: false,
      funnelContainerWidth: 380,
      funnel: [
        step({ key: 'requests' }),
        step({ key: 'offers', label: 'Angebote von Anbietern', widthPercent: 80 }),
      ],
    });

    expect(rows[1]?.isCompactLabel).toBe(true);
    expect(rows[1]?.displayLabel).toBe('Angebote');
  });

  it('marks long labels as tall when they stay in full mode', () => {
    const rows = buildFunnelVisualRows({
      copy: getWorkspaceStatisticsCopy('de'),
      isNarrowViewport: false,
      funnelContainerWidth: 900,
      funnel: [
        step({ key: 'requests' }),
        step({
          key: 'offers',
          label: 'Angebote von Anbietern',
          widthPercent: 88,
        }),
      ],
    });

    expect(rows[1]?.isCompactLabel).toBe(false);
    expect(rows[1]?.isTall).toBe(true);
  });

  it('keeps platform mobile funnel narrower than personalized mobile funnel', () => {
    const funnel = [
      step({ key: 'requests', widthPercent: 100 }),
      step({ key: 'offers', widthPercent: 54 }),
      step({ key: 'confirmed', widthPercent: 33 }),
      step({ key: 'closed', widthPercent: 21 }),
      step({ key: 'completed', widthPercent: 21 }),
    ];

    const platformRows = buildFunnelVisualRows({
      copy: getWorkspaceStatisticsCopy('de'),
      isNarrowViewport: true,
      funnelContainerWidth: 360,
      mode: 'platform',
      funnel,
    });

    const personalizedRows = buildFunnelVisualRows({
      copy: getWorkspaceStatisticsCopy('de'),
      isNarrowViewport: true,
      funnelContainerWidth: 360,
      mode: 'personalized',
      funnel,
    });

    expect(platformRows[3]?.bottomWidthPercent).toBe(38);
    expect(personalizedRows[3]?.bottomWidthPercent).toBe(58);
  });
});
