'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceOverlayShell } from '../WorkspaceOverlayShell';
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
  const [isOverlayCollapsed, setIsOverlayCollapsed] = React.useState(false);

  const overlayIntro = React.useCallback((headerToggle: React.ReactNode) => {
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
      intro as React.ReactElement<{ leftColumnSlot?: React.ReactNode; navHeaderSlot?: React.ReactNode }>,
      {
        leftColumnSlot: contextPanel,
        navHeaderSlot: headerToggle,
      },
    );
  }, [intro, model]);

  return (
    <>
      <WorkspaceOverlayShell summary={model.context.stickyLabel} onCollapsedChange={setIsOverlayCollapsed}>
        {({ headerToggle }) => overlayIntro(headerToggle)}
      </WorkspaceOverlayShell>

      <div className={isOverlayCollapsed ? 'workspace-statistics-experience__content is-overlay-collapsed' : 'workspace-statistics-experience__content'}>
        <WorkspaceStatisticsPanel t={t} locale={locale} model={model} />
      </div>
    </>
  );
}
