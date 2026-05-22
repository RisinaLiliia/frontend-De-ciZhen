'use client';

import { WorkspaceSectionHeader } from '@/features/workspace/shell/WorkspaceSectionHeader';
import {
  WorkspaceContextControls,
  buildWorkspaceContextControlsProps,
  useWorkspaceContext,
} from '@/features/workspace/context';
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
  const model = useWorkspaceContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });

  return (
    <WorkspaceSectionHeader
      title={model.title}
      description={model.description}
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
  const model = useWorkspaceContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });
  const sharedContextControlsProps = buildWorkspaceContextControlsProps({ model, t, locale });

  return (
    <div className="workspace-mobile-context-section">
      <WorkspaceContextControls
        {...sharedContextControlsProps}
        surface="shell"
        mobileBehavior="inline"
        className="workspace-mobile-context-section__controls"
      />
    </div>
  );
}
