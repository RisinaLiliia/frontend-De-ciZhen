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

export function RequestsStatsPanel({
  title,
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
  className,
}: RequestsStatsPanelProps) {
  const [tab, setTab] = React.useState<StatsTab>(defaultTab);

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
  const payload = activeTab === 'provider' ? provider : client;
  const hasData = payload.hasData ?? payload.kpis.some((item) => item.value !== '0' && item.value !== '—');
  const chartPoints = payload.chartPoints.length > 0 ? payload.chartPoints : FALLBACK_POINTS;

  return (
    <section className={`panel requests-stats ${className ?? ''}`.trim()}>
      <div className="requests-stats__header">
        <p className="section-title">{title}</p>
        {showTabs ? (
          <div className="requests-stats__tabs" role="tablist" aria-label={title}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'provider'}
              className={`requests-stats__tab ${activeTab === 'provider' ? 'is-active' : ''}`.trim()}
              onClick={() => switchTab('provider')}
            >
              {tabsLabel.provider}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'client'}
              className={`requests-stats__tab ${activeTab === 'client' ? 'is-active' : ''}`.trim()}
              onClick={() => switchTab('client')}
            >
              {tabsLabel.client}
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="requests-stats__loading">
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-28 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
      ) : error ? (
        <div className="requests-stats__error">
          <p className="typo-small">Statistik konnte nicht geladen werden.</p>
        </div>
      ) : !hasData ? (
        <div className="requests-stats__empty">
          <p className="typo-small">{payload.emptyTitle}</p>
          <Link href={payload.emptyCtaHref} className="btn-ghost is-primary">
            {payload.emptyCtaLabel}
          </Link>
        </div>
      ) : (
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
