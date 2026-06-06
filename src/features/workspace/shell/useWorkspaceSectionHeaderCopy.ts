'use client';

import {
  useWorkspaceContext,
} from '@/features/workspace/context';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceSectionHeaderCopy } from '@/features/workspace/shell/WorkspaceSectionHeader';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Translator = (key: I18nKey) => string;

export function useWorkspaceSectionHeaderCopy({
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
}): WorkspaceSectionHeaderCopy {
  const model = useWorkspaceContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
    preferredRequestsRole,
  });

  return {
    title: model.title,
    description: model.description,
  };
}
