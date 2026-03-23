'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceOverlaySurface } from '../WorkspaceOverlaySurface';
import { WorkspaceStatisticsPanel } from '../WorkspaceStatisticsPanel';

export function WorkspaceStatisticsExperience({
  intro,
  t,
  locale,
}: {
  intro: React.ReactNode;
  t: (key: I18nKey) => string;
  locale: Locale;
}) {
  const overlayIntro = React.useCallback(() => {
    if (!React.isValidElement(intro)) {
      return intro;
    }

    return React.cloneElement(
      intro as React.ReactElement<{
        showDemandMap?: boolean;
      }>,
      {
        showDemandMap: false,
      },
    );
  }, [intro]);

  return (
    <WorkspaceOverlaySurface intro={overlayIntro()}>
      <div className="workspace-statistics-experience__content">
        <WorkspaceStatisticsPanel t={t} locale={locale} />
      </div>
    </WorkspaceOverlaySurface>
  );
}
