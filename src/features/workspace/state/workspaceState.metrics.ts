'use client';

import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';

export type StatsPayload = {
  kpis: Array<{ key: string; label: string; value: string }>;
  showKpis?: boolean;
  hasData?: boolean;
  chartTitle: string;
  chartDelta?: string;
  chartPoints: Array<{ label: string; bars: number; line: number }>;
  secondary: {
    leftLabel: string;
    leftValue: string;
    centerLabel: string;
    centerValue: string;
    rightLabel: string;
    rightValue: string;
    progressLabel: string;
    progressValue: number;
    responseLabel: string;
    responseValue: string;
  };
  hint: { text: string; ctaLabel: string; ctaHref: string };
  emptyTitle: string;
  emptyCtaLabel: string;
  emptyCtaHref: string;
};

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function mapMonthlySeries(
  series: WorkspacePrivateOverviewDto['providerMonthlySeries'] | undefined,
  chartMonthLabel: Intl.DateTimeFormat,
) {
  return (series ?? []).map((point) => {
    const ts = new Date(point.monthStart);
    return {
      label: Number.isFinite(ts.getTime()) ? chartMonthLabel.format(ts) : point.monthStart.slice(0, 7),
      bars: Math.max(0, point.bars),
      line: Math.max(0, point.line),
    };
  });
}
