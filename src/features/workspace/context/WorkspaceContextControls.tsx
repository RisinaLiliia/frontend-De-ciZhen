'use client';

import * as React from 'react';

import { WorkspaceMobileFiltersSheet } from '@/features/workspace/shared';
import { WorkspaceContextFilters } from '@/features/workspace/context/WorkspaceContextFilters';
import { WorkspaceContextInlineControls } from '@/features/workspace/context/WorkspaceContextInlineControls';
import { WorkspaceContextResultControls } from '@/features/workspace/context/WorkspaceContextResultControls';
import type { WorkspaceContextControlsProps } from '@/features/workspace/context/workspaceContext.types';

export function WorkspaceContextControls({
  title,
  locale,
  resetLabel,
  closeLabel,
  city,
  category,
  service,
  range,
  sort,
  actionRowControl,
  extraFilters,
  inlineControl,
  onReset,
  action,
  className,
  surface = 'shell',
  mobileTriggerLabel,
  mobileBehavior = 'sheet-trigger',
}: WorkspaceContextControlsProps) {
  const rootClassName = [
    'workspace-context-controls',
    surface === 'shell' ? 'workspace-context-controls--shell' : 'workspace-context-controls--embedded',
    className,
  ].filter(Boolean).join(' ');

  const renderContent = (mobile: boolean) => (
    <div className="workspace-context-controls__surface">
      <div className="workspace-context-controls__body">
        <WorkspaceContextInlineControls
          inlineControl={inlineControl}
          extraFilters={extraFilters}
        />

        <WorkspaceContextFilters
          locale={locale}
          city={city}
          category={category}
          service={service}
          range={range}
          mobile={mobile}
        />

        <WorkspaceContextResultControls
          mobile={mobile}
          range={range}
          sort={sort}
          actionRowControl={!mobile ? actionRowControl : undefined}
          resetLabel={resetLabel}
          onReset={onReset}
          action={action}
        />
      </div>
    </div>
  );

  const summary = (
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
      {extraFilters?.map((filter) => (
        <span key={filter.key} className="workspace-mobile-filters__summary-chip">{filter.summaryLabel}</span>
      ))}
    </>
  );

  return (
    <section className={rootClassName} aria-label={title}>
      <div className="workspace-context-controls__header">
        <span className="workspace-context-controls__label">{title}</span>
      </div>

      <div className="workspace-context-controls__desktop">
        {renderContent(false)}
      </div>

      {mobileBehavior === 'inline' ? (
        <div className="workspace-context-controls__mobile workspace-context-controls__mobile--inline">
          <div className="workspace-context-controls__summary" aria-hidden="true">
            {summary}
          </div>
          {renderContent(true)}
        </div>
      ) : (
        <WorkspaceMobileFiltersSheet
          title={title}
          closeLabel={closeLabel}
          triggerLabel={mobileTriggerLabel ?? title}
          summary={summary}
          className="workspace-context-controls__mobile"
        >
          {renderContent(true)}
        </WorkspaceMobileFiltersSheet>
      )}
    </section>
  );
}
