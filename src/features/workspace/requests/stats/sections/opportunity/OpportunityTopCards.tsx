'use client';

import {
  IconTrophyBronze,
  IconTrophyGold,
  IconTrophySilver,
} from '@/components/ui/icons/icons';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../../useWorkspaceStatisticsModel';
import { StatisticsSignalMeter } from '../../components/StatisticsSignalMeter';
import type { OpportunityItem } from './opportunity.utils';
import { opportunityCardAriaLabel, opportunityStatusClassName, opportunityStatusLabel } from './opportunity.utils';

export function OpportunityTopCards({
  copy,
  locale,
  items,
  onSelect,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
  items: OpportunityItem[];
  onSelect: (rank: OpportunityItem['rank']) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const rankTone = item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : 'bronze';
        return (
          <li
            key={`${item.rank}-${item.city}`}
            className="workspace-statistics-opportunity__item-wrap"
          >
            <button
              type="button"
              className={`stat-card workspace-statistics-opportunity__item workspace-statistics-opportunity__item--compact is-${item.tone}`.trim()}
              aria-label={opportunityCardAriaLabel({ item, copy, locale })}
              onClick={() => onSelect(item.rank)}
            >
              <div className="workspace-statistics-opportunity__top">
                <span className={`workspace-statistics-city-list__rank-cup is-${rankTone}`.trim()} aria-hidden="true">
                  {item.rank === 1 ? <IconTrophyGold size={30} /> : null}
                  {item.rank === 2 ? <IconTrophySilver size={30} /> : null}
                  {item.rank === 3 ? <IconTrophyBronze size={30} /> : null}
                </span>
                <div className="workspace-statistics-opportunity__identity">
                  <strong className="workspace-statistics-opportunity__city">{item.city}</strong>
                  <span className="workspace-statistics-opportunity__category">{item.category}</span>
                </div>
              </div>
              <StatisticsSignalMeter
                className="workspace-statistics-opportunity__score"
                label={copy.opportunityScoreLabel}
                value={`${item.score.toFixed(1)} / 10`}
                progressPercent={item.score * 10}
                semanticLabel={opportunityStatusLabel(item.status, locale)}
                semanticTone={opportunityStatusClassName(item.status)}
              />

              <dl className="workspace-statistics-opportunity__metrics">
                <div>
                  <dt>{copy.opportunityDemandLabel}</dt>
                  <dd>{item.demand.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>{copy.opportunityProvidersLabel}</dt>
                  <dd>{item.providers === null ? '—' : item.providers.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>{copy.opportunityBalanceLabel}</dt>
                  <dd>{item.marketBalanceRatio === null ? '—' : item.marketBalanceRatio.toFixed(2)}</dd>
                </div>
              </dl>
            </button>
          </li>
        );
      })}
    </>
  );
}
