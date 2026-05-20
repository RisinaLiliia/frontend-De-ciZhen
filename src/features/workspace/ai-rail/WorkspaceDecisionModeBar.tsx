'use client';

import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/t';

export type WorkspaceDecisionModeBarProps = {
  locale: Locale;
  completedInSession: number;
  remainingCount: number;
  onExit: () => void;
};

export function WorkspaceDecisionModeBar({
  locale,
  completedInSession,
  remainingCount,
  onExit,
}: WorkspaceDecisionModeBarProps) {
  const totalCount = completedInSession + remainingCount;
  const hasCompletedAll = totalCount > 0 && remainingCount === 0;
  const t = (key: string) => translate(key as never, locale);

  return (
    <section className="panel my-decision-mode">
      <div className="my-decision-mode__copy">
        <span className="my-decision-mode__eyebrow">
          {t(I18N_KEYS.requestsPage.decisionModeLabel)}
        </span>
        <strong className="my-decision-mode__title">
          {hasCompletedAll
            ? t(I18N_KEYS.requestsPage.workspaceDecisionDoneTitle)
            : t(I18N_KEYS.requestsPage.decisionModeHandleOpen)}
        </strong>
        <span className="my-decision-mode__progress">
          {totalCount > 0
            ? t(I18N_KEYS.requestsPage.decisionModeProgressTemplate)
              .replace('{completed}', String(completedInSession))
              .replace('{total}', String(totalCount))
            : t(I18N_KEYS.requestsPage.decisionModeNoOpen)}
        </span>
      </div>
      <button type="button" className="btn-secondary my-decision-mode__exit" onClick={onExit}>
        {t(I18N_KEYS.requestsPage.workspaceDecisionDoneCta)}
      </button>
    </section>
  );
}
