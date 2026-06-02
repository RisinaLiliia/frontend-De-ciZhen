'use client';

import { useMediaMatch } from '@/features/workspace/shared';
import { WorkspaceContextFilters } from './contextFilters';
import { WorkspaceContextInlineControls } from './contextInlineControls';
import { WorkspaceContextResultControls } from './contextResultControls';
import type { WorkspaceContextPanelProps } from './context.types';

export function WorkspaceContextPanel({
  title,
  locale,
  resetLabel,
  applyLabel,
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
  mobileBehavior = 'inline',
}: WorkspaceContextPanelProps) {
  const isMobile = useMediaMatch('(max-width: 767px)');
  const isCompact = useMediaMatch('(max-width: 1179px)');
  const rootClassName = [
    'workspace-context-controls',
    surface === 'shell'
      ? 'workspace-context-controls--shell'
      : 'workspace-context-controls--embedded',
    mobileBehavior === 'inline' && isCompact ? 'workspace-context-controls--mobile-inline' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={rootClassName} aria-label={title}>
      <div className="workspace-context-controls__header">
        <span className="workspace-context-controls__label">{title}</span>
      </div>

      <WorkspaceContextInlineControls
        inlineControl={inlineControl}
        extraFilters={extraFilters}
      />

      <div className="workspace-context-controls__surface">
        <div className="workspace-context-controls__body">
          <WorkspaceContextFilters
            locale={locale}
            city={city}
            category={category}
            service={service}
            range={range}
            mobile={isMobile}
            compact={isCompact}
            title={title}
            applyLabel={applyLabel}
            mobileTriggerLabel={mobileTriggerLabel}
          />

          <WorkspaceContextResultControls
            mobile={isCompact}
            sort={sort}
            range={range}
            actionRowControl={!isMobile ? actionRowControl : undefined}
            resetLabel={resetLabel}
            onReset={onReset}
            action={action}
          />
        </div>
      </div>
    </section>
  );
}
