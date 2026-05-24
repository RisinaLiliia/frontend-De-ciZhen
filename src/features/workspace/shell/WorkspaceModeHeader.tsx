'use client';

import { WorkspaceSectionHeader } from '@/features/workspace/shell/WorkspaceSectionHeader';
import { useWorkspaceSectionHeaderCopy } from '@/features/workspace/shell/useWorkspaceSectionHeaderCopy';
import { type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
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
  const header = useWorkspaceSectionHeaderCopy({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });

  return (
    <WorkspaceSectionHeader
      title={header.title}
      description={header.description}
    />
  );
}
