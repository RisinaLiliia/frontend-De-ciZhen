'use client';

import type { Ref } from 'react';

import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
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
  title,
  opportunityRadar,
  selectedRank,
  onSelectRank,
}: {
  panelRef?: Ref<HTMLElement>;
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
  title?: string;
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
  selectedRank: WorkspaceStatisticsModel['opportunityRadar'][number]['rank'] | null;
  onSelectRank: (rank: WorkspaceStatisticsModel['opportunityRadar'][number]['rank']) => void;
}) {
  const analysisItem = selectOpportunityAnalysisItem(opportunityRadar, selectedRank);
  const topCards = selectOpportunityTopCards({ opportunityRadar, analysisItem });
  const analysisAxes = buildOpportunityAnalysisAxes({ analysisItem, copy });
  const analysisSummary = analysisItem ? opportunitySummaryLabel(analysisItem.summaryKey, copy) : '';

  return (
    <section ref={panelRef} className="panel requests-stats-chart workspace-statistics-opportunity">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{title ?? copy.opportunityTitle}</p>
        <p className="section-subtitle">{copy.opportunitySubtitle}</p>
      </header>
      {opportunityRadar.length === 0 ? (
        <p className="workspace-statistics__empty">{copy.opportunityEmpty}</p>
      ) : (
        <ol className="workspace-statistics-opportunity__list" aria-label={copy.opportunityTitle}>
          <OpportunityTopCards
            copy={copy}
            locale={locale}
            items={topCards}
            onSelect={onSelectRank}
          />
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
