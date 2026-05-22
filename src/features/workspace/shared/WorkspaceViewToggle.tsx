'use client';

import { IconLayoutColumns, IconLayoutRows } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { RequestsListDensity } from '@/lib/requests/pagination';

type Props = {
  t: (key: I18nKey) => string;
  listDensity: RequestsListDensity;
  onChange: (value: RequestsListDensity) => void;
};

export function WorkspaceViewToggle({
  t,
  listDensity,
  onChange,
}: Props) {
  return (
    <div
      className="workspace-view-toggle"
      role="group"
      aria-label={t(I18N_KEYS.requestsPage.viewModeLabel)}
    >
      <button
        type="button"
        className={`workspace-view-toggle__btn workspace-view-toggle__btn--double ${listDensity === 'double' ? 'is-active' : ''}`.trim()}
        aria-label={t(I18N_KEYS.requestsPage.viewModeDouble)}
        aria-pressed={listDensity === 'double'}
        onClick={() => onChange('double')}
      >
        <span className="workspace-view-toggle__icon" aria-hidden="true">
          <IconLayoutColumns />
        </span>
      </button>
      <button
        type="button"
        className={`workspace-view-toggle__btn workspace-view-toggle__btn--single ${listDensity === 'single' ? 'is-active' : ''}`.trim()}
        aria-label={t(I18N_KEYS.requestsPage.viewModeSingle)}
        aria-pressed={listDensity === 'single'}
        onClick={() => onChange('single')}
      >
        <span className="workspace-view-toggle__icon" aria-hidden="true">
          <IconLayoutRows />
        </span>
      </button>
    </div>
  );
}
