'use client';

import * as React from 'react';

import { WorkspaceButton } from '@/features/workspace/shared';

type WorkspaceContextMobileSheetProps = {
  title?: string;
  triggerLabel: string;
  applyLabel?: string;
  summary?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function WorkspaceContextMobileSheet({
  title,
  triggerLabel,
  applyLabel,
  summary,
  className,
  children,
}: WorkspaceContextMobileSheetProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={['workspace-mobile-filters', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="workspace-mobile-filters__trigger"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="workspace-mobile-filters__cta">{triggerLabel}</span>
        {summary ? (
          <span className="workspace-mobile-filters__summary" aria-hidden="true">
            {summary}
          </span>
        ) : null}
      </button>

      {open ? (
        <section className="workspace-mobile-filters__sheet" aria-label={title ?? triggerLabel}>
          <div className="workspace-mobile-filters__sheet-body">{children}</div>
          {applyLabel ? (
            <WorkspaceButton
              type="button"
              variant="secondary"
              size="sm"
              fullWidth
              className="workspace-mobile-filters__apply"
              onClick={() => setOpen(false)}
            >
              {applyLabel}
            </WorkspaceButton>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
