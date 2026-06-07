import { describe, expect, it } from 'vitest';

import type { ProviderProfileDto, ProviderPublicDto } from '@/lib/api/dto/providers';
import {
  computeManualProfileCompleteness,
  findProviderPublicByUserId,
  resolveAvatarPreviewUrl,
  resolveProfileCompleteness,
} from '@/features/profile/profileWorkspace.presentation';

function publicProvider(overrides: Partial<ProviderPublicDto> = {}): ProviderPublicDto {
  return {
    id: 'provider-1',
    ratingAvg: 4.5,
    ratingCount: 7,
    completedJobs: 21,
    ...overrides,
  };
}

function providerProfile(overrides: Partial<ProviderProfileDto> = {}): ProviderProfileDto {
  return {
    id: 'profile-1',
    userId: 'user-1',
    serviceKeys: ['home_cleaning'],
    status: 'draft',
    isBlocked: false,
    isProfileComplete: false,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('profileWorkspace.presentation', () => {
  it('finds provider by userId first with legacy id fallback', () => {
    const list = [
      publicProvider({ id: 'provider-a', userId: 'user-a' }),
      publicProvider({ id: 'user-b' }),
    ];
    expect(findProviderPublicByUserId(list, 'user-a')?.id).toBe('provider-a');
    expect(findProviderPublicByUserId(list, 'user-b')?.id).toBe('user-b');
    expect(findProviderPublicByUserId(list, '')).toBeNull();
  });

  it('computes manual profile completeness in percents', () => {
    const result = computeManualProfileCompleteness({
      name: 'Anna',
      city: 'Berlin',
      phone: '',
      bio: 'I clean homes',
      avatarUrl: '/avatars/a.png',
    });
    expect(result).toBe(80);
  });

  it('uses backend profile completeness as source of truth for providers', () => {
    const complete = resolveProfileCompleteness({
      manualProfileCompleteness: 80,
      hasProviderProfile: true,
      providerProfile: providerProfile({ isProfileComplete: true }),
    });
    const incomplete = resolveProfileCompleteness({
      manualProfileCompleteness: 100,
      hasProviderProfile: true,
      providerProfile: providerProfile({ isProfileComplete: false }),
    });
    expect(complete).toBe(100);
    expect(incomplete).toBe(99);
  });

  it('resolves avatar preview urls and skips default avatar', () => {
    expect(resolveAvatarPreviewUrl('/avatars/default.png')).toBeNull();
    expect(resolveAvatarPreviewUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(resolveAvatarPreviewUrl('/uploads/me.png')).toContain('/uploads/me.png');
  });
});
