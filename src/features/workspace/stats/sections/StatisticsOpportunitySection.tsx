'use client';

import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import {
  StatisticsOpportunityPanel,
  StatisticsPricePanel,
} from '../StatisticsSections';

type StatisticsOpportunitySectionProps = {
  panelRef: React.RefObject<HTMLElement | null>;
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
  title: string;
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
  selectedRank: WorkspaceStatisticsModel['opportunityRadar'][number]['rank'] | null;
  onSelectRank: (rank: WorkspaceStatisticsModel['opportunityRadar'][number]['rank'] | null) => void;
  priceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
  pricing: WorkspaceStatisticsModel['userIntelligence'] | null;
  personalizedPricing: WorkspaceStatisticsModel['personalizedPricing'];
};

export function StatisticsOpportunitySection({
  panelRef,
  copy,
  locale,
  title,
  opportunityRadar,
  selectedRank,
  onSelectRank,
  priceIntelligence,
  pricing,
  personalizedPricing,
}: StatisticsOpportunitySectionProps) {
  return (
    <div className="workspace-statistics__grid workspace-statistics__grid--secondary">
      <StatisticsOpportunityPanel
        panelRef={panelRef}
        copy={copy}
        locale={locale}
        title={title}
        opportunityRadar={opportunityRadar}
        selectedRank={selectedRank}
        onSelectRank={onSelectRank}
      />
      <StatisticsPricePanel
        className="workspace-statistics-price--secondary"
        copy={copy}
        title={copy.priceTitle}
        priceIntelligence={priceIntelligence}
        pricing={pricing?.pricing ?? null}
        personalizedPricing={personalizedPricing}
      />
    </div>
  );
}
