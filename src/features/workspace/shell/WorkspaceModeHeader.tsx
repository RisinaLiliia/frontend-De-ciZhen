'use client';

import { WorkspaceSectionHeader } from '@/features/workspace/shell/WorkspaceSectionHeader';
import { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
import {
  buildSharedContextControlsProps,
  useWorkspaceSharedContext,
} from '@/features/workspace/shell/useWorkspaceSharedContext';
import { type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';

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
    <WorkspaceSectionHeader
      eyebrow={model.copy.eyebrow}
      title={model.title}
      description={model.description}
      shellHint={model.copy.shellHint}
      sharedContextControlsProps={sharedContextControlsProps}
    />
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
