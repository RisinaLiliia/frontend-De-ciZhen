'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import { RequestsFilterSelect } from '@/components/requests/RequestsFilterSelect';
import { IconDownload, IconFilter, IconSettings } from '@/components/ui/icons/icons';
import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget } from '@/lib/a11y/focusTrap';
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

function getFocusableElements(container: HTMLElement) {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

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
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const portalTarget = typeof document === 'undefined' ? null : document.body;
  const anchorRef = React.useRef<HTMLDivElement | null>(null);

  const resolveLabel = React.useCallback(
    (value: string, options: WorkspaceStatisticsModel['cityOptions'], fallback: string) =>
      options.find((option) => option.value === value)?.label ?? fallback,
    [],
  );

  const cityLabel =
    cityValue === ALL_CITIES_VALUE
      ? copy.contextAllCitiesLabel
      : resolveLabel(cityValue, cityOptions, copy.contextAllCitiesLabel);
  const categoryLabel =
    categoryValue === ALL_CATEGORIES_VALUE
      ? copy.contextAllCategoriesLabel
      : resolveLabel(categoryValue, categoryOptions, copy.contextAllCategoriesLabel);
  const compactSummary = `${rangeLabelShort(filters.period)} · ${cityLabel} · ${categoryLabel}`;

  React.useEffect(() => {
    if (!isSheetOpen) return;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      if (!panel) return;
      const target = resolveInitialFocusTarget(null, getFocusableElements(panel));
      focusIfPresent(target);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSheetOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !panel) return;
      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const target = getTrapFocusTarget({
        focusable,
        activeElement: active,
        container: panel,
        shiftKey: event.shiftKey,
      });
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      focusIfPresent(previouslyFocused);
    };
  }, [isSheetOpen]);

  const openSheet = React.useCallback(() => setIsSheetOpen(true), []);
  const closeSheet = React.useCallback(() => setIsSheetOpen(false), []);

  const [sheetStyle, setSheetStyle] = React.useState<React.CSSProperties | undefined>(undefined);

  React.useEffect(() => {
    if (!isSheetOpen) {
      setSheetStyle(undefined);
      return;
    }
    if (!anchorRef.current) return;

    let frameId: number | null = null;
    const updateStyle = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setSheetStyle({
        ['--quick-sheet-inline' as string]: `${Math.round(rect.left)}px`,
        ['--quick-sheet-width' as string]: `${Math.round(rect.width)}px`,
        ['--quick-sheet-top' as string]: `${Math.round(rect.bottom + 8)}px`,
      });
    };

    const scheduleUpdate = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateStyle);
    };

    updateStyle();

    const anchorObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(scheduleUpdate)
        : null;
    anchorObserver?.observe(anchorRef.current);

    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      anchorObserver?.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [isSheetOpen]);

  return (
    <div className="workspace-statistics-quick-controls" aria-label={copy.contextTitle}>
      <div ref={anchorRef} className="workspace-statistics-quick-controls__compact">
        <div className="workspace-statistics-quick-controls__compact-copy">
          <span className="workspace-statistics-quick-controls__compact-summary">{compactSummary}</span>
        </div>
          <button
            type="button"
            className="workspace-statistics-quick-controls__compact-button"
            aria-label={copy.contextStickyExpandLabel}
            aria-haspopup="dialog"
            aria-expanded={isSheetOpen}
            onClick={openSheet}
          >
            <IconSettings />
          </button>
      </div>

      <div className="workspace-statistics-quick-controls__full">
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

      {isSheetOpen && portalTarget
        ? createPortal(
            <div className="dc-modal workspace-statistics-quick-sheet" role="dialog" aria-modal="true" aria-label={copy.contextStickyExpandLabel}>
              <button type="button" className="dc-modal__backdrop workspace-statistics-quick-sheet__backdrop" onClick={closeSheet} aria-label={copy.contextStickyCollapseLabel} />
              <div
                ref={panelRef}
                className="dc-modal__panel dc-modal__panel--compact workspace-statistics-quick-sheet__panel"
                style={sheetStyle}
              >

                <div className="workspace-statistics-quick-sheet__range-row">
                  <div className="workspace-statistics-context__range-wrap">
                    <RangeActionToolbar
                      className="workspace-statistics-context__range-toolbar workspace-statistics-quick-sheet__ranges"
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
                    className="panel-action icon-button--hint workspace-statistics-quick-sheet__export"
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

                  <div className="requests-filter-grid requests-filter-grid--secondary workspace-statistics-context__filters-actions workspace-statistics-quick-sheet__actions">
                    <button
                      type="button"
                      className="btn-ghost is-primary requests-clear"
                      onClick={closeSheet}
                    >
                      {copy.contextApplyLabel}
                    </button>
                    <button
                      type="button"
                      className="panel-action icon-button--hint workspace-statistics-quick-sheet__reset"
                      aria-label={copy.contextResetLabel}
                      title={copy.contextResetLabel}
                      onClick={onReset}
                    >
                      <IconFilter />
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
}
