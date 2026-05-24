'use client';

import { WorkspaceHeaderAuthActions } from '@/features/workspace/shell/WorkspaceHeaderAuthActions';

type WorkspaceSectionHeaderProps = {
  title: string;
  description: string;
};

export function WorkspaceSectionHeader({
  title,
  description,
}: WorkspaceSectionHeaderProps) {
  return (
    <section className="workspace-environment">
      <div className="workspace-environment__hero">
        <div className="workspace-environment__copy">
          <div className="workspace-environment__heading">
            <h1 className="workspace-environment__title">{title}</h1>
            <p className="workspace-environment__description">{description}</p>
          </div>
        </div>
        <div className="workspace-environment__hero-aside">
          <WorkspaceHeaderAuthActions className="workspace-environment__auth-actions--hero" />
        </div>
      </div>
    </section>
  );
}
