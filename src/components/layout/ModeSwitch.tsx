// src/components/layout/ModeSwitch.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthSetLastMode, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function ModeSwitch() {
  const t = useT();
  const status = useAuthStatus();
  const user = useAuthUser();
  const setLastMode = useAuthSetLastMode();
  const pathname = usePathname();
  const isRequestRoute =
    pathname?.startsWith('/request/') || pathname?.startsWith('/requests');
  const [activeTab, setActiveTab] = React.useState<'help' | 'create'>(
    isRequestRoute ? 'create' : 'help',
  );

  React.useEffect(() => {
    setActiveTab(isRequestRoute ? 'create' : 'help');
  }, [isRequestRoute]);

  const isHelpActive = activeTab === 'help';
  const isCreateActive = activeTab === 'create';

  if (status !== 'authenticated' || !user) return null;
  if (user.role !== 'provider') return null;

  return (
    <div
      className={`mode-switch ${isHelpActive ? 'mode-switch--help-active' : ''}`.trim()}
      role="group"
      aria-label={t(I18N_KEYS.app.modeLabel)}
    >
      <button
        type="button"
        className={`mode-switch__btn ${isHelpActive ? 'is-active' : ''}`.trim()}
        onClick={() => {
          setActiveTab('help');
          setLastMode('client');
        }}
      >
        {t(I18N_KEYS.app.modeClient)}
      </button>
      <Link
        href="/request/create"
        className={`mode-switch__btn mode-switch__btn--cta ${isCreateActive ? 'is-active' : ''}`.trim()}
        onClick={() => {
          setActiveTab('create');
          setLastMode('client');
        }}
      >
        {t(I18N_KEYS.requestsPage.heroPrimaryCta)}
      </Link>
    </div>
  );
}
