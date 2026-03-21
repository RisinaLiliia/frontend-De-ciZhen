'use client';

import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import { RequestsFilterSelect } from '@/components/requests/RequestsFilterSelect';
import { IconDownload, IconFilter } from '@/components/ui/icons/icons';
import { WorkspaceMobileFiltersSheet } from '@/features/workspace/requests/WorkspaceMobileFiltersSheet';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import {
  ALL_CATEGORIES_VALUE,
  ALL_CITIES_VALUE,
  ALL_SERVICES_VALUE,
  RANGE_OPTIONS,
  rangeLabel,
  rangeLabelShort,
} from './statisticsContext.constants';

export function StatisticsContextPanel({
  copy,
  filters,
  cityOptions,
  categoryOptions,
  context,
  onRangeChange,
  onCityChange,
  onCategoryChange,
  onReset,
  onExport,
  surface = 'panel',
  showSummary = true,
  showControls = true,
  controlsPosition = 'bottom',
  closeLabel = 'Close',
}: {
  copy: WorkspaceStatisticsModel['copy'];
  filters: WorkspaceStatisticsModel['filters'];
  cityOptions: WorkspaceStatisticsModel['cityOptions'];
  categoryOptions: WorkspaceStatisticsModel['categoryOptions'];
  context: WorkspaceStatisticsModel['context'];
  onRangeChange: (next: WorkspaceStatisticsRange) => void;
  onCityChange: (next: string | null) => void;
  onCategoryChange: (next: string | null) => void;
  onReset: () => void;
  onExport: () => void;
  surface?: 'panel' | 'embedded';
  showSummary?: boolean;
  showControls?: boolean;
  controlsPosition?: 'top' | 'bottom';
  closeLabel?: string;
}) {
  const cityValue = filters.cityId ?? ALL_CITIES_VALUE;
  const categoryValue = filters.categoryKey ?? ALL_CATEGORIES_VALUE;
  const selectedCityLabel = cityOptions.find((option) => option.value === cityValue)?.label ?? copy.contextAllCitiesLabel;
  const selectedCategoryLabel = categoryOptions.find((option) => option.value === categoryValue)?.label ?? copy.contextAllCategoriesLabel;
  const summaryBlock = showSummary ? (
    <>
      <div className="workspace-statistics-context__health-grid" aria-label={context.scopeLabel}>
        {context.healthMetrics.map((metric) => (
          <article
            key={metric.key}
            className={`stat-card workspace-statistics-context__health-card is-${metric.tone}`.trim()}
          >
            <span className="stat-label">{metric.label}</span>
            <strong className="stat-value">{metric.value}</strong>
          </article>
        ))}
      </div>

      {context.isLowData && context.lowDataTitle && context.lowDataBody ? (
        <div className="workspace-statistics-context__notice" role="status">
          <strong>{context.lowDataTitle}</strong>
          <p>{context.lowDataBody}</p>
        </div>
      ) : null}
    </>
  ) : null;

  const controlsInner = (
    <>
      <div className={`workspace-statistics-context__toolbar${showSummary ? ' workspace-statistics-context__toolbar--with-summary' : ''}`.trim()}>
        <div className="workspace-statistics-context__header-actions">
          <div className="workspace-statistics-context__range-wrap">
            <RangeActionToolbar
              className="workspace-statistics-context__range-toolbar"
              groupLabel={copy.rangeGroupLabel}
              options={RANGE_OPTIONS.map((option) => ({
                value: option,
                label: rangeLabel(option, copy),
              }))}
              value={filters.period}
              onChange={onRangeChange}
            />
          </div>
        </div>
      </div>

      <div className="workspace-statistics-context__mobile-range-row">
        <div className="workspace-statistics-context__range-wrap">
          <RangeActionToolbar
            className="workspace-statistics-context__range-toolbar"
            groupLabel={copy.rangeGroupLabel}
            options={RANGE_OPTIONS.map((option) => ({
              value: option,
              label: rangeLabelShort(option),
            }))}
            value={filters.period}
            onChange={onRangeChange}
          />
        </div>
      </div>

      <div className="workspace-statistics-context__filters-shell">
        <div className="requests-filter-grid requests-filter-grid--primary workspace-statistics-context__filters-grid">
          <div className="requests-filter">
            <RequestsFilterSelect
              className="requests-select workspace-statistics-context__select"
              value={cityValue}
              onChange={(next) => onCityChange(next === ALL_CITIES_VALUE ? null : next)}
              options={[
                { value: ALL_CITIES_VALUE, label: copy.contextAllCitiesLabel },
                ...cityOptions,
              ]}
              ariaLabel={copy.contextCityLabel}
            />
          </div>

          <div className="requests-filter">
            <RequestsFilterSelect
              className="requests-select workspace-statistics-context__select"
              value={categoryValue}
              onChange={(next) => onCategoryChange(next === ALL_CATEGORIES_VALUE ? null : next)}
              options={[
                { value: ALL_CATEGORIES_VALUE, label: copy.contextAllCategoriesLabel },
                ...categoryOptions,
              ]}
              ariaLabel={copy.contextCategoryLabel}
            />
          </div>

          <div className="requests-filter">
            <RequestsFilterSelect
              className="requests-select workspace-statistics-context__select"
              value={ALL_SERVICES_VALUE}
              onChange={() => undefined}
              options={[{ value: ALL_SERVICES_VALUE, label: copy.contextAllServicesLabel }]}
              ariaLabel={copy.contextAllServicesLabel}
              disabled
            />
          </div>
        </div>

        <div className="requests-filter-grid requests-filter-grid--secondary workspace-statistics-context__filters-actions">
          <button
            type="button"
            className="panel-action icon-button--hint workspace-statistics-context__icon-action"
            aria-label={copy.contextResetLabel}
            title={copy.contextResetLabel}
            onClick={onReset}
          >
            <IconFilter />
          </button>
          <button
            type="button"
            className="panel-action icon-button--hint workspace-statistics-context__icon-action"
            aria-label={copy.exportLabel}
            title={copy.exportLabel}
            onClick={onExport}
          >
            <IconDownload />
          </button>
        </div>
      </div>
    </>
  );

  const controlsBlock = showControls ? (
    <>
      <div className="workspace-statistics-context__controls-desktop">
        {controlsInner}
      </div>
      {surface === 'embedded' ? (
        <WorkspaceMobileFiltersSheet
          title={copy.contextTitle}
          closeLabel={closeLabel}
          triggerLabel={copy.contextTitle}
          summary={(
            <>
              <span className="workspace-mobile-filters__summary-chip">{rangeLabelShort(filters.period)}</span>
              <span className="workspace-mobile-filters__summary-chip">{selectedCityLabel}</span>
              <span className="workspace-mobile-filters__summary-chip">{selectedCategoryLabel}</span>
            </>
          )}
          className="workspace-statistics-context__controls-mobile"
        >
          <div className="workspace-statistics-context workspace-statistics-context--embedded workspace-statistics-context--controls-only">
            <div className="workspace-statistics-context__body">
              {controlsInner}
            </div>
          </div>
        </WorkspaceMobileFiltersSheet>
      ) : null}
    </>
  ) : null;

  const bodyContent = controlsPosition === 'top'
    ? [controlsBlock, summaryBlock]
    : [summaryBlock, controlsBlock];

  const body = (
    <div className="workspace-statistics-context__body">
      {bodyContent}
    </div>
  );

  const sectionModifiers = `${surface === 'embedded' ? ' workspace-statistics-context--embedded' : ''}${showSummary ? '' : ' workspace-statistics-context--controls-only'}${showControls ? '' : ' workspace-statistics-context--summary-only'}`.trim();
  const baseSectionClass = `${surface === 'panel' ? 'panel ' : ''}${showSummary && !showControls ? 'requests-stats-chart ' : ''}workspace-statistics-context${sectionModifiers ? ` ${sectionModifiers}` : ''}`.trim();

  return (
    <section
      className={baseSectionClass}
      aria-label={copy.contextTitle}
    >
      {body}
    </section>
  );
}
