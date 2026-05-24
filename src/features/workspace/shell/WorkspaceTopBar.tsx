'use client';

import { Menu } from 'lucide-react';

import { WorkspaceHeaderUtilityBar } from '@/features/workspace/shell/WorkspaceHeaderUtilityBar';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { WORKSPACE_MOBILE_NAV_OPEN_EVENT } from '@/lib/workspaceMobileNavigation';

type WorkspaceTopBarProps = {
  compactUtility?: boolean;
  showNavigationToggle?: boolean;
};

export function WorkspaceTopBar({
  compactUtility = false,
  showNavigationToggle = true,
}: WorkspaceTopBarProps) {
  const t = useT();

  return (
    <header className="workspace-topbar" aria-label={t(I18N_KEYS.auth.workspaceLabel)}>
      {showNavigationToggle ? (
        <button
          type="button"
          className="workspace-topbar__menu"
          aria-label={t(I18N_KEYS.auth.navigationLabel)}
          onClick={() => window.dispatchEvent(new Event(WORKSPACE_MOBILE_NAV_OPEN_EVENT))}
        >
          <Menu size={18} strokeWidth={1.9} />
        </button>
      ) : <span className="workspace-topbar__spacer" aria-hidden="true" />}

      <WorkspaceHeaderUtilityBar compact={compactUtility} className="workspace-topbar__utility" />
    </header>
  );
}
