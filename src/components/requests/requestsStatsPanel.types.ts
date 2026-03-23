'use client';

import type { KpiCardTrend } from '@/components/ui/KpiCard';

export type StatsTab = 'provider' | 'client';

export type KpiItem = {
  key: string;
  label: string;
  value: string;
  delta?: string;
  tone?: 'accent' | 'success' | 'neutral';
  trend?: KpiCardTrend;
};

export type ChartPoint = {
  label: string;
  bars: number;
  line: number;
};

export type SecondaryMetrics = {
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

export type HintBanner = {
  text: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TabPayload = {
  kpis: KpiItem[];
  showKpis?: boolean;
  showHint?: boolean;
  hasData?: boolean;
  chartTitle: string;
  chartDelta?: string;
  chartPoints: ChartPoint[];
  secondary: SecondaryMetrics;
  hint: HintBanner;
  emptyTitle: string;
  emptyCtaLabel: string;
  emptyCtaHref: string;
};

export type RequestsStatsPanelProps = {
  title: string;
  titleByTab?: Partial<Record<StatsTab, string>>;
  tabsLabel: {
    provider: string;
    client: string;
  };
  provider: TabPayload;
  client: TabPayload;
  tab?: StatsTab;
  showTabs?: boolean;
  defaultTab?: StatsTab;
  preferredTab?: StatsTab;
  storageKey?: string;
  loading?: boolean;
  error?: boolean;
  errorLabel?: string;
  className?: string;
  surface?: 'panel' | 'embedded';
};

export type PayloadViewModel = {
  payload: TabPayload;
  hasData: boolean;
  chartPoints: ChartPoint[];
};
