import { describe, expect, it } from 'vitest';

import type { AppMeDto } from '@/lib/api/dto/auth';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { WorkspaceProvidersResponseDto } from '@/lib/api/dto/workspace';
import {
  backfillOwnProviderAvatar,
  backfillOwnProviderAvatars,
  backfillProviderAvatarFromCandidates,
  backfillProviderCardAvatarsFromCandidates,
  isOwnPublicProvider,
  resolvePublicProviderAvatarUrl,
} from '@/lib/providers/publicProvider';

function provider(overrides: Partial<ProviderPublicDto> = {}): ProviderPublicDto {
  return {
    id: 'provider-1',
    userId: 'user-1',
    displayName: 'Provider One',
    ratingAvg: 4.8,
    ratingCount: 24,
    completedJobs: 32,
    avatarUrl: null,
    ...overrides,
  };
}

function me(overrides: Partial<AppMeDto> = {}): AppMeDto {
  return {
    id: 'user-1',
    name: 'User One',
    email: 'user@example.com',
    role: 'provider',
    acceptedPrivacyPolicy: true,
    isBlocked: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    avatar: { url: 'https://cdn.example.com/avatar.jpg', isDefault: false },
    providerProfile: { id: 'provider-1', status: 'active' },
    ...overrides,
  };
}

function providerCardItem(
  overrides: Partial<WorkspaceProvidersResponseDto['list']['items'][number]> = {},
): WorkspaceProvidersResponseDto['list']['items'][number] {
  return {
    id: 'provider-1',
    userId: 'user-1',
    isFavorite: false,
    card: {
      id: 'provider-1',
      badges: [],
      isVerified: false,
      status: 'online',
      statusLabel: 'Online',
      avatarUrl: null,
      name: 'Provider One',
      role: 'Cleaning',
      cityLabel: 'Berlin',
      rating: '4.8',
      reviewsCount: 24,
      reviewsLabel: 'reviews',
      servicePreview: [],
      ctaLabel: 'Open',
      profileHref: '/providers/provider-1',
      reviewsHref: '/providers/provider-1#reviews',
    },
    ...overrides,
  };
}

describe('publicProvider avatar fallback', () => {
  it('detects the current user provider by user id or provider profile id', () => {
    expect(isOwnPublicProvider(provider(), me())).toBe(true);
    expect(isOwnPublicProvider(provider({ userId: 'other-user' }), me())).toBe(true);
    expect(isOwnPublicProvider(provider({ id: 'provider-2', userId: 'other-user' }), me())).toBe(false);
  });

  it('keeps backend avatar when it is already present', () => {
    const existingAvatar = 'https://cdn.example.com/profile-avatar.jpg';

    expect(
      resolvePublicProviderAvatarUrl(provider({ avatarUrl: existingAvatar }), me()),
    ).toBe(existingAvatar);
  });

  it('backfills missing avatar from auth me only for the own provider profile', () => {
    expect(resolvePublicProviderAvatarUrl(provider(), me())).toBe('https://cdn.example.com/avatar.jpg');
    expect(resolvePublicProviderAvatarUrl(provider({ id: 'provider-2', userId: 'user-2' }), me())).toBeNull();
  });

  it('applies avatar fallback to single providers and provider lists', () => {
    expect(backfillOwnProviderAvatar(provider(), me())?.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');

    expect(
      backfillOwnProviderAvatars(
        [provider(), provider({ id: 'provider-2', userId: 'user-2' })],
        me(),
      ).map((item) => item.avatarUrl),
    ).toEqual(['https://cdn.example.com/avatar.jpg', null]);
  });

  it('backfills missing public avatars from public provider candidates', () => {
    expect(
      backfillProviderAvatarFromCandidates(
        provider({ id: 'provider-2', userId: 'user-2' }),
        [provider({ id: 'provider-2', userId: 'user-2', avatarUrl: 'https://cdn.example.com/provider-2.jpg' })],
      )?.avatarUrl,
    ).toBe('https://cdn.example.com/provider-2.jpg');
  });

  it('backfills workspace provider cards from public provider candidates', () => {
    expect(
      backfillProviderCardAvatarsFromCandidates(
        [providerCardItem({ id: 'provider-2', userId: 'user-2', card: { ...providerCardItem().card, id: 'provider-2' } })],
        [provider({ id: 'provider-2', userId: 'user-2', avatarUrl: 'https://cdn.example.com/provider-2.jpg' })],
      )[0]?.card.avatarUrl,
    ).toBe('https://cdn.example.com/provider-2.jpg');
  });
});
