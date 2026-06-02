'use client';

import { WorkspaceHeaderUtilityBar } from '@/features/workspace/shell/WorkspaceHeaderUtilityBar';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

type WorkspaceTopBarProps = {
  compactUtility?: boolean;
};

export function WorkspaceTopBar({
  compactUtility = false,
}: WorkspaceTopBarProps) {
  const t = useT();

  return (
    <header className="workspace-topbar" aria-label={t(I18N_KEYS.auth.workspaceLabel)}>
      <WorkspaceHeaderUtilityBar compact={compactUtility} className="workspace-topbar__utility" />
    </header>
  );
}
