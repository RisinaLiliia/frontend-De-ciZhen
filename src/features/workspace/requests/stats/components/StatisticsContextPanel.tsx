'use client';

import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import { RequestsFilterSelect } from '@/components/requests/RequestsFilterSelect';
import {
  IconChevronDown,
  IconDownload,
  IconFilter,
} from '@/components/ui/icons/icons';
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
  isUpdating,
  onRangeChange,
  onCityChange,
  onCategoryChange,
  onReset,
  onExport,
  isStickyCompact,
  isExpanded,
  onToggleExpanded,
  showToggle = true,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  filters: WorkspaceStatisticsModel['filters'];
  cityOptions: WorkspaceStatisticsModel['cityOptions'];
  categoryOptions: WorkspaceStatisticsModel['categoryOptions'];
  context: WorkspaceStatisticsModel['context'];
  isUpdating: boolean;
  onRangeChange: (next: WorkspaceStatisticsRange) => void;
  onCityChange: (next: string | null) => void;
  onCategoryChange: (next: string | null) => void;
  onReset: () => void;
  onExport: () => void;
  isStickyCompact: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  showToggle?: boolean;
}) {
  const cityValue = filters.cityId ?? ALL_CITIES_VALUE;
  const categoryValue = filters.categoryKey ?? ALL_CATEGORIES_VALUE;
  const body = (
    <div className="workspace-statistics-context__body">
      <div className="workspace-statistics-context__mobile-header">
        <p className="workspace-statistics-context__mobile-eyebrow">{copy.contextTitle}</p>
        <h2 className="workspace-statistics-context__mobile-title">{copy.contextTitle}</h2>
        <p className="workspace-statistics-context__mobile-summary">{context.stickyLabel}</p>
      </div>
      <div className="panel-header workspace-statistics-context__header">
        <div className="section-heading workspace-statistics-context__heading">
          <p className="section-title">{context.title}</p>
          <p className="section-subtitle">{context.subtitle}</p>
        </div>
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
          <button
            type="button"
            className="panel-action icon-button--hint"
            aria-label={copy.exportLabel}
            title={copy.exportLabel}
            onClick={onExport}
          >
            <IconDownload />
          </button>
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
        <button
          type="button"
          className="panel-action icon-button--hint workspace-statistics-context__mobile-export"
          aria-label={copy.exportLabel}
          title={copy.exportLabel}
          onClick={onExport}
        >
          <IconDownload />
        </button>
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
            className="btn-ghost is-primary requests-clear"
            onClick={onReset}
          >
            <IconFilter />
            {copy.contextResetLabel}
          </button>
        </div>
      </div>

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
    </div>
  );

  if (!showToggle) {
    return (
      <section
        className="workspace-statistics-context workspace-statistics-context--embedded panel is-expanded"
        aria-label={copy.contextTitle}
      >
        {body}
      </section>
    );
  }

  return (
    <section
      className={`workspace-statistics-context panel${isStickyCompact ? ' is-sticky' : ''}${isExpanded ? ' is-expanded' : ' is-collapsed'}${isUpdating ? ' is-updating' : ''}`.trim()}
      aria-label={copy.contextTitle}
    >
      <button
        type="button"
        className="workspace-statistics-context__compact-toggle"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? copy.contextStickyCollapseLabel : copy.contextStickyExpandLabel}
        onClick={onToggleExpanded}
      >
        <span className="workspace-statistics-context__compact-leading">
          <span className="workspace-statistics-context__compact-icon" aria-hidden="true">
            <IconFilter />
          </span>
          <span className="workspace-statistics-context__compact-copy">
            <strong>{context.stickyLabel}</strong>
            <span>{context.scopeLabel}</span>
          </span>
        </span>
        <span className="workspace-statistics-context__compact-trailing">
          {isUpdating ? (
            <span className="workspace-statistics-context__updating-chip">{copy.contextUpdatingLabel}</span>
          ) : null}
          <span className="workspace-statistics-context__compact-chevron" aria-hidden="true">
            <IconChevronDown />
          </span>
        </span>
      </button>

      {isExpanded ? body : null}
    </section>
  );
}
