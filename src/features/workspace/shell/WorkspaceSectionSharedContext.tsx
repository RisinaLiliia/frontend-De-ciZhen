'use client';

import {
  WorkspaceContextControls,
  buildWorkspaceContextControlsProps,
  useWorkspaceContext,
} from '@/features/workspace/context';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';

export function WorkspaceSectionSharedContext({
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
    <WorkspaceContextControls
      {...sharedContextControlsProps}
      surface="shell"
      className="workspace-context-controls--column"
    />
  );
}
