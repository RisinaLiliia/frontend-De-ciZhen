'use client';

import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type StatisticsErrorStateProps = {
  t: (key: I18nKey) => string;
};

export function StatisticsErrorState({ t }: StatisticsErrorStateProps) {
  return (
    <div className="requests-stats__error workspace-statistics__error">
      <p className="typo-small">{t(I18N_KEYS.requestsPage.statsLoadError)}</p>
    </div>
  );
}
