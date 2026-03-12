'use client';

import Link from 'next/link';

import {
  IconTrophyBronze,
  IconTrophyGold,
  IconTrophySilver,
} from '@/components/ui/icons/icons';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../../useWorkspaceStatisticsModel';
import type { OpportunityItem } from './opportunity.utils';
import { opportunityCardAriaLabel, opportunityToneLabel } from './opportunity.utils';

export function OpportunityTopCards({
  copy,
  locale,
  items,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
  items: OpportunityItem[];
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
            <Link
              href={item.href}
              prefetch={false}
              className={`stat-card stat-link workspace-statistics-opportunity__item workspace-statistics-opportunity__item--compact is-${item.tone}`.trim()}
              aria-label={opportunityCardAriaLabel({ item, copy, locale })}
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

              <div className="workspace-statistics-opportunity__score-head">
                <span>{copy.opportunityScoreLabel}</span>
                <strong>{item.score.toFixed(1)} / 10</strong>
              </div>
              <div className="workspace-statistics-demand__track workspace-statistics-opportunity__score-track" aria-hidden="true">
                <span
                  className="workspace-statistics-demand__fill workspace-statistics-opportunity__score-fill"
                  style={{ width: `${Math.max(0, Math.min(100, item.score * 10))}%` }}
                />
              </div>

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

              <p className={`workspace-statistics-opportunity__tone is-${item.tone}`.trim()}>
                {opportunityToneLabel(item.tone, copy)}
              </p>
            </Link>
          </li>
        );
      })}
    </>
  );
}
