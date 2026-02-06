import * as React from 'react';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

const STEPS = {
  client: [
    {
      titleKey: I18N_KEYS.homePublic.howItWorksClientStep1Title,
      descKey: I18N_KEYS.homePublic.howItWorksClientStep1Desc,
    },
    {
      titleKey: I18N_KEYS.homePublic.howItWorksClientStep2Title,
      descKey: I18N_KEYS.homePublic.howItWorksClientStep2Desc,
    },
    {
      titleKey: I18N_KEYS.homePublic.howItWorksClientStep3Title,
      descKey: I18N_KEYS.homePublic.howItWorksClientStep3Desc,
    },
  ],
  provider: [
    {
      titleKey: I18N_KEYS.homePublic.howItWorksProviderStep1Title,
      descKey: I18N_KEYS.homePublic.howItWorksProviderStep1Desc,
    },
    {
      titleKey: I18N_KEYS.homePublic.howItWorksProviderStep2Title,
      descKey: I18N_KEYS.homePublic.howItWorksProviderStep2Desc,
    },
    {
      titleKey: I18N_KEYS.homePublic.howItWorksProviderStep3Title,
      descKey: I18N_KEYS.homePublic.howItWorksProviderStep3Desc,
    },
  ],
} as const;

type RoleKey = keyof typeof STEPS;

type HomeHowItWorksPanelProps = {
  t: (key: I18nKey) => string;
};

export function HomeHowItWorksPanel({ t }: HomeHowItWorksPanelProps) {
  const [role, setRole] = React.useState<RoleKey>('client');
  const tabs: Array<{ key: RoleKey; label: I18nKey }> = [
    { key: 'client', label: I18N_KEYS.homePublic.howItWorksClientTab },
    { key: 'provider', label: I18N_KEYS.homePublic.howItWorksProviderTab },
  ];

  return (
    <section className="panel howitworks-panel">
      <div className="panel-header">
        <p className="section-title">{t(I18N_KEYS.homePublic.howItWorksTitle)}</p>
      </div>
      <div className="howitworks-tabs" role="tablist" aria-label={t(I18N_KEYS.homePublic.howItWorksTitle)}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={role === tab.key}
            className={`howitworks-tab ${role === tab.key ? 'is-active' : ''}`}
            onClick={() => setRole(tab.key)}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
      <div className="howitworks-steps" key={role}>
        {STEPS[role].map((step, index) => (
          <div key={step.titleKey} className="howitworks-step">
            <div className="howitworks-step__index">{index + 1}</div>
            <div>
              <p className="howitworks-step__title">{t(step.titleKey)}</p>
              <p className="howitworks-step__desc">{t(step.descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
