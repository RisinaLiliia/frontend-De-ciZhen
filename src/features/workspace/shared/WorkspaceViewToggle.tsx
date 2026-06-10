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

export function WorkspaceViewToggle({ t, listDensity, onChange }: Props) {
  const nextDensity = listDensity === 'double' ? 'single' : 'double';
  const nextLabel = t(
    nextDensity === 'double'
      ? I18N_KEYS.requestsPage.viewModeDouble
      : I18N_KEYS.requestsPage.viewModeSingle,
  );

  return (
    <div className="workspace-view-toggle" aria-label={t(I18N_KEYS.requestsPage.viewModeLabel)}>
      <button
        type="button"
        className="workspace-view-toggle__btn workspace-view-toggle__btn--toggle"
        aria-label={nextLabel}
        title={nextLabel}
        data-current-density={listDensity}
        onClick={() => onChange(nextDensity)}
      >
        <span className="workspace-view-toggle__icon" aria-hidden="true">
          {listDensity === 'double' ? <IconLayoutColumns /> : <IconLayoutRows />}
        </span>
      </button>
    </div>
  );
}
