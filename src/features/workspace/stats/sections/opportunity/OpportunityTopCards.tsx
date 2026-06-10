'use client';

import { LocationMeta } from '@/components/ui/LocationMeta';
import { IconTrophyBronze, IconTrophyGold, IconTrophySilver } from '@/components/ui/icons/icons';
import { workspaceCardShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../../statistics.model';
import { StatisticsSignalMeter } from '../../components/StatisticsSignalMeter';
import type { OpportunityItem } from './opportunity.utils';
import { opportunityCardAriaLabel } from './opportunity.utils';

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
              className={workspaceCardShell(
                'workspace-statistics-opportunity__item',
                'workspace-statistics-opportunity__item--compact',
                `is-${item.tone}`,
              )}
              aria-label={opportunityCardAriaLabel({ item, copy, locale })}
              onClick={() => onSelect(item.rank)}
            >
              <div className="workspace-statistics-opportunity__top">
                <span
                  className={`workspace-statistics-city-list__rank-cup workspace-statistics-opportunity__rank-cup is-${rankTone}`.trim()}
                  aria-hidden="true"
                >
                  {item.rank === 1 ? <IconTrophyGold size={30} /> : null}
                  {item.rank === 2 ? <IconTrophySilver size={30} /> : null}
                  {item.rank === 3 ? <IconTrophyBronze size={30} /> : null}
                </span>
                <div className="workspace-statistics-opportunity__identity">
                  <span className="request-category workspace-statistics-opportunity__category">
                    {item.category}
                  </span>
                  <LocationMeta
                    label={item.city}
                    className="workspace-statistics-opportunity__city"
                  />
                </div>
              </div>
              <StatisticsSignalMeter
                className="workspace-statistics-opportunity__score"
                label={copy.opportunityScoreLabel}
                value={`${item.score.toFixed(1)} / 10`}
                progressPercent={item.score * 10}
              />
            </button>
          </li>
        );
      })}
    </>
  );
}
