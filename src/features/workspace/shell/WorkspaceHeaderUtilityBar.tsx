'use client';

import Link from 'next/link';

import { IconChat, IconPlus, IconSearch } from '@/components/ui/icons/icons';
import {
  WorkspaceHeaderAccountMenu,
  WorkspaceHeaderNotificationsButton,
} from '@/features/workspace/shell/WorkspaceHeaderAccountMenu';
import { WorkspaceHeaderAuthActions } from '@/features/workspace/shell/WorkspaceHeaderAuthActions';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export function WorkspaceHeaderUtilityBar() {
  const t = useT();
  const authStatus = useAuthStatus();

  return (
    <div className="workspace-environment__utility" aria-label="Workspace tools">
      <label className="workspace-environment__search" aria-label={t(I18N_KEYS.homePublic.searchPlaceholder)}>
        <span className="workspace-environment__search-icon" aria-hidden="true">
          <IconSearch />
        </span>
        <input
          type="search"
          className="workspace-environment__search-input"
          placeholder={t(I18N_KEYS.homePublic.searchPlaceholder)}
        />
      </label>

      {authStatus === 'authenticated' ? (
        <div className="workspace-environment__utility-actions">
          <WorkspaceHeaderNotificationsButton />
          <Link
            href="/workspace?section=chat"
            className="workspace-environment__utility-icon"
            aria-label={t(I18N_KEYS.requestsPage.navChat)}
          >
            <IconChat />
          </Link>
          <WorkspaceHeaderAccountMenu />
          <Link href="/request/create" className="workspace-environment__primary-cta">
            <span aria-hidden="true">
              <IconPlus />
            </span>
            <span>{t(I18N_KEYS.requestsPage.clientHintStableCta)}</span>
          </Link>
        </div>
      ) : (
        <WorkspaceHeaderAuthActions variant="buttons" />
      )}
    </div>
  );
}
