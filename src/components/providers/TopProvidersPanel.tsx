import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { ProviderList } from '@/components/providers/ProviderList';
import type { ProviderCardItem } from '@/components/providers/ProviderCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

export type TopProviderItem = ProviderCardItem;

type TopProvidersPanelProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  providers: ReadonlyArray<TopProviderItem>;
  className?: string;
  favoriteProviderIds?: Set<string>;
  pendingFavoriteProviderIds?: Set<string>;
  onToggleFavorite?: (providerId: string) => void;
};

export function TopProvidersPanel({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  providers,
  className,
  favoriteProviderIds,
  pendingFavoriteProviderIds,
  onToggleFavorite,
}: TopProvidersPanelProps) {
  return (
    <Card className={`hide-mobile top-providers-panel ${className ?? ''}`.trim()}>
      <CardHeader className="home-panel-header">
        <div className="home-panel-heading">
          <CardTitle className="home-panel-title">{title}</CardTitle>
          <p className="home-panel-subtitle">{subtitle}</p>
        </div>
      </CardHeader>
      <ProviderList
        providers={providers}
        favoriteProviderIds={favoriteProviderIds}
        pendingFavoriteProviderIds={pendingFavoriteProviderIds}
        onToggleFavorite={onToggleFavorite}
      />

      <div className="top-providers-footer">
        <MoreDotsLink href={ctaHref} label={ctaLabel} />
      </div>
    </Card>
  );
}
