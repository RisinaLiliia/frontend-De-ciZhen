'use client';

import * as React from 'react';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import type { WorkspaceDecisionPlan } from '../statisticsDecisionEngine.utils';
import { StatisticsDecisionLayer } from '../StatisticsSections';
import { StatisticsContextPanel } from '../components/StatisticsContextPanel';
import { workspaceRequestsPanelShell } from '@/features/workspace/shared';

type StatisticsIntroSectionProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
  statisticsPanelRef: React.RefObject<HTMLElement | null>;
  introPanelMinHeight?: number | null;
  decisionPlan: WorkspaceDecisionPlan;
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
  applySelectedOpportunityFocus: () => void;
  subtitle: string;
};

export function StatisticsIntroSection({
  t,
  locale,
  model,
  statisticsPanelRef,
  introPanelMinHeight,
  decisionPlan,
  selectedOpportunity,
  applySelectedOpportunityFocus,
  subtitle,
}: StatisticsIntroSectionProps) {
  const {
    copy,
    filters,
    context,
    activityTrend,
    modeLabel,
    hasBackgroundError,
    isLoading,
    isError,
    priceIntelligence,
    activitySignals,
  } = model;

  return (
    <section
      ref={statisticsPanelRef}
      className={workspaceRequestsPanelShell('workspace-statistics__intro')}
      style={introPanelMinHeight ? { minHeight: `${introPanelMinHeight}px` } : undefined}
    >
      <StatisticsContextPanel
        copy={copy}
        locale={locale}
        filters={filters}
        cityOptions={model.cityOptions}
        categoryOptions={model.categoryOptions}
        context={context}
        activityTrend={activityTrend}
        onRangeChange={model.setRange}
        onCityChange={model.setCityId}
        onCategoryChange={model.setCategoryKey}
        onReset={model.resetFilters}
        onExport={model.onExport}
        surface="embedded"
        showControls={false}
      />

      <div className="workspace-statistics__decision-cluster">
        <div className="panel-header workspace-statistics__mode-row">
          <div className="workspace-statistics__mode-meta">
            <span className="workspace-statistics__mode-badge">{modeLabel}</span>
            <span className="section-subtitle">{copy.kpiTitle} · {context.scopeLabel}</span>
          </div>
        </div>

        {hasBackgroundError && !isLoading && !isError ? (
          <div className="workspace-statistics__background-error" role="status" aria-live="polite">
            <strong>{copy.backgroundErrorTitle}</strong>
            <p>{copy.backgroundErrorBody}</p>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <StatisticsDecisionLayer
            copy={copy}
            decisionInsight={model.decisionInsight}
            decisionPlan={decisionPlan}
            selectedOpportunity={selectedOpportunity}
            priceIntelligence={priceIntelligence}
            onActionClick={applySelectedOpportunityFocus}
            activitySignals={activitySignals}
            subtitle={subtitle}
          />
        ) : null}
      </div>
    </section>
  );
}
