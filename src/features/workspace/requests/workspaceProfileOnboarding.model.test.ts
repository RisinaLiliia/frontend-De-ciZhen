import { describe, expect, it } from 'vitest';

import {
  buildPasswordChecks,
  buildProfileCategoryOptions,
  buildProfileCityOptions,
  buildWorkspaceProfileRegisterFormData,
  buildWorkspaceProfileSaveFormData,
  resolveAvatarInitial,
  resolveCategoryServiceKeys,
} from './workspaceProfileOnboarding.model';

describe('workspaceProfileOnboarding.model', () => {
  it('builds sorted city and category options', () => {
    const cityOptions = buildProfileCityOptions([
      {
        id: 'muc',
        key: 'munich',
        name: 'Munich',
        i18n: { en: 'Munich' },
        countryCode: 'DE',
        stateName: 'Bavaria',
        districtName: null,
        postalCodes: ['80331'],
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'ber',
        key: 'berlin',
        name: 'Berlin',
        i18n: { en: 'Berlin' },
        countryCode: 'DE',
        stateName: 'Berlin',
        districtName: null,
        postalCodes: ['10115'],
        isActive: true,
        sortOrder: 1,
      },
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

  it('builds workspace profile save form data', () => {
    const formData = buildWorkspaceProfileSaveFormData({
      name: ' Maria ',
      city: ' Berlin ',
      phone: ' +49123 ',
      customerBio: ' Customer bio ',
      providerDisplayName: ' Provider ',
      providerBio: ' Provider bio ',
      providerCategoryKey: ' cleaning ',
      providerServiceKey: ' home_cleaning ',
      providerBasePrice: ' 40 ',
    });

    expect(formData.get('name')).toBe('Maria');
    expect(formData.get('city')).toBe('Berlin');
    expect(formData.get('phone')).toBe('+49123');
    expect(formData.get('customerBio')).toBe('Customer bio');
    expect(formData.get('providerDisplayName')).toBe('Provider');
    expect(formData.get('providerBio')).toBe('Provider bio');
    expect(formData.get('providerCategoryKey')).toBe('cleaning');
    expect(formData.get('providerServiceKey')).toBe('home_cleaning');
    expect(formData.get('providerBasePrice')).toBe('40');
  });

  it('builds workspace profile registration form data', () => {
    const formData = buildWorkspaceProfileRegisterFormData({
      viewerMode: 'provider',
      name: ' Maria ',
      email: ' maria@example.com ',
      password: 'Password1!',
      cityId: ' city-1 ',
      acceptPrivacyPolicy: true,
      providerCategoryKey: ' cleaning ',
    });

    expect(formData.get('viewerMode')).toBe('provider');
    expect(formData.get('name')).toBe('Maria');
    expect(formData.get('email')).toBe('maria@example.com');
    expect(formData.get('password')).toBe('Password1!');
    expect(formData.get('cityId')).toBe('city-1');
    expect(formData.get('acceptPrivacyPolicy')).toBe('true');
    expect(formData.get('providerCategoryKey')).toBe('cleaning');
  });
});
