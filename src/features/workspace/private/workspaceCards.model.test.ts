import { describe, expect, it, vi } from 'vitest';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import {
  buildWorkspaceFavoriteProviderCardModels,
  buildWorkspaceFavoriteProviderCardProps,
} from '@/features/workspace/private/workspaceCards.model';

function provider(overrides: Partial<ProviderPublicDto> = {}): ProviderPublicDto {
  return {
    id: 'provider-1',
    displayName: 'Provider One',
    ratingAvg: 4.8,
    ratingCount: 42,
    completedJobs: 32,
    ...overrides,
  };
}

describe('workspaceCards.model', () => {
  it('builds favorite provider card props with favorite and pending state', () => {
    const toggle = vi.fn();
    const props = buildWorkspaceFavoriteProviderCardProps({
      t: (key) => String(key),
      locale: 'de',
      provider: provider(),
      favoriteProviderLookup: new Set(['provider-1']),
      pendingFavoriteProviderIds: new Set(['provider-1']),
      onToggleProviderFavorite: toggle,
      favoriteProviderRoleLabelById: new Map([['provider-1', 'Elektriker']]),
      favoriteProviderCityLabelById: new Map([['provider-1', 'Berlin']]),
    });

    expect(props.canToggleFavorite).toBe(true);
    expect(props.isFavorite).toBe(true);
    expect(props.isFavoritePending).toBe(true);
    expect(props.onToggleFavorite).toBe(toggle);
    expect(props.provider.role).toBe('Elektriker');
    expect(props.provider.cityLabel).toBe('Berlin');
    expect(props.provider.profileHref).toBe('/providers/provider-1');
  });

  it('builds stable keyed models for all favorite providers', () => {
    const models = buildWorkspaceFavoriteProviderCardModels({
      t: (key) => String(key),
      locale: 'de',
      favoriteProviders: [
        provider({ id: 'provider-1' }),
        provider({ id: 'provider-2', displayName: 'Provider Two' }),
      ],
      favoriteProviderLookup: new Set(['provider-2']),
      pendingFavoriteProviderIds: new Set<string>(),
      onToggleProviderFavorite: vi.fn(),
      favoriteProviderRoleLabelById: new Map(),
      favoriteProviderCityLabelById: new Map(),
    });

    expect(models.map((item) => item.key)).toEqual([
      'fav-provider-provider-1',
      'fav-provider-provider-2',
    ]);
    expect(models[1]?.props.isFavorite).toBe(true);
    expect(models[0]?.props.provider.name).toBe('Provider One');
  });
});
