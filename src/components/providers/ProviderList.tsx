import { ProviderCard, type ProviderCardItem } from '@/components/providers/ProviderCard';

type ProviderListProps = {
  providers: ReadonlyArray<ProviderCardItem>;
  className?: string;
  variant?: 'list' | 'grid';
  favoriteProviderIds?: ReadonlySet<string>;
  pendingFavoriteProviderIds?: ReadonlySet<string>;
  onToggleFavorite?: (providerId: string) => void;
};

export function ProviderList({
  providers,
  className = 'provider-list',
  variant = 'list',
  favoriteProviderIds,
  pendingFavoriteProviderIds,
  onToggleFavorite,
}: ProviderListProps) {
  return (
    <div className={className}>
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          variant={variant}
          canToggleFavorite={Boolean(onToggleFavorite)}
          isFavorite={favoriteProviderIds?.has(provider.id)}
          isFavoritePending={pendingFavoriteProviderIds?.has(provider.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

