'use client';

import { BrandLink } from '@/components/brand';
import { WorkspaceHeaderUtilityBar } from '@/features/workspace/shell/WorkspaceHeaderUtilityBar';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

type WorkspaceTopBarProps = {
  compactUtility?: boolean;
  showBrand?: boolean;
};

export function WorkspaceTopBar({
  compactUtility = false,
  showBrand = false,
}: WorkspaceTopBarProps) {
  const t = useT();

  return (
    <header
      className={['workspace-topbar', showBrand ? 'workspace-topbar--with-brand' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label={t(I18N_KEYS.auth.workspaceLabel)}
    >
      {showBrand ? <BrandLink className="workspace-topbar__brand" /> : null}

      <WorkspaceHeaderUtilityBar compact={compactUtility} className="workspace-topbar__utility" />
    </header>
  );
}
