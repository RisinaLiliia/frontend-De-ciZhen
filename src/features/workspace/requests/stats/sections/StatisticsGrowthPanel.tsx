'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';

export function StatisticsGrowthPanel({
  copy,
  growthCards,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  growthCards: WorkspaceStatisticsModel['growthCards'];
}) {
  if (growthCards.length === 0) return null;

  const featuredCard = growthCards.find((item) => item.tone === 'primary') ?? growthCards[0] ?? null;
  const secondaryCards = growthCards
    .filter((item) => item.key !== featuredCard?.key)
    .slice(0, 2);

  return (
    <section className="panel stack-sm workspace-statistics__growth">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.growthTitle}</p>
        <p className="section-subtitle">{copy.growthSubtitle}</p>
      </header>
      {featuredCard ? (
        <div className="workspace-statistics-growth__featured-wrap">
          <Link
            href={featuredCard.href}
            prefetch={false}
            className="request-create-card request-create-card--compact workspace-statistics-growth__featured"
          >
            <div className="request-create-card__body workspace-statistics-growth__featured-content">
              <div className="workspace-statistics-growth__labels">
                <Badge variant="info" size="sm">{copy.growthFeaturedBadge}</Badge>
              </div>
              <p className="request-create-card__title">{featuredCard.title}</p>
              <p className="request-create-card__subtitle">{featuredCard.body}</p>
              <p className="workspace-statistics-growth__benefit">{featuredCard.benefit}</p>
              {featuredCard.recommendedFor ? (
                <p className="workspace-statistics-growth__recommended">
                  {copy.growthRecommendedPrefix} {featuredCard.recommendedFor}
                </p>
              ) : null}
            </div>
            <div className="request-create-card__media" aria-hidden="true">
              <span className="request-create-card__plus">+</span>
            </div>
          </Link>
        </div>
      ) : null}
      {secondaryCards.length > 0 ? (
        <div className="workspace-statistics-growth__grid">
          {secondaryCards.map((card, index) => (
            <article
              key={`${card.key}-${index}`}
              className="stat-card workspace-statistics-growth__card"
            >
              <div className="workspace-statistics-growth__head">
                <div className="workspace-statistics-growth__head-copy">
                  <p className="workspace-statistics-growth__title">{card.title}</p>
                  <div className="workspace-statistics-growth__labels">
                    {card.badge ? (
                      <Badge variant="info" size="sm">{card.badge}</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <p className="workspace-statistics-growth__body">{card.body}</p>
              <p className="workspace-statistics-growth__benefit">{card.benefit}</p>
              {card.recommendedFor ? (
                <p className="workspace-statistics-growth__recommended">
                  {copy.growthRecommendedPrefix} {card.recommendedFor}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
