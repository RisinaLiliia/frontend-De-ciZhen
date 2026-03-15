'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';

export function StatisticsGrowthPanel({
  panelRef,
  panelMinHeight,
  copy,
  subtitle,
  growthCards,
}: {
  panelRef?: React.Ref<HTMLElement>;
  panelMinHeight?: number | null;
  copy: WorkspaceStatisticsModel['copy'];
  subtitle?: string;
  growthCards: WorkspaceStatisticsModel['growthCards'];
}) {
  if (growthCards.length === 0) return null;

  const featuredCard = growthCards.find((item) => item.tone === 'primary') ?? growthCards[0] ?? null;
  const secondaryCards = growthCards
    .filter((item) => item.key !== featuredCard?.key)
    .slice(0, 2);

  return (
    <section
      ref={panelRef}
      className="panel stack-sm workspace-statistics__growth"
      style={panelMinHeight ? { minHeight: `${panelMinHeight}px` } : undefined}
    >
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.growthTitle}</p>
        <p className="section-subtitle">{subtitle ?? copy.growthSubtitle}</p>
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
        <div
          className={`workspace-statistics-growth__grid${secondaryCards.length === 1 ? ' workspace-statistics-growth__grid--single' : ''}`.trim()}
        >
          {secondaryCards.map((card) => (
            card.key === 'local_ads' ? (
              <Link
                key={card.key}
                href={card.href}
                prefetch={false}
                className="stat-card stat-link workspace-statistics-growth__card is-local"
              >
                <div className="workspace-statistics-growth__head">
                  <div className="workspace-statistics-growth__head-copy">
                    <p className="workspace-statistics-growth__title">{card.title}</p>
                    <p className="workspace-statistics-growth__body">{card.body}</p>
                    <div className="workspace-statistics-growth__labels">
                      {card.recommendedFor ? (
                        <Badge variant="info" size="sm">
                          {copy.growthRecommendedPrefix} {card.recommendedFor}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="workspace-statistics-growth__visual" aria-hidden="true">
                    <span className="workspace-statistics-growth__visual-tile">
                      <span className="workspace-statistics-growth__visual-ring" />
                      <span className="workspace-statistics-growth__visual-pin" />
                      <span className="workspace-statistics-growth__visual-dot is-primary" />
                      <span className="workspace-statistics-growth__visual-dot is-secondary" />
                    </span>
                  </div>
                </div>
                <p className="workspace-statistics-growth__benefit">{card.benefit}</p>
                <span className="link-accent workspace-statistics-growth__cta">
                  {copy.growthLocalAdsCta}
                </span>
              </Link>
            ) : card.key === 'premium_tools' ? (
              <Link
                key={card.key}
                href={card.href}
                prefetch={false}
                className="stat-card stat-link workspace-statistics-growth__card is-premium"
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
                <span className="link-accent workspace-statistics-growth__cta">
                  {copy.growthCta}
                </span>
              </Link>
            ) : (
              <article
                key={card.key}
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
            )
          ))}
        </div>
      ) : null}
    </section>
  );
}
