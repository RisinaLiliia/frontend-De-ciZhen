'use client';

import { IconDownload } from '@/components/ui/icons/icons';
import { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import {
  ALL_CATEGORIES_VALUE,
  ALL_CITIES_VALUE,
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
  activityTrend,
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
  locale,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  filters: WorkspaceStatisticsModel['filters'];
  cityOptions: WorkspaceStatisticsModel['cityOptions'];
  categoryOptions: WorkspaceStatisticsModel['categoryOptions'];
  context: WorkspaceStatisticsModel['context'];
  activityTrend: WorkspaceStatisticsModel['activityTrend'];
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
  locale: Locale;
}) {
  const cityValue = filters.cityId ?? ALL_CITIES_VALUE;
  const categoryValue = filters.categoryKey ?? ALL_CATEGORIES_VALUE;
  const loadingLabel = locale === 'de' ? 'Aktualisiere…' : 'Refreshing…';
  const emptyLabel = locale === 'de' ? 'Keine Ergebnisse' : 'No results';
  const errorLabel = locale === 'de' ? 'Daten konnten nicht geladen werden.' : 'Data could not be loaded.';
  const selectedCityLabel = cityOptions.find((option) => option.value === cityValue)?.label ?? copy.contextAllCitiesLabel;
  const selectedCategoryLabel = categoryOptions.find((option) => option.value === categoryValue)?.label ?? copy.contextAllCategoriesLabel;
  const summaryBlock = showSummary ? (
    <>
      <div className="workspace-statistics-context__summary-head">
        <div className="workspace-statistics-context__summary-copy">
          <span className="workspace-statistics-context__summary-label">{copy.contextAnalysisLabel}</span>
          <strong className="workspace-statistics-context__summary-value">{context.stickyLabel}</strong>
          <p className="workspace-statistics-context__summary-text">{context.subtitle}</p>
        </div>
        <article className={`stat-card workspace-statistics-context__trend-card is-${activityTrend.tone}`.trim()}>
          <span className="stat-label">{activityTrend.label}</span>
          <strong className="stat-value">{activityTrend.value}</strong>
        </article>
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
    </>
  ) : null;

  const controlsInner = (
    <WorkspaceSharedContextControls
      title={copy.contextTitle}
      locale={locale}
      resetLabel={copy.contextResetLabel}
      closeLabel={closeLabel}
      city={{
        value: cityValue,
        allOption: { value: ALL_CITIES_VALUE, label: copy.contextAllCitiesLabel },
        ariaLabel: copy.contextCityLabel,
        onChange: (next) => onCityChange(next === ALL_CITIES_VALUE ? null : next),
        summaryLabel: selectedCityLabel,
        placeholder: selectedCityLabel,
        searchPlaceholder: copy.contextCityLabel,
        loadingLabel,
        emptyLabel,
        errorLabel,
      }}
      category={{
        value: categoryValue,
        options: [
          { value: ALL_CATEGORIES_VALUE, label: copy.contextAllCategoriesLabel },
          ...categoryOptions,
        ],
        ariaLabel: copy.contextCategoryLabel,
        onChange: (next) => onCategoryChange(next === ALL_CATEGORIES_VALUE ? null : next),
        summaryLabel: selectedCategoryLabel,
      }}
      range={{
        value: filters.period,
        options: RANGE_OPTIONS.map((option) => ({
          value: option,
          label: rangeLabel(option, copy),
        })),
        mobileOptions: RANGE_OPTIONS.map((option) => ({
          value: option,
          label: rangeLabelShort(option),
        })),
        groupLabel: copy.rangeGroupLabel,
        onChange: onRangeChange,
        summaryLabel: rangeLabelShort(filters.period),
      }}
      onReset={onReset}
      action={{
        label: copy.exportLabel,
        onClick: onExport,
        icon: <IconDownload />,
        tooltip: copy.exportLabel,
      }}
      surface={surface === 'embedded' ? 'embedded' : 'shell'}
      className="workspace-statistics-context__shared-controls"
    />
  );

  const controlsBlock = showControls ? (
    <div className="workspace-statistics-context__controls-desktop">
      {controlsInner}
    </div>
  ) : null;

  const bodyContent = controlsPosition === 'top'
    ? (
      <>
        {controlsBlock}
        {summaryBlock}
      </>
    )
    : (
      <>
        {summaryBlock}
        {controlsBlock}
      </>
    );

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
