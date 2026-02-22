/* src/components/home/HomeHowItWorksPanel.tsx */
import * as React from 'react';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

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
  const tabsId = React.useId();
  const tabs = React.useMemo<Array<{ key: RoleKey; label: I18nKey }>>(
    () => [
      { key: 'client', label: I18N_KEYS.homePublic.howItWorksClientTab },
      { key: 'provider', label: I18N_KEYS.homePublic.howItWorksProviderTab },
    ],
    [],
  );
  const activeIndex = tabs.findIndex((tab) => tab.key === role);

  const focusTabAt = React.useCallback(
    (index: number) => {
      const next = tabs[index];
      if (!next) return;
      setRole(next.key);
      const nextTabId = `${tabsId}-tab-${next.key}`;
      requestAnimationFrame(() => {
        const element = document.getElementById(nextTabId);
        if (element instanceof HTMLButtonElement) {
          element.focus();
        }
      });
    },
    [tabs, tabsId],
  );

  const onTabKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        focusTabAt((index + 1) % tabs.length);
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusTabAt((index - 1 + tabs.length) % tabs.length);
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        focusTabAt(0);
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        focusTabAt(tabs.length - 1);
      }
    },
    [focusTabAt, tabs.length],
  );

  return (
    <Card className="home-howitworks-panel howitworks-panel">
      <CardHeader className="home-panel-header">
        <CardTitle className="home-panel-title">{t(I18N_KEYS.homePublic.howItWorksTitle)}</CardTitle>
      </CardHeader>
      <div
        className="howitworks-tabs"
        role="tablist"
        aria-label={t(I18N_KEYS.homePublic.howItWorksTitle)}
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            id={`${tabsId}-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={role === tab.key}
            aria-controls={`${tabsId}-panel-${tab.key}`}
            tabIndex={activeIndex === index ? 0 : -1}
            className={`howitworks-tab ${role === tab.key ? 'is-active' : ''}`}
            onClick={() => setRole(tab.key)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          id={`${tabsId}-panel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-tab-${tab.key}`}
          className="howitworks-steps"
          hidden={role !== tab.key}
          tabIndex={0}
        >
          {STEPS[tab.key].map((step, index) => (
            <div key={step.titleKey} className="howitworks-step">
              <div className="howitworks-step__index">{index + 1}</div>
              <div>
                <p className="howitworks-step__title">{t(step.titleKey)}</p>
                <p className="howitworks-step__desc">{t(step.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
}
