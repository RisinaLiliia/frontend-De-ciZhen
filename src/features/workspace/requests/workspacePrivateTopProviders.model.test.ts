import { describe, expect, it } from 'vitest';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import {
  buildWorkspacePrivateTopProviders,
  rankWorkspaceTopProviders,
} from '@/features/workspace/requests/workspacePrivateTopProviders.model';

function provider(overrides: Partial<ProviderPublicDto> = {}): ProviderPublicDto {
  return {
    id: 'provider-1',
    displayName: 'Provider One',
    ratingAvg: 4.6,
    ratingCount: 12,
    completedJobs: 20,
    ...overrides,
  };
}

describe('workspacePrivateTopProviders.model', () => {
  it('ranks providers by rating descending without mutating the input', () => {
    const input = [
      provider({ id: 'provider-1', ratingAvg: 4.2 }),
      provider({ id: 'provider-2', ratingAvg: 4.9 }),
      provider({ id: 'provider-3', ratingAvg: 4.5 }),
    ];

    const ranked = rankWorkspaceTopProviders(input);

    expect(ranked.map((item) => item.id)).toEqual([
      'provider-2',
      'provider-3',
      'provider-1',
    ]);
    expect(input.map((item) => item.id)).toEqual([
      'provider-1',
      'provider-2',
      'provider-3',
    ]);
  });

  it('builds only the top two workspace provider cards with workspace-specific hrefs', () => {
    const cards = buildWorkspacePrivateTopProviders({
      t: (key) => String(key),
      locale: 'de',
      providers: [
        provider({ id: 'provider-1', ratingAvg: 4.2 }),
        provider({
          id: 'provider-2',
          ratingAvg: 4.9,
          displayName: 'Best Provider',
          bio: 'Backend bio for workspace top provider.',
        }),
        provider({ id: 'provider-3', ratingAvg: 4.7 }),
      ],
    });

    expect(cards).toHaveLength(2);
    expect(cards.map((item) => item.id)).toEqual(['provider-2', 'provider-3']);
    expect(cards[0]?.profileHref).toBe('/providers/provider-2');
    expect(cards[0]?.reviewsHref).toBe('/providers/provider-2#reviews');
    expect(cards[0]?.status).toBe('online');
    expect(cards[0]?.ctaLabel).toBe('homePublic.topProvider1Cta');
    expect(cards[0]?.aboutPreview).toBe('Backend bio for workspace top provider.');
  });
});
