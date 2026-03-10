'use client';

import Link from 'next/link';

import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspacePublicDemandMapPanel } from '@/features/workspace/requests/WorkspacePublicDemandMapPanel';
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
    cityMapPayload,
    funnel,
    conversion,
    insights,
    growthCards,
    onExport,
  } = model;

  return (
    <section className="panel requests-stats workspace-statistics" aria-labelledby="workspace-statistics-title">
      <header className="requests-stats__header workspace-statistics__header">
        <div className="workspace-statistics__heading">
          <p id="workspace-statistics-title" className="section-title">
            {t(I18N_KEYS.homePublic.exploreStats)}
          </p>
          <p className="typo-small">{copy.subtitle}</p>
        </div>
        <div className="workspace-statistics__controls">
          <div className="requests-stats__tabs workspace-statistics__ranges" role="group" aria-label={copy.rangeGroupLabel}>
            {RANGE_OPTIONS.map((option, index) => {
              const isActive = option === range;
              return (
                <button
                  key={`${option}-${index}`}
                  type="button"
                  className={`requests-stats__tab workspace-statistics__range-chip ${isActive ? 'is-active' : ''}`.trim()}
                  onClick={() => setRange(option)}
                  aria-pressed={isActive}
                >
                  {rangeLabel(option, copy)}
                </button>
              );
            })}
          </div>
          <button type="button" className="btn-ghost is-primary workspace-statistics__export" onClick={onExport}>
            {copy.exportLabel}
          </button>
        </div>
      </header>

      <div className="workspace-statistics__mode-row">
        <span className="workspace-statistics__mode-badge">{modeLabel}</span>
        <span className="typo-small">{copy.kpiTitle}</span>
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
          <div className="workspace-statistics__layout">
            <div className="workspace-statistics__main">
              <section className="requests-stats__kpi-grid workspace-statistics__kpi-grid" aria-label={copy.kpiTitle}>
                {kpis.map((item, index) => (
                  <article key={`${item.key}-${index}`} className="requests-stats-kpi workspace-statistics-kpi">
                    <p className="requests-stats-kpi__label workspace-statistics-kpi__label">{item.label}</p>
                    <strong className="requests-stats-kpi__value workspace-statistics-kpi__value">{item.value}</strong>
                    <p className={`requests-stats-kpi__delta ${item.tone === 'positive' ? 'is-accent' : 'is-neutral'} workspace-statistics-kpi__delta`.trim()}>
                      {item.hint}
                    </p>
                  </article>
                ))}
              </section>

              <div className="workspace-statistics__grid workspace-statistics__grid--primary">
                <section className="workspace-statistics__tile">
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

                <section className="workspace-statistics__tile">
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
                <section className="workspace-statistics__tile">
                  <header className="workspace-statistics__tile-header">
                    <p className="section-title">{copy.citiesTitle}</p>
                    <p className="typo-small">{copy.citiesSubtitle}</p>
                  </header>
                  {cityRows.length === 0 ? (
                    <p className="workspace-statistics__empty">{copy.emptyCities}</p>
                  ) : (
                    <ol className="workspace-statistics-city-list">
                      {cityRows.map((item, index) => (
                        <li key={`${item.key}-${index}`} className="workspace-statistics-city-list__item">
                          <span className="workspace-statistics-city-list__rank">{index + 1}</span>
                          <span className="workspace-statistics-city-list__name">{item.name}</span>
                          <span className="workspace-statistics-city-list__count">{formatNumber.format(item.count)}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                <section className="workspace-statistics__tile">
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
            </div>

            <aside className="workspace-statistics__rail">
              <div className="workspace-statistics__map-tile">
                <WorkspacePublicDemandMapPanel
                  t={t}
                  locale={locale}
                  cityActivity={cityMapPayload.cityActivity}
                  summary={cityMapPayload.summary}
                  isLoading={false}
                  isError={false}
                />
              </div>

              <section className="workspace-statistics__tile">
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
                <section className="workspace-statistics__tile workspace-statistics__growth">
                  <header className="workspace-statistics__tile-header">
                    <p className="section-title">{copy.growthTitle}</p>
                    <p className="typo-small">{copy.growthSubtitle}</p>
                  </header>
                  <div className="workspace-statistics-growth__grid">
                    {growthCards.map((card, index) => (
                      <article key={`${card.key}-${index}`} className="workspace-statistics-growth__card">
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
            </aside>
          </div>
        </>
      )}
    </section>
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
  if (points.length === 0) {
    return <p className="workspace-statistics__empty">{emptyLabel}</p>;
  }

  const width = 100;
  const height = 100;
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.requests, point.offers]));
  const step = width / Math.max(points.length - 1, 1);

  const toY = (value: number) => {
    const top = 8;
    const bottom = 88;
    return bottom - (value / maxValue) * (bottom - top);
  };

  const requestsPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.requests)}`)
    .join(' ');
  const offersPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.offers)}`)
    .join(' ');

  return (
    <div className="requests-stats-chart workspace-statistics-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="workspace-statistics-chart__svg"
        role="img"
        aria-label={`${requestsLabel} / ${offersLabel}`}
      >
        <line x1="0" y1="88" x2={String(width)} y2="88" className="workspace-statistics-chart__axis" />
        <path d={requestsPath} className="workspace-statistics-chart__line is-requests" />
        <path d={offersPath} className="workspace-statistics-chart__line is-offers" />
      </svg>
      <div className="workspace-statistics-chart__labels">
        {points.map((point, index) => (
          <span key={`${point.label}-${index}`}>{point.label}</span>
        ))}
      </div>
      <div className="workspace-statistics-chart__legend" aria-hidden="true">
        <span className="workspace-statistics-chart__legend-item is-requests">{requestsLabel}</span>
        <span className="workspace-statistics-chart__legend-item is-offers">{offersLabel}</span>
      </div>
    </div>
  );
}
