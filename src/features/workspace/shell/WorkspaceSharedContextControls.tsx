'use client';

import * as React from 'react';

import { RequestsFilterSelect } from '@/components/requests/RequestsFilterSelect';
import type { FilterOption } from '@/components/requests/requestsFilters.types';
import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import { IconFilter, IconPin } from '@/components/ui/icons/icons';
import { WorkspaceMobileFiltersSheet } from '@/features/workspace/requests/WorkspaceMobileFiltersSheet';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';

type WorkspaceSharedContextControlsProps = {
  title: string;
  resetLabel: string;
  closeLabel: string;
  city: {
    value: string;
    options: FilterOption[];
    ariaLabel: string;
    onChange: (value: string) => void;
    summaryLabel: string;
  };
  category: {
    value: string;
    options: FilterOption[];
    ariaLabel: string;
    onChange: (value: string) => void;
    summaryLabel: string;
  };
  service?: {
    value: string;
    options: FilterOption[];
    ariaLabel: string;
    onChange: (value: string) => void;
    summaryLabel: string;
    disabled?: boolean;
  };
  range: {
    value: WorkspaceStatisticsRange;
    options: ReadonlyArray<{ value: WorkspaceStatisticsRange; label: string }>;
    mobileOptions?: ReadonlyArray<{ value: WorkspaceStatisticsRange; label: string }>;
    groupLabel: string;
    onChange: (next: WorkspaceStatisticsRange) => void;
    summaryLabel: string;
  };
  sort?: {
    value: string;
    options: FilterOption[];
    ariaLabel: string;
    onChange: (value: string) => void;
    summaryLabel: string;
  };
  onReset: () => void;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    tooltip?: string;
  };
  className?: string;
  surface?: 'shell' | 'embedded';
  mobileTriggerLabel?: string;
};

export function WorkspaceSharedContextControls({
  title,
  resetLabel,
  closeLabel,
  city,
  category,
  service,
  range,
  sort,
  onReset,
  action,
  className,
  surface = 'shell',
  mobileTriggerLabel,
}: WorkspaceSharedContextControlsProps) {
  const rootClassName = [
    'workspace-shared-context-controls',
    surface === 'shell' ? 'workspace-context-strip' : 'workspace-shared-context-controls--embedded',
    className,
  ].filter(Boolean).join(' ');

  const renderContent = (mobile: boolean) => (
    <div className="requests-filters requests-filters--surface-embedded requests-filters--shell workspace-shared-context-controls__surface">
      <div className="workspace-shared-context-controls__body">
        <div className="requests-filter-grid requests-filter-grid--primary workspace-shared-context-controls__filters-grid">
          <div className="requests-filter">
            <RequestsFilterSelect
              options={city.options}
              value={city.value}
              onChange={city.onChange}
              className="requests-select is-city workspace-shared-context-controls__select"
              ariaLabel={city.ariaLabel}
              icon={<IconPin />}
              iconClassName="requests-select-icon--city"
            />
          </div>

          <div className="requests-filter">
            <RequestsFilterSelect
              options={category.options}
              value={category.value}
              onChange={category.onChange}
              className="requests-select workspace-shared-context-controls__select"
              ariaLabel={category.ariaLabel}
            />
          </div>

          {service ? (
            <div className="requests-filter">
              <RequestsFilterSelect
                options={service.options}
                value={service.value}
                onChange={service.onChange}
                className="requests-select workspace-shared-context-controls__select"
                ariaLabel={service.ariaLabel}
                disabled={service.disabled}
              />
            </div>
          ) : null}
        </div>

        <div className="workspace-shared-context-controls__range-row">
          <RangeActionToolbar
            className="workspace-shared-context-controls__range-toolbar"
            groupLabel={range.groupLabel}
            options={mobile ? (range.mobileOptions ?? range.options) : range.options}
            value={range.value}
            onChange={range.onChange}
            action={!mobile ? action : undefined}
          />
          {sort ? (
            <div className="requests-filter workspace-shared-context-controls__sort-filter">
              <RequestsFilterSelect
                options={sort.options}
                value={sort.value}
                onChange={sort.onChange}
                className="requests-select workspace-shared-context-controls__select"
                ariaLabel={sort.ariaLabel}
              />
            </div>
          ) : null}
          <button
            type="button"
            className="panel-action icon-button--hint workspace-shared-context-controls__action requests-clear requests-clear--icon"
            onClick={onReset}
            aria-label={resetLabel}
            title={resetLabel}
          >
            <IconFilter />
          </button>
          {mobile && action ? (
            <button
              type="button"
              className="workspace-shared-context-controls__secondary-button"
              aria-label={action.label}
              title={action.tooltip ?? action.label}
              onClick={action.onClick}
            >
              {action.icon ?? action.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <section className={rootClassName} aria-label={title}>
      <div className="workspace-context-strip__header">
        <span className="workspace-context-strip__label">{title}</span>
      </div>

      <div className="workspace-shared-context-controls__desktop">
        {renderContent(false)}
      </div>

      <WorkspaceMobileFiltersSheet
        title={title}
        closeLabel={closeLabel}
        triggerLabel={mobileTriggerLabel ?? title}
        summary={(
          <>
            <span className="workspace-mobile-filters__summary-chip">{range.summaryLabel}</span>
            {sort ? (
              <span className="workspace-mobile-filters__summary-chip">{sort.summaryLabel}</span>
            ) : null}
            <span className="workspace-mobile-filters__summary-chip">{city.summaryLabel}</span>
            <span className="workspace-mobile-filters__summary-chip">{category.summaryLabel}</span>
            {service ? (
              <span className="workspace-mobile-filters__summary-chip">{service.summaryLabel}</span>
            ) : null}
          </>
        )}
        className="workspace-shared-context-controls__mobile"
      >
        {renderContent(true)}
      </WorkspaceMobileFiltersSheet>
    </section>
  );
}
