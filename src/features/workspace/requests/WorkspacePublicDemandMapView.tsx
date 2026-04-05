'use client';

import * as React from 'react';

import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type WorkspacePublicDemandMapViewProps = {
  t: (key: I18nKey) => string;
  formatNumber: Intl.NumberFormat;
  hasCoordinates: boolean;
  isLoading: boolean;
  isError: boolean;
  surface?: 'panel' | 'embedded';
  panelRef?: React.Ref<HTMLElement>;
  style?: React.CSSProperties;
  className?: string;
  activeRequestsCount: number;
  activeProvidersCount: number;
  mapCanvasRef: React.RefObject<HTMLDivElement | null>;
  mapHostRef: React.RefObject<HTMLDivElement | null>;
  topAccessibleCities: Array<{
    id: string;
    name: string;
    count: number;
  }>;
};

export function WorkspacePublicDemandMapView({
  t,
  formatNumber,
  hasCoordinates,
  isLoading,
  isError,
  surface = 'panel',
  panelRef,
  style,
  className,
  activeRequestsCount,
  activeProvidersCount,
  mapCanvasRef,
  mapHostRef,
  topAccessibleCities,
}: WorkspacePublicDemandMapViewProps) {
  const showLoadingState = isLoading && !isError;
  const showEmptyState = !isLoading && !isError && !hasCoordinates;

  return (
    <section
      ref={panelRef}
      style={style}
      className={[
        surface === 'panel' ? 'panel' : '',
        'workspace-public-demand-map',
        surface === 'embedded' ? 'workspace-public-demand-map--embedded' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
    >
      <header className="workspace-public-demand-map__header workspace-statistics__tile-header">
        <p className="section-title">{t(I18N_KEYS.homePublic.demandMapTitle)}</p>
        <p className="section-subtitle">{t(I18N_KEYS.homePublic.demandMapSubtitle)}</p>
      </header>

      <div ref={mapCanvasRef} className="workspace-public-demand-map__canvas">
        <div
          ref={mapHostRef}
          className="workspace-public-demand-map__leaflet"
          role="img"
          aria-label={t(I18N_KEYS.homePublic.demandMapTitle)}
        />

        {showLoadingState ? (
          <p className="workspace-public-demand-map__state" role="status" aria-live="polite">
            {t(I18N_KEYS.homePublic.demandMapLoading)}
          </p>
        ) : null}
        {isError ? (
          <p className="workspace-public-demand-map__state workspace-public-demand-map__state--error" role="alert">
            {t(I18N_KEYS.homePublic.demandMapError)}
          </p>
        ) : null}
        {showEmptyState ? <p className="workspace-public-demand-map__empty">{t(I18N_KEYS.homePublic.demandMapEmpty)}</p> : null}

      </div>
      {!isLoading && !isError ? (
        <div className="workspace-public-demand-map__meta workspace-public-demand-map__meta--footer">
          <article className="stat-card workspace-public-demand-map__metric">
            <strong className="stat-value">{formatNumber.format(activeRequestsCount)}</strong>
            <span className="stat-label">{t(I18N_KEYS.homePublic.demandMapActiveRequests)}</span>
          </article>
          <article className="stat-card workspace-public-demand-map__metric">
            <strong className="stat-value">{formatNumber.format(activeProvidersCount)}</strong>
            <span className="stat-label">{t(I18N_KEYS.homePublic.demandMapActiveProviders)}</span>
          </article>
        </div>
      ) : null}
      {topAccessibleCities.length > 0 ? (
        <div className="sr-only" aria-live="polite">
          <p>{t(I18N_KEYS.homePublic.demandMapTitle)}</p>
          <ul>
            {topAccessibleCities.map((city, index) => (
              <li key={`${city.id}-${index}`}>
                {city.name}: {formatNumber.format(city.count)} {t(I18N_KEYS.homePublic.demandMapActiveRequests)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
