'use client';

import * as React from 'react';

import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';
import { OpportunityAnalysisCard } from './opportunity/OpportunityAnalysisCard';
import { OpportunityTopCards } from './opportunity/OpportunityTopCards';
import {
  buildOpportunityAnalysisAxes,
  opportunitySummaryLabel,
  selectOpportunityAnalysisItem,
  selectOpportunityTopCards,
} from './opportunity/opportunity.utils';

export function StatisticsOpportunityPanel({
  panelRef,
  copy,
  locale,
  opportunityRadar,
}: {
  panelRef?: React.Ref<HTMLElement>;
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
}) {
  const analysisItem = React.useMemo(
    () => selectOpportunityAnalysisItem(opportunityRadar),
    [opportunityRadar],
  );
  const topCards = React.useMemo(
    () => selectOpportunityTopCards({ opportunityRadar, analysisItem }),
    [analysisItem, opportunityRadar],
  );
  const analysisAxes = React.useMemo(
    () => buildOpportunityAnalysisAxes({ analysisItem, copy }),
    [analysisItem, copy],
  );
  const analysisSummary = React.useMemo(
    () => (analysisItem ? opportunitySummaryLabel(analysisItem.summaryKey, copy) : ''),
    [analysisItem, copy],
  );

  return (
    <section ref={panelRef} className="panel requests-stats-chart workspace-statistics-opportunity">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.opportunityTitle}</p>
        <p className="section-subtitle">{copy.opportunitySubtitle}</p>
      </header>
      {opportunityRadar.length === 0 ? (
        <p className="workspace-statistics__empty">{copy.opportunityEmpty}</p>
      ) : (
        <ol className="workspace-statistics-opportunity__list" aria-label={copy.opportunityTitle}>
          <OpportunityTopCards copy={copy} locale={locale} items={topCards} />
          {analysisItem ? (
            <li className="workspace-statistics-opportunity__item-wrap is-last">
              <OpportunityAnalysisCard
                copy={copy}
                locale={locale}
                item={analysisItem}
                axes={analysisAxes}
                summary={analysisSummary}
              />
            </li>
          ) : null}
        </ol>
      )}
    </section>
  );
}
