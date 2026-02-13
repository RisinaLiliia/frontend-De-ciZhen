// src/components/layout/ModeSwitch.tsx
'use client';

import * as React from 'react';
import { useAuthLastMode, useAuthSetLastMode, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function ModeSwitch() {
  const t = useT();
  const status = useAuthStatus();
  const user = useAuthUser();
  const lastMode = useAuthLastMode();
  const setLastMode = useAuthSetLastMode();

  if (status !== 'authenticated' || !user) return null;
  if (user.role !== 'provider') return null;

  const activeMode = lastMode ?? 'provider';

  return (
    <div className="mode-switch" role="group" aria-label={t(I18N_KEYS.app.modeLabel)}>
      <button
        type="button"
        className={`mode-switch__btn ${activeMode === 'client' ? 'is-active' : ''}`}
        onClick={() => setLastMode('client')}
      >
        {t(I18N_KEYS.app.modeClient)}
      </button>
      <button
        type="button"
        className={`mode-switch__btn ${activeMode === 'provider' ? 'is-active' : ''}`}
        onClick={() => setLastMode('provider')}
      >
        {t(I18N_KEYS.app.modeProvider)}
      </button>
    </div>
  );
}
