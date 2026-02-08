import Link from 'next/link';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';

export type TopProviderItem = {
  id: string;
  badges: string[];
  status: 'online' | 'offline';
  statusLabel: string;
  avatarLetter: string;
  avatarUrl?: string | null;
  name: string;
  role: string;
  rating: string;
  reviewsLabel: string;
  ctaLabel: string;
  profileHref: string;
  reviewsHref: string;
};

type TopProvidersPanelProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  providers: ReadonlyArray<TopProviderItem>;
  className?: string;
};

export function TopProvidersPanel({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  providers,
  className,
}: TopProvidersPanelProps) {
  return (
    <section className={`panel hide-mobile top-providers-panel ${className ?? ''}`.trim()}>
      <div className="panel-header">
        <div className="section-heading">
          <p className="section-title">{title}</p>
          <p className="section-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="provider-list">
        {providers.map((provider) => (
          <div key={provider.id} className="provider-card">
            {provider.badges.length ? (
              <div className="provider-badges provider-badges--corner">
                {provider.badges.map((badge, index) => (
                  <span key={`${provider.id}-badge-${index}`} className="provider-badge">
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="provider-info">
              <div className="provider-avatar-wrap">
                <span className="provider-avatar">
                  {provider.avatarUrl ? (
                    <img src={provider.avatarUrl} alt={provider.name} loading="lazy" />
                  ) : (
                    provider.avatarLetter
                  )}
                </span>
                <span
                  className={`provider-status-dot provider-status--${provider.status}`}
                  data-status-label={provider.statusLabel}
                  aria-label={provider.statusLabel}
                />
              </div>
              <div className="provider-main">
                <p className="provider-name">{provider.name}</p>
                <p className="provider-sub">{provider.role}</p>
                <div className="provider-rating-row">
                  <span className="rating-stars">★★★★★</span>
                  <span className="provider-rating">{provider.rating}</span>
                </div>
                <Link href={provider.reviewsHref} className="provider-reviews">
                  {provider.reviewsLabel}
                </Link>
              </div>
            </div>
            <Link href={provider.profileHref} className="btn-ghost is-primary w-full provider-cta">
              {provider.ctaLabel}
            </Link>
          </div>
        ))}
      </div>

      <div className="top-providers-footer flex justify-center">
        <MoreDotsLink href={ctaHref} label={ctaLabel} />
      </div>
    </section>
  );
}
