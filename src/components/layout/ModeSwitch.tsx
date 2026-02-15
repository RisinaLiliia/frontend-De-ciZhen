// src/components/layout/ModeSwitch.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuthLastMode, useAuthSetLastMode, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function ModeSwitch() {
  const t = useT();
  const status = useAuthStatus();
  const user = useAuthUser();
  const lastMode = useAuthLastMode();
  const setLastMode = useAuthSetLastMode();
  const isHelpActive = (lastMode ?? 'provider') === 'client';
  const isCreateActive = !isHelpActive;

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
          setLastMode('client');
        }}
      >
        {t(I18N_KEYS.app.modeClient)}
      </button>
      <Link
        href="/request/create"
        className={`mode-switch__btn mode-switch__btn--cta ${isCreateActive ? 'is-active' : ''}`.trim()}
        onClick={() => {
          setLastMode('provider');
        }}
      >
        {t(I18N_KEYS.requestsPage.heroPrimaryCta)}
      </Link>
    </div>
  );
}
