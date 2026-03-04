'use client';

import * as React from 'react';

import type { WorkspacePublicCityActivityDto } from '@/lib/api/dto/workspace';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspacePublicDemandMapPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  cityActivity: WorkspacePublicCityActivityDto | null | undefined;
};

type DemandCityPoint = {
  id: string;
  fallbackName: string;
  x: number;
  y: number;
  aliases: string[];
};

const DEMAND_CITY_POINTS: DemandCityPoint[] = [
  { id: 'hamburg', fallbackName: 'Hamburg', x: 132, y: 66, aliases: ['hamburg'] },
  { id: 'berlin', fallbackName: 'Berlin', x: 212, y: 106, aliases: ['berlin'] },
  { id: 'bremen', fallbackName: 'Bremen', x: 108, y: 96, aliases: ['bremen'] },
  { id: 'hannover', fallbackName: 'Hannover', x: 138, y: 126, aliases: ['hannover', 'hanover'] },
  { id: 'dortmund', fallbackName: 'Dortmund', x: 96, y: 156, aliases: ['dortmund'] },
  { id: 'duisburg', fallbackName: 'Duisburg', x: 88, y: 164, aliases: ['duisburg'] },
  { id: 'essen', fallbackName: 'Essen', x: 94, y: 162, aliases: ['essen'] },
  { id: 'dusseldorf', fallbackName: 'Düsseldorf', x: 90, y: 170, aliases: ['dusseldorf', 'duesseldorf'] },
  { id: 'koln', fallbackName: 'Köln', x: 88, y: 180, aliases: ['koln', 'koeln', 'cologne'] },
  { id: 'bonn', fallbackName: 'Bonn', x: 90, y: 188, aliases: ['bonn'] },
  { id: 'mannheim', fallbackName: 'Mannheim', x: 108, y: 222, aliases: ['mannheim'] },
  { id: 'heidelberg', fallbackName: 'Heidelberg', x: 114, y: 228, aliases: ['heidelberg'] },
  { id: 'karlsruhe', fallbackName: 'Karlsruhe', x: 110, y: 238, aliases: ['karlsruhe'] },
  { id: 'ludwigshafen', fallbackName: 'Ludwigshafen', x: 106, y: 226, aliases: ['ludwigshafen'] },
  { id: 'darmstadt', fallbackName: 'Darmstadt', x: 120, y: 218, aliases: ['darmstadt'] },
  { id: 'frankfurt', fallbackName: 'Frankfurt', x: 118, y: 212, aliases: ['frankfurt', 'frankfurtammain'] },
  { id: 'wiesbaden', fallbackName: 'Wiesbaden', x: 112, y: 210, aliases: ['wiesbaden'] },
  { id: 'mainz', fallbackName: 'Mainz', x: 110, y: 214, aliases: ['mainz'] },
  { id: 'stuttgart', fallbackName: 'Stuttgart', x: 118, y: 250, aliases: ['stuttgart'] },
  { id: 'nurnberg', fallbackName: 'Nürnberg', x: 164, y: 248, aliases: ['nurnberg', 'nuernberg', 'nuremberg'] },
  { id: 'leipzig', fallbackName: 'Leipzig', x: 188, y: 168, aliases: ['leipzig'] },
  { id: 'dresden', fallbackName: 'Dresden', x: 212, y: 182, aliases: ['dresden'] },
  { id: 'augsburg', fallbackName: 'Augsburg', x: 176, y: 286, aliases: ['augsburg'] },
  { id: 'munchen', fallbackName: 'München', x: 186, y: 304, aliases: ['munchen', 'muenchen', 'munich'] },
];

const CITY_ALIAS_TO_ID = (() => {
  const map = new Map<string, string>();
  DEMAND_CITY_POINTS.forEach((city) => {
    city.aliases.forEach((alias) => {
      map.set(normalizeCityName(alias), city.id);
    });
  });
  return map;
})();

type DemandCityActivity = {
  id: string;
  name: string;
  x: number;
  y: number;
  count: number;
};

