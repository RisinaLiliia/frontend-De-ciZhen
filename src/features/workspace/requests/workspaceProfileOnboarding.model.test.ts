import { describe, expect, it } from 'vitest';

import {
  buildPasswordChecks,
  buildProfileCategoryOptions,
  buildProfileCityOptions,
  resolveAvatarInitial,
  resolveCategoryServiceKeys,
  resolveProfileOnboardingSubmission,
} from './workspaceProfileOnboarding.model';

describe('workspaceProfileOnboarding.model', () => {
  it('builds sorted city and category options', () => {
    const cityOptions = buildProfileCityOptions([
      { id: 'muc', key: 'munich', i18n: { en: 'Munich' }, countryCode: 'DE', isActive: true, sortOrder: 2 },
      { id: 'ber', key: 'berlin', i18n: { en: 'Berlin' }, countryCode: 'DE', isActive: true, sortOrder: 1 },
    ], 'en');
    const categoryOptions = buildProfileCategoryOptions([
      { key: 'repair', i18n: { en: 'Repair' }, isActive: true, sortOrder: 20 },
      { key: 'cleaning', i18n: { en: 'Cleaning' }, isActive: true, sortOrder: 10 },
    ], 'en');

    expect(cityOptions.map((item) => item.value)).toEqual(['ber', 'muc']);
    expect(categoryOptions.map((item) => item.value)).toEqual(['cleaning', 'repair']);
  });

  it('resolves password checks and avatar initial', () => {
    expect(buildPasswordChecks('Abcdef1!')).toEqual({
      length: true,
      upper: true,
      lower: true,
      digit: true,
      symbol: true,
    });
    expect(buildPasswordChecks('abc')).toEqual({
      length: false,
      upper: false,
      lower: true,
      digit: false,
      symbol: false,
    });

    expect(resolveAvatarInitial('  maria ')).toBe('M');
    expect(resolveAvatarInitial('')).toBe('U');
  });

  it('resolves category service keys for selected category', () => {
    const serviceKeys = resolveCategoryServiceKeys('cleaning', [
      { key: 'deep-clean', categoryKey: 'cleaning', i18n: { en: 'Deep clean' }, isActive: true, sortOrder: 1 },
      { key: 'repair-door', categoryKey: 'repair', i18n: { en: 'Repair door' }, isActive: true, sortOrder: 2 },
      { key: 'window-clean', categoryKey: 'cleaning', i18n: { en: 'Window clean' }, isActive: true, sortOrder: 3 },
    ]);

    expect(serviceKeys).toEqual(['deep-clean', 'window-clean']);
    expect(resolveCategoryServiceKeys('', [])).toEqual([]);
  });

  it('resolves onboarding submission payload with city label and service keys', () => {
    expect(resolveProfileOnboardingSubmission({
      name: 'Maria',
      cityId: 'ber',
      categoryKey: 'cleaning',
      description: '  Fast and careful  ',
      email: 'maria@example.com',
      password: 'Abcdef1!',
      acceptPrivacyPolicy: true,
    }, [
      { id: 'ber', key: 'berlin', i18n: { en: 'Berlin' }, countryCode: 'DE', isActive: true, sortOrder: 1 },
    ], 'en', [
      { key: 'deep-clean', categoryKey: 'cleaning', i18n: { en: 'Deep clean' }, isActive: true, sortOrder: 1 },
      { key: 'repair-door', categoryKey: 'repair', i18n: { en: 'Repair door' }, isActive: true, sortOrder: 2 },
    ])).toEqual({
      cityLabel: 'Berlin',
      description: 'Fast and careful',
      selectedCategoryServiceKeys: ['deep-clean'],
    });

    expect(resolveProfileOnboardingSubmission({
      name: 'Maria',
      cityId: 'missing',
      categoryKey: '',
      description: '',
      email: 'maria@example.com',
      password: 'Abcdef1!',
      acceptPrivacyPolicy: true,
    }, [], 'en', [])).toBeNull();
  });
});
