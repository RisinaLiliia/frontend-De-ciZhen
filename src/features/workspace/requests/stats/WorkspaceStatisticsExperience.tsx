'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceOverlaySurface } from '../WorkspaceOverlaySurface';
import { useDecisionDashboardModel } from './useDecisionDashboardModel';
import { StatisticsContextPanel } from './components/StatisticsContextPanel';
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
  const model = useDecisionDashboardModel({ locale });

  const overlayIntro = React.useCallback(() => {
    const contextPanel = (
      <StatisticsContextPanel
        copy={model.copy}
        filters={model.filters}
        cityOptions={model.cityOptions}
        categoryOptions={model.categoryOptions}
        context={model.context}
        isUpdating={model.isUpdating}
        onRangeChange={model.setRange}
        onCityChange={model.setCityId}
        onCategoryChange={model.setCategoryKey}
        onReset={model.resetFilters}
        onExport={model.onExport}
        isStickyCompact={false}
        isExpanded
        onToggleExpanded={() => undefined}
        showToggle={false}
        surface="embedded"
        showSummary={false}
      />
    );

    if (!React.isValidElement(intro)) {
      return (
        <div className="stack-md">
          {intro}
          {contextPanel}
        </div>
      );
    }

    return React.cloneElement(
      intro as React.ReactElement<{
        leftColumnSlot?: React.ReactNode;
        navHeaderSlot?: React.ReactNode;
        controlShellLabel?: string;
        controlShellSummary?: string;
        showDemandMap?: boolean;
      }>,
      {
        leftColumnSlot: contextPanel,
        controlShellLabel: model.copy.contextTitle,
        controlShellSummary: model.context.stickyLabel,
        showDemandMap: false,
      },
    );
  }, [intro, model]);

  return (
    <WorkspaceOverlaySurface intro={overlayIntro()}>
      <div className="workspace-statistics-experience__content">
        <WorkspaceStatisticsPanel t={t} locale={locale} model={model} />
      </div>
    </WorkspaceOverlaySurface>
  );
}