function normalizeCityName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function resolveCityId(rawCityName: string) {
  const normalized = normalizeCityName(rawCityName);
  const exactMatch = CITY_ALIAS_TO_ID.get(normalized);
  if (exactMatch) return exactMatch;

  for (const point of DEMAND_CITY_POINTS) {
    for (const alias of point.aliases) {
      if (normalized.includes(normalizeCityName(alias))) {
        return point.id;
      }
    }
  }

  return null;
}

export function WorkspacePublicDemandMapPanel({
  t,
  locale,
  cityActivity,
}: WorkspacePublicDemandMapPanelProps) {
  const formatNumber = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US'),
    [locale],
  );

  const visibleCityActivity = React.useMemo<DemandCityActivity[]>(() => {
    const cityCount = new Map<string, number>();
    const cityName = new Map<string, string>();

    (cityActivity?.items ?? []).forEach((entry) => {
      const cityId = resolveCityId(entry.citySlug || entry.cityName || '');
      if (!cityId) return;
      cityCount.set(cityId, (cityCount.get(cityId) ?? 0) + Math.max(0, entry.requestCount));
      if (!cityName.has(cityId)) {
        cityName.set(cityId, entry.cityName || entry.citySlug || '');
      }
    });

    return DEMAND_CITY_POINTS.map((point) => ({
      id: point.id,
      name: cityName.get(point.id) ?? point.fallbackName,
      x: point.x,
      y: point.y,
      count: cityCount.get(point.id) ?? 0,
    }))
      .filter((city) => city.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [cityActivity]);

  const maxCount = visibleCityActivity[0]?.count ?? 1;
  const activeCitiesCount = cityActivity?.totalActiveCities ?? visibleCityActivity.length;
  const visibleRequestsCount =
    cityActivity?.totalActiveRequests ??
    visibleCityActivity.reduce((sum, city) => sum + city.count, 0);
  const topCities = visibleCityActivity.slice(0, 5);

  return (
    <section className="panel workspace-public-demand-map">
      <header className="workspace-public-demand-map__header">
        <p className="section-title">{t(I18N_KEYS.homePublic.demandMapTitle)}</p>
        <p className="typo-small">{t(I18N_KEYS.homePublic.demandMapSubtitle)}</p>
      </header>

      <div className="workspace-public-demand-map__canvas">
        <svg
          className="workspace-public-demand-map__svg"
          viewBox="0 0 300 390"
          role="img"
          aria-label={t(I18N_KEYS.homePublic.demandMapTitle)}
        >
          <path
            className="workspace-public-demand-map__shape"
            d="M122 18L160 28L182 46L206 58L224 92L236 126L230 150L248 178L238 208L248 242L234 276L240 306L216 334L196 360L172 370L146 354L126 330L104 324L82 300L70 270L54 248L46 220L56 196L50 170L60 146L56 124L68 98L86 86L94 62L112 46L118 30Z"
          />

          {visibleCityActivity.map((city, index) => {
            const intensity = city.count / maxCount;
            const radius = 4.2 + intensity * 4;

            return (
              <g key={city.id}>
                <circle
                  className="workspace-public-demand-map__pulse"
                  cx={city.x}
                  cy={city.y}
                  r={radius + 8}
                  style={{ animationDelay: `${index * 0.14}s` }}
                />
                <circle className="workspace-public-demand-map__dot" cx={city.x} cy={city.y} r={radius} />
                <text className="workspace-public-demand-map__label" x={city.x + 8} y={city.y - 8}>
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="workspace-public-demand-map__meta">
        <span>
          <strong>{formatNumber.format(activeCitiesCount)}</strong> {t(I18N_KEYS.homePublic.demandMapActiveCities)}
        </span>
        <span>
          <strong>{formatNumber.format(visibleRequestsCount)}</strong>{' '}
          {t(I18N_KEYS.homePublic.demandMapActiveRequests)}
        </span>
      </div>

      {topCities.length ? (
        <ul className="workspace-public-demand-map__city-list">
          {topCities.map((city) => (
            <li key={`top-${city.id}`}>
              <span>{city.name}</span>
              <strong>{formatNumber.format(city.count)}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="workspace-public-demand-map__empty">{t(I18N_KEYS.homePublic.demandMapEmpty)}</p>
      )}
    </section>
  );
}
