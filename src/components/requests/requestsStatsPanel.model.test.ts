import { describe, expect, it } from 'vitest';

import {
  FALLBACK_POINTS,
  buildMiniChartPath,
  clampStatsProgressValue,
  toPayloadViewModel,
} from '@/components/requests/requestsStatsPanel.model';

describe('requestsStatsPanel.model', () => {
  it('uses fallback chart points and inferred hasData when payload omits them', () => {
    const viewModel = toPayloadViewModel({
      kpis: [
        { key: 'total', label: 'Total', value: '0' },
        { key: 'open', label: 'Open', value: '12' },
      ],
      chartTitle: 'Activity',
      chartPoints: [],
      secondary: {
        leftLabel: 'A',
        leftValue: '1',
        centerLabel: 'B',
        centerValue: '2',
        rightLabel: 'C',
        rightValue: '3',
        progressLabel: 'P',
        progressValue: 50,
        responseLabel: 'R',
        responseValue: '1h',
      },
      hint: {
        text: 'Hint',
        ctaLabel: 'Open',
        ctaHref: '/workspace',
      },
      emptyTitle: 'Empty',
      emptyCtaLabel: 'Create',
      emptyCtaHref: '/request/create',
    });

    expect(viewModel.hasData).toBe(true);
    expect(viewModel.chartPoints).toEqual(FALLBACK_POINTS);
  });

  it('clamps progress values into the safe width range', () => {
    expect(clampStatsProgressValue(-10)).toBe(0);
    expect(clampStatsProgressValue(42)).toBe(42);
    expect(clampStatsProgressValue(180)).toBe(100);
  });

  it('builds a deterministic svg path for mini chart lines', () => {
    expect(
      buildMiniChartPath([
        { label: 'Jan', bars: 2, line: 2 },
        { label: 'Feb', bars: 4, line: 4 },
        { label: 'Mar', bars: 6, line: 1 },
      ]),
    ).toBe('M 0 50 L 50 0 L 100 75');
  });
});
