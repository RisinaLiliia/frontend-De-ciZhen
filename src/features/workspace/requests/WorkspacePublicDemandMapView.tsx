'use client';

import * as React from 'react';

import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type WorkspacePublicDemandMapViewProps = {
  t: (key: I18nKey) => string;
  formatNumber: Intl.NumberFormat;
  hasCoordinates: boolean;
  activeRequestsCount: number;
  activeProvidersCount: number;
  mapHostRef: React.RefObject<HTMLDivElement | null>;
};

export function WorkspacePublicDemandMapView({
  t,
  formatNumber,
  hasCoordinates,
  activeRequestsCount,
  activeProvidersCount,
  mapHostRef,
}: WorkspacePublicDemandMapViewProps) {
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

        {!hasCoordinates ? <p className="workspace-public-demand-map__empty">{t(I18N_KEYS.homePublic.demandMapEmpty)}</p> : null}

        <div className="workspace-public-demand-map__meta workspace-public-demand-map__meta--overlay dc-surface dc-glow">
          <span>
            <strong>{formatNumber.format(activeRequestsCount)}</strong> {t(I18N_KEYS.homePublic.demandMapActiveRequests)}
          </span>
          <span>
            <strong>{formatNumber.format(activeProvidersCount)}</strong> {t(I18N_KEYS.homePublic.demandMapActiveProviders)}
          </span>
        </div>
      </div>
    </section>
  );
}
