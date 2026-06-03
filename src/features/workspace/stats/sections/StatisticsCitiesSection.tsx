'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import { StatisticsCitiesPanel } from '../StatisticsSections';

type StatisticsCitiesSectionProps = {
  panelRef: React.RefObject<HTMLElement | null>;
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
  subtitle: string;
  cityRowsLength: number;
  activeCityId: string | null;
  visibleCityRows: WorkspaceStatisticsModel['cityListRows'];
  cityListPage: number;
  cityListLimit: number;
  cityOptions: WorkspaceStatisticsModel['cityOptions'];
  cityTotalPages: number;
  onSelectCity: (cityId: string | null) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  cityComparison: WorkspaceStatisticsModel['cityComparison'];
  t: (key: I18nKey) => string;
  formatNumber: Intl.NumberFormat;
  formatMarketBalance: Intl.NumberFormat;
};

export function StatisticsCitiesSection({
  panelRef,
  copy,
  locale,
  subtitle,
  cityRowsLength,
  activeCityId,
  visibleCityRows,
  cityListPage,
  cityListLimit,
  cityOptions,
  cityTotalPages,
  onSelectCity,
  onPrevPage,
  onNextPage,
  cityComparison,
  t,
  formatNumber,
  formatMarketBalance,
}: StatisticsCitiesSectionProps) {
  return (
    <StatisticsCitiesPanel
      panelRef={panelRef}
      copy={copy}
      locale={locale}
      subtitle={subtitle}
      cityRowsLength={cityRowsLength}
      activeCityId={activeCityId}
      visibleCityRows={visibleCityRows}
      cityListPage={cityListPage}
      cityListLimit={cityListLimit}
      cityOptions={cityOptions}
      cityTotalPages={cityTotalPages}
      onSelectCity={onSelectCity}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      formatNumber={formatNumber}
      formatMarketBalance={formatMarketBalance}
      cityComparison={cityComparison}
      t={t}
    />
  );
}
