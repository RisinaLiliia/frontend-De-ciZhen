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
  activeRequestsCount: number;
  activeProvidersCount: number;
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
  activeRequestsCount,
  activeProvidersCount,
  mapHostRef,
  topAccessibleCities,
}: WorkspacePublicDemandMapViewProps) {
  const showLoadingState = isLoading && !isError;
  const showEmptyState = !isLoading && !isError && !hasCoordinates;

  return (
    <section className="panel workspace-public-demand-map">
      <header className="workspace-public-demand-map__header">
        <p className="section-title">{t(I18N_KEYS.homePublic.demandMapTitle)}</p>
        <p className="typo-small">{t(I18N_KEYS.homePublic.demandMapSubtitle)}</p>
      </header>

      <div className="workspace-public-demand-map__canvas">
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

        {!isLoading && !isError ? (
          <div className="workspace-public-demand-map__meta workspace-public-demand-map__meta--overlay dc-surface dc-glow">
            <span>
              <strong>{formatNumber.format(activeRequestsCount)}</strong> {t(I18N_KEYS.homePublic.demandMapActiveRequests)}
            </span>
            <span>
              <strong>{formatNumber.format(activeProvidersCount)}</strong> {t(I18N_KEYS.homePublic.demandMapActiveProviders)}
            </span>
          </div>
        ) : null}
      </div>
      {topAccessibleCities.length > 0 ? (
        <div className="sr-only" aria-live="polite">
          <p>{t(I18N_KEYS.homePublic.demandMapTitle)}</p>
          <ul>
            {topAccessibleCities.map((city) => (
              <li key={city.id}>
                {city.name}: {formatNumber.format(city.count)} {t(I18N_KEYS.homePublic.demandMapActiveRequests)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
