'use client';

import { WorkspaceModeNav } from '@/features/workspace/shell/WorkspaceModeNav';
import { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
import {
  buildSharedContextControlsProps,
  useWorkspaceSharedContext,
} from '@/features/workspace/shell/useWorkspaceSharedContext';
import { type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceTab } from '@/features/workspace/requests';

type Translator = (key: I18nKey) => string;

export function WorkspaceModeHeader({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
}) {
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({ model, t, locale });

  return (
    <section className="workspace-environment">
      <div className="workspace-environment__hero">
        <div className="workspace-environment__copy">
          <span className="workspace-environment__eyebrow">{model.copy.eyebrow}</span>
          <div className="workspace-environment__heading">
            <h1 className="workspace-environment__title">{model.title}</h1>
            <p className="workspace-environment__description">{model.description}</p>
          </div>
        </div>
        <div className="workspace-environment__shell-hint">{model.copy.shellHint}</div>
      </div>

      {model.activeMode === 'overview' ? <WorkspaceModeNav items={model.modeItems} t={t} /> : null}

      <WorkspaceSharedContextControls
        {...sharedContextControlsProps}
        surface="shell"
        className="workspace-shared-context-controls--header"
      />
    </section>
  );
}

export function WorkspaceMobileContextSection({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
}: {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
}) {
  const t = useT();
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({ model, t, locale });

  return (
    <div className="workspace-mobile-context-section">
      <WorkspaceSharedContextControls
        {...sharedContextControlsProps}
        surface="shell"
        mobileBehavior="inline"
        className="workspace-mobile-context-section__controls"
      />
    </div>
  );
}
