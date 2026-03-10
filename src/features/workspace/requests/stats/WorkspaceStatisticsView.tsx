'use client';

import Link from 'next/link';
import * as React from 'react';

import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from './useWorkspaceStatisticsModel';

type WorkspaceStatisticsViewProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
};

const RANGE_OPTIONS: WorkspaceStatisticsRange[] = ['24h', '7d', '30d', '90d'];

function rangeLabel(range: WorkspaceStatisticsRange, localeCopy: WorkspaceStatisticsModel['copy']) {
  if (range === '24h') return localeCopy.range24h;
  if (range === '7d') return localeCopy.range7d;
  if (range === '30d') return localeCopy.range30d;
  return localeCopy.range90d;
}

export function WorkspaceStatisticsView({
  t,
  locale,
  model,
}: WorkspaceStatisticsViewProps) {
  const formatNumber = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US');
  const {
    copy,
    range,
    setRange,
    isLoading,
    isError,
    modeLabel,
    kpis,
    activityPoints,
    activityMeta,
    demandRows,
    cityRows,
    funnel,
    conversion,
    insights,
    growthCards,
    onExport,
  } = model;

  return (
    <div className="requests-grid requests-grid--equal-cols" aria-labelledby="workspace-statistics-title">
      <section className="panel requests-stats workspace-statistics">
        <header className="requests-stats__header">
          <div className="section-heading">
            <p id="workspace-statistics-title" className="section-title">
              {t(I18N_KEYS.homePublic.exploreStats)}
            </p>
            <p className="typo-small">{copy.subtitle}</p>
          </div>
          <div className="chip-row">
            <div className="home-activity__ranges" role="group" aria-label={copy.rangeGroupLabel}>
              {RANGE_OPTIONS.map((option, index) => {
                const isActive = option === range;
                return (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    className={`home-activity__range ${isActive ? 'is-active' : ''}`.trim()}
                    onClick={() => setRange(option)}
                    aria-pressed={isActive}
                  >
                    {rangeLabel(option, copy)}
                  </button>
                );
              })}
            </div>
            <div className="topbar-nav topbar-nav--desktop">
              <button type="button" className="topbar-nav__item is-active" onClick={onExport}>
                <span className="topbar-nav__label">{copy.exportLabel}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="panel-header workspace-statistics__mode-row">
          <span className="workspace-statistics__mode-badge">{modeLabel}</span>
          <span className="section-subtitle">{copy.kpiTitle}</span>
        </div>

        {isLoading ? (
          <div className="requests-stats__loading workspace-statistics__loading">
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-64 w-full" />
            <div className="skeleton h-64 w-full" />
          </div>
        ) : isError ? (
          <div className="requests-stats__error workspace-statistics__error">
            <p className="typo-small">{t(I18N_KEYS.requestsPage.statsLoadError)}</p>
          </div>
        ) : (
          <>
            <section className="requests-stats__kpi-grid" aria-label={copy.kpiTitle}>
              {kpis.map((item, index) => (
                <article key={`${item.key}-${index}`} className="requests-stats-kpi">
                  <p className="requests-stats-kpi__label">{item.label}</p>
                  <strong className="requests-stats-kpi__value">{item.value}</strong>
                  <p className={`requests-stats-kpi__delta ${item.tone === 'positive' ? 'is-accent' : 'is-neutral'}`.trim()}>
                    {item.hint}
                  </p>
                </article>
              ))}
            </section>

            <div className="workspace-statistics__grid workspace-statistics__grid--primary">
              <section className="requests-stats-chart">
                <header className="workspace-statistics__tile-header">
                  <p className="section-title">{copy.activityTitle}</p>
                  <p className="typo-small">{copy.activitySubtitle}</p>
                </header>
                <ActivityTrendChart
                  points={activityPoints}
                  requestsLabel={copy.requestsLabel}
                  offersLabel={copy.offersLabel}
                  emptyLabel={copy.emptyActivity}
                />
                <div className="workspace-statistics__meta-grid">
                  <div>
                    <span>{copy.peakLabel}</span>
                    <strong>{activityMeta.peak}</strong>
                  </div>
                  <div>
                    <span>{copy.bestWindowLabel}</span>
                    <strong>{activityMeta.bestWindow}</strong>
                  </div>
                  <div>
                    <span>{copy.updatedLabel}</span>
                    <strong>{activityMeta.updatedAt}</strong>
                  </div>
                </div>
              </section>

              <section className="requests-stats-chart">
                <header className="workspace-statistics__tile-header">
                  <p className="section-title">{copy.demandTitle}</p>
                  <p className="typo-small">{copy.demandSubtitle}</p>
                </header>
                {demandRows.length === 0 ? (
                  <p className="workspace-statistics__empty">{copy.emptyDemand}</p>
                ) : (
                  <ul className="workspace-statistics-demand" aria-label={copy.demandTitle}>
                    {demandRows.map((row, index) => (
                      <li key={`${row.categoryKey ?? row.categoryName}-${index}`} className="workspace-statistics-demand__row">
                        <div className="workspace-statistics-demand__meta">
                          <span className="workspace-statistics-demand__label">{row.categoryName}</span>
                          <span className="workspace-statistics-demand__value">{row.sharePercent}%</span>
                        </div>
                        <div className="workspace-statistics-demand__track" aria-hidden="true">
                          <span className="workspace-statistics-demand__fill" style={{ width: `${row.sharePercent}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="workspace-statistics__grid workspace-statistics__grid--secondary">
              <section className="requests-stats-chart">
                <header className="workspace-statistics__tile-header">
                  <p className="section-title">{copy.citiesTitle}</p>
                  <p className="typo-small">{copy.citiesSubtitle}</p>
                </header>
                {cityRows.length === 0 ? (
                  <p className="workspace-statistics__empty">{copy.emptyCities}</p>
                ) : (
                  <ol className="workspace-statistics-city-list">
                    {cityRows.map((item, index) => (
                      <li key={`${item.key}-${index}`} className="list-item workspace-statistics-city-list__item">
                        <span className="workspace-statistics-city-list__rank">{index + 1}</span>
                        <span className="workspace-statistics-city-list__name">{item.name}</span>
                        <span className="workspace-statistics-city-list__count">{formatNumber.format(item.count)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="requests-stats-chart">
                <header className="workspace-statistics__tile-header">
                  <p className="section-title">{copy.profileTitle}</p>
                  <p className="typo-small">
                    {model.mode === 'personalized' ? copy.profileSubtitlePersonalized : copy.profileSubtitlePlatform}
                  </p>
                </header>
                <div className="workspace-statistics-funnel" aria-label={copy.profileTitle}>
                  {funnel.map((step, index) => (
                    <div key={`${step.key}-${index}`} className="workspace-statistics-funnel__step">
                      <div className="workspace-statistics-funnel__row">
                        <span>{step.label}</span>
                        <strong>{step.value}</strong>
                      </div>
                      {index < funnel.length - 1 ? <span className="workspace-statistics-funnel__arrow">↓</span> : null}
                    </div>
                  ))}
                  <div className="workspace-statistics-funnel__conversion">
                    <span>{copy.conversionLabel}</span>
                    <strong>{conversion}</strong>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </section>

      <aside className="stack-md">
        {isLoading ? (
          <>
            <section className="panel"><div className="skeleton h-36 w-full" /></section>
            <section className="panel"><div className="skeleton h-48 w-full" /></section>
          </>
        ) : isError ? (
          <section className="panel">
            <p className="typo-small">{t(I18N_KEYS.requestsPage.statsLoadError)}</p>
          </section>
        ) : (
          <>
            <section className="panel stack-sm">
              <header className="workspace-statistics__tile-header">
                <p className="section-title">{copy.insightsTitle}</p>
              </header>
              {insights.length === 0 ? (
                <p className="workspace-statistics__empty">{copy.emptyInsights}</p>
              ) : (
                <ul className="workspace-statistics-insights" aria-label={copy.insightsTitle}>
                  {insights.map((item, index) => (
                    <li key={`${item.key}-${index}`} className={`workspace-statistics-insights__item is-${item.level}`.trim()}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {growthCards.length > 0 ? (
              <section className="panel stack-sm workspace-statistics__growth">
                <header className="workspace-statistics__tile-header">
                  <p className="section-title">{copy.growthTitle}</p>
                  <p className="typo-small">{copy.growthSubtitle}</p>
                </header>
                <div className="workspace-statistics-growth__grid">
                  {growthCards.map((card, index) => (
                    <article key={`${card.key}-${index}`} className="stat-card workspace-statistics-growth__card">
                      <p className="workspace-statistics-growth__title">{card.title}</p>
                      <p className="workspace-statistics-growth__body">{card.body}</p>
                      <Link href={card.href} prefetch={false} className="btn-ghost is-primary workspace-statistics-growth__cta">
                        {copy.growthCta}
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </aside>
    </div>
  );
}

function ActivityTrendChart({
  points,
  requestsLabel,
  offersLabel,
  emptyLabel,
}: {
  points: Array<{ label: string; requests: number; offers: number }>;
  requestsLabel: string;
  offersLabel: string;
  emptyLabel: string;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    setActiveIndex(Math.max(0, points.length - 1));
  }, [points]);

  if (points.length === 0) {
    return <p className="workspace-statistics__empty">{emptyLabel}</p>;
  }

  const width = 100;
  const height = 100;
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.requests, point.offers]));
  const step = width / Math.max(points.length - 1, 1);
  const active = points[activeIndex] ?? points[points.length - 1];

  const toY = (value: number) => {
    const top = 10;
    const bottom = 85;
    return bottom - (value / maxValue) * (bottom - top);
  };

  const requestsPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.requests)}`)
    .join(' ');
  const offersPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.offers)}`)
    .join(' ');

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const progress = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(progress * Math.max(points.length - 1, 0));
    setActiveIndex(index);
  };

  return (
    <div className="home-activity__content workspace-statistics-chart">
      <div className="home-activity__chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="home-activity__svg"
          role="img"
          aria-label={`${requestsLabel} / ${offersLabel}`}
          onPointerMove={handlePointerMove}
        >
          <line x1="0" y1="85" x2={String(width)} y2="85" className="home-activity__axis" />
          <path d={requestsPath} className="home-activity__line is-requests" />
          <path d={offersPath} className="home-activity__line is-offers" />
          {points.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              <circle
                cx={index * step}
                cy={toY(point.requests)}
                r={activeIndex === index ? 1.8 : 0.85}
                className="home-activity__dot is-requests"
              />
              <circle
                cx={index * step}
                cy={toY(point.offers)}
                r={activeIndex === index ? 1.8 : 0.85}
                className="home-activity__dot is-offers"
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="home-activity__meta">
        <div className="home-activity__point-time">{active?.label ?? '—'}</div>
        <div className="home-activity__legend" aria-hidden="true">
          <span className="home-activity__metric is-requests">
            {requestsLabel}: <strong>{active?.requests ?? 0}</strong>
          </span>
          <span className="home-activity__metric is-offers">
            {offersLabel}: <strong>{active?.offers ?? 0}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
