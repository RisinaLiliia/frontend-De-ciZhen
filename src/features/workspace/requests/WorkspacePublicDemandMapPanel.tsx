'use client';

import * as React from 'react';

import type { WorkspacePublicCityActivityDto, WorkspacePublicSummaryDto } from '@/lib/api/dto/workspace';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

import { normalizeCityActivity } from './mapHelpers';
import { useWorkspacePublicDemandLeafletMap } from './useWorkspacePublicDemandLeafletMap';
import { WorkspacePublicDemandMapView } from './WorkspacePublicDemandMapView';

type WorkspacePublicDemandMapPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  cityActivity: WorkspacePublicCityActivityDto | null | undefined;
  summary?: WorkspacePublicSummaryDto | null;
};

export function WorkspacePublicDemandMapPanel({
  t,
  locale,
  cityActivity,
  summary,
}: WorkspacePublicDemandMapPanelProps) {
  const formatNumber = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US'),
    [locale],
  );

  const visibleCityActivity = React.useMemo(() => normalizeCityActivity(cityActivity?.items ?? []), [cityActivity]);
  const hasCoordinates = visibleCityActivity.length > 0;

  const activeProvidersCount = summary?.totalActiveProviders ?? 0;
  const activeRequestsCount =
    summary?.totalPublishedRequests ??
    cityActivity?.totalActiveRequests ??
    visibleCityActivity.reduce((sum, city) => sum + city.count, 0);

  const { mapHostRef } = useWorkspacePublicDemandLeafletMap({
    cities: visibleCityActivity,
    hasCoordinates,
    formatNumber,
    activeRequestsLabel: t(I18N_KEYS.homePublic.demandMapActiveRequests),
  });

  return (
    <WorkspacePublicDemandMapView
      t={t}
      formatNumber={formatNumber}
      hasCoordinates={hasCoordinates}
      activeRequestsCount={activeRequestsCount}
      activeProvidersCount={activeProvidersCount}
      mapHostRef={mapHostRef}
    />
  );
}
