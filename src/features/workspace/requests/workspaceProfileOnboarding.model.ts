'use client';

import { z } from 'zod';

import { pickI18n } from '@/lib/i18n/helpers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { City, Service, ServiceCategory } from '@/features/catalog/model';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { Option } from '@/components/ui/Select';

export type ProfileOnboardingValues = {
  name: string;
  cityId: string;
  categoryKey: string;
  description: string;
  email: string;
  password: string;
  acceptPrivacyPolicy: boolean;
};

export function buildProfileOnboardingSchema(t: (key: I18nKey) => string) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t(I18N_KEYS.auth.errorNameRequired))
      .min(2, t(I18N_KEYS.auth.errorNameMin))
      .max(50, t(I18N_KEYS.auth.errorNameMin)),
    cityId: z.string().trim().min(1, t(I18N_KEYS.requestsPage.profileOnboardingCityRequired)),
    categoryKey: z.string().trim(),
    description: z.string().trim().max(500, t(I18N_KEYS.requestsPage.profileOnboardingDescriptionMax)),
    email: z
      .string()
      .trim()
      .min(1, t(I18N_KEYS.auth.errorEmailRequired))
      .max(100, t(I18N_KEYS.auth.errorEmailInvalid))
      .email(t(I18N_KEYS.auth.errorEmailInvalid)),
    password: z
      .string()
      .min(1, t(I18N_KEYS.auth.errorPasswordRequired))
      .min(8, t(I18N_KEYS.auth.errorPasswordMin))
      .max(64, t(I18N_KEYS.auth.errorPasswordMin))
      .regex(/[A-ZА-ЯЁ]/, t(I18N_KEYS.auth.passwordRuleUpper))
      .regex(/[a-zа-яё]/, t(I18N_KEYS.auth.passwordRuleLower))
      .regex(/\d/, t(I18N_KEYS.auth.passwordRuleDigit))
      .regex(/[^A-Za-zА-Яа-яЁё0-9]/, t(I18N_KEYS.auth.passwordRuleSymbol)),
    acceptPrivacyPolicy: z.boolean().refine((value) => value === true, t(I18N_KEYS.auth.errorAcceptPolicyRequired)),
  });
}

export function buildProfileCityOptions(cities: City[], locale: Locale): Option[] {
  return cities
    .slice()
    .sort((a, b) => pickI18n(a.i18n, locale).localeCompare(pickI18n(b.i18n, locale), locale))
    .map((city) => ({
      value: city.id,
      label: pickI18n(city.i18n, locale) || city.key,
    }));
}

export function buildProfileCategoryOptions(categories: ServiceCategory[], locale: Locale): Option[] {
  return categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      value: category.key,
      label: pickI18n(category.i18n, locale) || category.key,
    }));
}

export function buildPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-ZА-ЯЁ]/.test(password),
    lower: /[a-zа-яё]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^A-Za-zА-Яа-яЁё0-9]/.test(password),
  };
}

export function resolveAvatarInitial(name: string | undefined | null) {
  return (name?.trim().charAt(0) || 'U').toUpperCase();
}

export function resolveCategoryServiceKeys(categoryKey: string, services: Service[]) {
  if (!categoryKey) return [];
  return services
    .filter((service) => service.categoryKey === categoryKey)
    .map((service) => service.key);
}

export function resolveProfileOnboardingSubmission(
  values: ProfileOnboardingValues,
  cities: City[],
  locale: Locale,
  services: Service[],
) {
  const selectedCity = cities.find((city) => city.id === values.cityId);
  if (!selectedCity) return null;

  return {
    cityLabel: pickI18n(selectedCity.i18n, locale) || selectedCity.key,
    description: values.description.trim(),
    selectedCategoryServiceKeys: resolveCategoryServiceKeys(values.categoryKey, services),
  };
}
