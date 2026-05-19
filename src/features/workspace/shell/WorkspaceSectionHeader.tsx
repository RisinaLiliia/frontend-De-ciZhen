'use client';

import { WorkspaceHeaderAuthActions } from '@/features/workspace/shell/WorkspaceHeaderAuthActions';
import { WorkspaceHeaderUtilityBar } from '@/features/workspace/shell/WorkspaceHeaderUtilityBar';
import { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';

type WorkspaceSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  shellHint: string;
  sharedContextControlsProps: React.ComponentProps<typeof WorkspaceSharedContextControls>;
};

export function WorkspaceSectionHeader({
  eyebrow,
  title,
  description,
  shellHint,
  sharedContextControlsProps,
}: WorkspaceSectionHeaderProps) {
  return (
    <section className="workspace-environment">
      <WorkspaceHeaderUtilityBar />

      <div className="workspace-environment__hero">
        <div className="workspace-environment__copy">
          <span className="workspace-environment__eyebrow">{eyebrow}</span>
          <div className="workspace-environment__heading">
            <h1 className="workspace-environment__title">{title}</h1>
            <p className="workspace-environment__description">{description}</p>
          </div>
        </div>
        <div className="workspace-environment__hero-aside">
          <div className="workspace-environment__shell-hint">{shellHint}</div>
          <WorkspaceHeaderAuthActions className="workspace-environment__auth-actions--hero" />
        </div>
      </div>

      <WorkspaceSharedContextControls
        {...sharedContextControlsProps}
        surface="shell"
        className="workspace-shared-context-controls--header"
      />
    </section>
  );
}
