'use client';

import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import { RequestsFilterSelect } from '@/components/requests/RequestsFilterSelect';
import { IconFilter, IconDownload } from '@/components/ui/icons/icons';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import {
  ALL_CATEGORIES_VALUE,
  ALL_CITIES_VALUE,
  RANGE_OPTIONS,
  rangeLabel,
} from './statisticsContext.constants';

type StatisticsQuickControlsProps = {
  copy: WorkspaceStatisticsModel['copy'];
  filters: WorkspaceStatisticsModel['filters'];
  cityOptions: WorkspaceStatisticsModel['cityOptions'];
  categoryOptions: WorkspaceStatisticsModel['categoryOptions'];
  onRangeChange: (next: WorkspaceStatisticsRange) => void;
  onCityChange: (next: string | null) => void;
  onCategoryChange: (next: string | null) => void;
  onReset: () => void;
  onExport: () => void;
};

export function StatisticsQuickControls({
  copy,
  filters,
  cityOptions,
  categoryOptions,
  onRangeChange,
  onCityChange,
  onCategoryChange,
  onReset,
  onExport,
}: StatisticsQuickControlsProps) {
  const cityValue = filters.cityId ?? ALL_CITIES_VALUE;
  const categoryValue = filters.categoryKey ?? ALL_CATEGORIES_VALUE;
  return (
    <div className="workspace-statistics-quick-controls" aria-label={copy.contextTitle}>
      <RangeActionToolbar
        className="workspace-statistics-quick-controls__ranges"
        groupLabel={copy.rangeGroupLabel}
        options={RANGE_OPTIONS.map((option) => ({
          value: option,
          label: rangeLabel(option, copy),
        }))}
        value={filters.period}
        onChange={onRangeChange}
      />

      <RequestsFilterSelect
        className="requests-select workspace-statistics-quick-controls__select"
        value={cityValue}
        onChange={(next) => onCityChange(next === ALL_CITIES_VALUE ? null : next)}
        options={[
          { value: ALL_CITIES_VALUE, label: copy.contextAllCitiesLabel },
          ...cityOptions,
        ]}
        ariaLabel={copy.contextCityLabel}
      />

      <RequestsFilterSelect
        className="requests-select workspace-statistics-quick-controls__select"
        value={categoryValue}
        onChange={(next) => onCategoryChange(next === ALL_CATEGORIES_VALUE ? null : next)}
        options={[
          { value: ALL_CATEGORIES_VALUE, label: copy.contextAllCategoriesLabel },
          ...categoryOptions,
        ]}
        ariaLabel={copy.contextCategoryLabel}
      />

      <button
        type="button"
        className="workspace-statistics-quick-controls__reset icon-button--hint"
        aria-label={copy.contextResetLabel}
        title={copy.contextResetLabel}
        data-tooltip={copy.contextResetLabel}
        onClick={onReset}
      >
        <IconFilter />
      </button>

      <button
        type="button"
        className="workspace-statistics-quick-controls__export icon-button--hint"
        aria-label={copy.exportLabel}
        title={copy.exportLabel}
        data-tooltip={copy.exportLabel}
        onClick={onExport}
      >
        <IconDownload />
      </button>
    </div>
  );
}
