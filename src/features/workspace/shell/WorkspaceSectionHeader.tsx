'use client';

import type { ReactNode } from 'react';

import { WorkspaceHeaderAuthActions } from '@/features/workspace/shell/WorkspaceHeaderAuthActions';

export type WorkspaceSectionHeaderCopy = {
  title: string;
  description: string;
};

type WorkspaceSectionHeaderProps = WorkspaceSectionHeaderCopy & {
  actions?: ReactNode;
  className?: string;
};

export function WorkspaceSectionHeader({
  title,
  description,
  actions,
  className,
}: WorkspaceSectionHeaderProps) {
  return (
    <section className={['workspace-environment', className].filter(Boolean).join(' ')}>
      <div className="workspace-environment__hero">
        <div className="workspace-environment__copy">
          <div className="workspace-environment__heading">
            <h1 className="workspace-environment__title">{title}</h1>
            <p className="workspace-environment__description">{description}</p>
          </div>
        </div>
        <div className="workspace-environment__hero-aside">
          {actions ?? (
            <WorkspaceHeaderAuthActions className="workspace-environment__auth-actions--hero" />
          )}
        </div>
      </div>
    </section>
  );
}
