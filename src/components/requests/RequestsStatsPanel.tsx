'use client';

import * as React from 'react';
import Link from 'next/link';

type StatsTab = 'provider' | 'client';

type KpiItem = {
  key: string;
  label: string;
  value: string;
  delta?: string;
  tone?: 'accent' | 'success' | 'neutral';
};

type ChartPoint = {
  label: string;
  bars: number;
  line: number;
};

type SecondaryMetrics = {
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

type HintBanner = {
  text: string;
  ctaLabel: string;
  ctaHref: string;
};

type TabPayload = {
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

type RequestsStatsPanelProps = {
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
};

const FALLBACK_POINTS: ChartPoint[] = [
  { label: 'Nov', bars: 0, line: 0 },
  { label: 'Dez', bars: 0, line: 0 },
  { label: 'Jan', bars: 0, line: 0 },
  { label: 'Feb', bars: 0, line: 0 },
  { label: 'Mrz', bars: 0, line: 0 },
  { label: 'Apr', bars: 0, line: 0 },
];

type PayloadViewModel = {
  payload: TabPayload;
  hasData: boolean;
  chartPoints: ChartPoint[];
};

function toPayloadViewModel(payload: TabPayload): PayloadViewModel {
  return {
    payload,
    hasData: payload.hasData ?? payload.kpis.some((item) => item.value !== '0' && item.value !== '—'),
    chartPoints: payload.chartPoints.length > 0 ? payload.chartPoints : FALLBACK_POINTS,
  };
}

function StatsBody({ viewModel }: { viewModel: PayloadViewModel }) {
  const { payload, hasData, chartPoints } = viewModel;

  if (!hasData) {
    return (
      <div className="requests-stats__empty">
        <p className="typo-small">{payload.emptyTitle}</p>
        <Link href={payload.emptyCtaHref} className="btn-ghost is-primary">
          {payload.emptyCtaLabel}
        </Link>
      </div>
    );
  }

  return (
    <>
      {payload.showKpis !== false && payload.kpis.length > 0 ? (
        <div className="requests-stats__kpi-grid">
          {payload.kpis.map((kpi) => (
            <article key={kpi.key} className="requests-stats-kpi">
              <div className="requests-stats-kpi__top">
                <span className="requests-stats-kpi__label">{kpi.label}</span>
                <strong className="requests-stats-kpi__value">{kpi.value}</strong>
              </div>
              {kpi.delta ? (
                <span className={`requests-stats-kpi__delta is-${kpi.tone ?? 'neutral'}`.trim()}>
                  {kpi.delta}
                </span>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <section className="requests-stats-chart">
        <div className="requests-stats-chart__header">
          <p className="requests-stats-chart__title">{payload.chartTitle}</p>
          {payload.chartDelta ? (
            <span className="requests-stats-chart__delta">{payload.chartDelta}</span>
          ) : null}
        </div>
        <MiniChart points={chartPoints} />
      </section>

      <section className="requests-stats-secondary">
        <div className="requests-stats-secondary__top">
          <span>
            <strong>{payload.secondary.leftValue}</strong> {payload.secondary.leftLabel}
          </span>
          <span>
            <strong>{payload.secondary.centerValue}</strong> {payload.secondary.centerLabel}
          </span>
          <span>
            <strong>{payload.secondary.rightValue}</strong> {payload.secondary.rightLabel}
          </span>
        </div>
        <div className="requests-stats-secondary__progress">
          <div className="requests-stats-secondary__progress-label">
            {payload.secondary.progressLabel}{' '}
            <strong>{payload.secondary.progressValue}%</strong>
          </div>
          <div className="requests-stats-secondary__track">
            <span
              className="requests-stats-secondary__fill"
              style={{
                width: `${Math.max(0, Math.min(100, payload.secondary.progressValue))}%`,
              }}
            />
          </div>
        </div>
        <div className="requests-stats-secondary__response">
          {payload.secondary.responseLabel} <strong>{payload.secondary.responseValue}</strong>
        </div>
      </section>

      {payload.showHint !== false ? (
        <section className="requests-stats-hint">
          <p className="requests-stats-hint__text">{payload.hint.text}</p>
          <Link href={payload.hint.ctaHref} className="btn-ghost is-primary">
            {payload.hint.ctaLabel}
          </Link>
        </section>
      ) : null}
    </>
  );
}

export function RequestsStatsPanel({
  title,
  titleByTab,
  tabsLabel,
  provider,
  client,
  tab: forcedTab,
  showTabs = true,
  defaultTab = 'provider',
  preferredTab,
  storageKey = 'dc_stats_tab',
  loading = false,
  error = false,
  errorLabel = 'Failed to load stats.',
  className,
}: RequestsStatsPanelProps) {
  const [tab, setTab] = React.useState<StatsTab>(defaultTab);
  const [stableContentMinHeight, setStableContentMinHeight] = React.useState<number | undefined>(
    undefined,
  );
  const activeContentRef = React.useRef<HTMLDivElement | null>(null);
  const providerMeasureRef = React.useRef<HTMLDivElement | null>(null);
  const clientMeasureRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (preferredTab) {
      setTab(preferredTab);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, preferredTab);
      }
      return;
    }
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored === 'provider' || stored === 'client') {
      setTab(stored);
      return;
    }
    setTab(defaultTab);
  }, [defaultTab, preferredTab, storageKey]);

  const switchTab = React.useCallback(
    (next: StatsTab) => {
      setTab(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, next);
      }
    },
    [storageKey],
  );

  const activeTab = forcedTab ?? tab;
  const resolvedTitle = titleByTab?.[activeTab] ?? title;
  const providerViewModel = React.useMemo(() => toPayloadViewModel(provider), [provider]);
  const clientViewModel = React.useMemo(() => toPayloadViewModel(client), [client]);
  const activeViewModel = activeTab === 'provider' ? providerViewModel : clientViewModel;

  React.useLayoutEffect(() => {
    if (loading || error) {
      setStableContentMinHeight(undefined);
      return;
    }

    const nodes = [
      activeContentRef.current,
      providerMeasureRef.current,
      clientMeasureRef.current,
    ].filter((node): node is HTMLDivElement => node !== null);

    if (nodes.length === 0) return;

    const measure = () => {
      const nextHeight = Math.max(...nodes.map((node) => Math.ceil(node.getBoundingClientRect().height)));
      if (nextHeight <= 0) return;
      setStableContentMinHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [activeTab, client, error, loading, provider]);

  return (
    <section className={`panel requests-stats ${className ?? ''}`.trim()} style={{ position: 'relative' }}>
      <div className="requests-stats__header">
        <p className="section-title">{resolvedTitle}</p>
        {showTabs ? (
          <div className="howitworks-tabs" role="group" aria-label={resolvedTitle}>
            <button
              type="button"
              aria-pressed={activeTab === 'provider'}
              className={`howitworks-tab ${activeTab === 'provider' ? 'is-active' : ''}`.trim()}
              onClick={() => switchTab('provider')}
            >
              {tabsLabel.provider}
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'client'}
              className={`howitworks-tab ${activeTab === 'client' ? 'is-active' : ''}`.trim()}
              onClick={() => switchTab('client')}
            >
              {tabsLabel.client}
            </button>
          </div>
        ) : null}
      </div>
      {!loading && !error ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <div ref={providerMeasureRef}>
            <StatsBody viewModel={providerViewModel} />
          </div>
          <div ref={clientMeasureRef}>
            <StatsBody viewModel={clientViewModel} />
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="requests-stats__loading">
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-28 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
      ) : error ? (
        <div className="requests-stats__error">
          <p className="typo-small">{errorLabel}</p>
        </div>
      ) : (
        <div ref={activeContentRef} style={stableContentMinHeight ? { minHeight: stableContentMinHeight } : undefined}>
          <StatsBody viewModel={activeViewModel} />
        </div>
      )}
    </section>
  );
}

function MiniChart({ points }: { points: ChartPoint[] }) {
  const maxBar = Math.max(1, ...points.map((point) => point.bars));
  const maxLine = Math.max(1, ...points.map((point) => point.line));
  const linePath = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - (point.line / maxLine) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="requests-mini-chart">
      <div className="requests-mini-chart__plot">
        {points.map((point, index) => (
          <div key={`${point.label}-${index}`} className="requests-mini-chart__column">
            <span
              className="requests-mini-chart__bar"
              style={{ height: `${Math.max(6, (point.bars / maxBar) * 100)}%` }}
            />
            <span className="requests-mini-chart__label">{point.label}</span>
          </div>
        ))}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="requests-mini-chart__line"
        >
          <path d={linePath} />
        </svg>
      </div>
    </div>
  );
}
