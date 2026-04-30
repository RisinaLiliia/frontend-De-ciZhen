'use client';

import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { RequestsListDensity } from '@/lib/requests/pagination';

type Props = {
  t: (key: I18nKey) => string;
  listDensity: RequestsListDensity;
  onChange: (value: RequestsListDensity) => void;
};

export function RequestsViewToggle({
  t,
  listDensity,
  onChange,
}: Props) {
  return (
    <div className="requests-view-toggle" role="group" aria-label={t(I18N_KEYS.requestsPage.viewModeLabel)}>
      <button
        type="button"
        className={`requests-view-toggle__btn ${listDensity === 'single' ? 'is-active' : ''}`.trim()}
        aria-label={t(I18N_KEYS.requestsPage.viewModeSingle)}
        aria-pressed={listDensity === 'single'}
        onClick={() => onChange('single')}
      >
        <span className="requests-layout-icon requests-layout-icon--single" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`requests-view-toggle__btn ${listDensity === 'double' ? 'is-active' : ''}`.trim()}
        aria-label={t(I18N_KEYS.requestsPage.viewModeDouble)}
        aria-pressed={listDensity === 'double'}
        onClick={() => onChange('double')}
      >
        <span className="requests-layout-icon requests-layout-icon--double" aria-hidden="true" />
      </button>
    </div>
  );
}
