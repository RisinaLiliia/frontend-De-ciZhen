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
  serviceKey: string;
  description: string;
  email: string;
  password: string;
  acceptPrivacyPolicy: boolean;
};

type WorkspaceProfileSaveFormInput = {
  viewerMode: 'provider' | 'customer';
  name: string;
  city: string;
  phone: string;
  customerBio?: string;
  providerDisplayName?: string;
  providerBio?: string;
  providerCategoryKey?: string;
  providerServiceKey?: string;
  providerBasePrice?: string;
  avatarFile?: File | null;
};

type WorkspaceProfileRegisterFormInput = {
  viewerMode: 'provider' | 'customer';
  name: string;
  email: string;
  password: string;
  cityId: string;
  acceptPrivacyPolicy: boolean;
  phone?: string;
  customerBio?: string;
  providerDisplayName?: string;
  providerBio?: string;
  providerCategoryKey?: string;
  providerServiceKey?: string;
  providerBasePrice?: string;
  avatarFile?: File | null;
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
    serviceKey: z.string().trim(),
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

export function buildProfileServiceOptions(
  services: Service[],
  categoryKey: string,
  locale: Locale,
): Option[] {
  if (!categoryKey) return [];

  return services
    .filter((service) => service.categoryKey === categoryKey)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((service) => ({
      value: service.key,
      label: pickI18n(service.i18n, locale) || service.key,
    }));
}

export function resolveProfileServiceCategoryKey(serviceKey: string | undefined | null, services: Service[]) {
  if (!serviceKey) return '';
  return services.find((service) => service.key === serviceKey)?.categoryKey ?? '';
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

function appendFormValue(formData: FormData, key: string, value: string | boolean | null | undefined) {
  if (value === undefined || value === null) return;
  formData.append(key, typeof value === 'boolean' ? String(value) : value);
}

export function buildWorkspaceProfileSaveFormData(input: WorkspaceProfileSaveFormInput) {
  const formData = new FormData();
  appendFormValue(formData, 'viewerMode', input.viewerMode);
  appendFormValue(formData, 'name', input.name.trim());
  appendFormValue(formData, 'city', input.city.trim());
  appendFormValue(formData, 'phone', input.phone.trim());
  appendFormValue(formData, 'customerBio', input.customerBio?.trim());
  appendFormValue(formData, 'providerDisplayName', input.providerDisplayName?.trim());
  appendFormValue(formData, 'providerBio', input.providerBio?.trim());
  appendFormValue(formData, 'providerCategoryKey', input.providerCategoryKey?.trim());
  appendFormValue(formData, 'providerServiceKey', input.providerServiceKey?.trim());
  appendFormValue(formData, 'providerBasePrice', input.providerBasePrice?.trim());
  if (input.avatarFile) {
    formData.append('avatar', input.avatarFile);
  }
  return formData;
}

export function buildWorkspaceProfileRegisterFormData(input: WorkspaceProfileRegisterFormInput) {
  const formData = new FormData();
  appendFormValue(formData, 'viewerMode', input.viewerMode);
  appendFormValue(formData, 'name', input.name.trim());
  appendFormValue(formData, 'email', input.email.trim());
  appendFormValue(formData, 'password', input.password);
  appendFormValue(formData, 'cityId', input.cityId.trim());
  appendFormValue(formData, 'acceptPrivacyPolicy', input.acceptPrivacyPolicy);
  appendFormValue(formData, 'phone', input.phone?.trim());
  appendFormValue(formData, 'customerBio', input.customerBio?.trim());
  appendFormValue(formData, 'providerDisplayName', input.providerDisplayName?.trim());
  appendFormValue(formData, 'providerBio', input.providerBio?.trim());
  appendFormValue(formData, 'providerCategoryKey', input.providerCategoryKey?.trim());
  appendFormValue(formData, 'providerServiceKey', input.providerServiceKey?.trim());
  appendFormValue(formData, 'providerBasePrice', input.providerBasePrice?.trim());
  if (input.avatarFile) {
    formData.append('avatar', input.avatarFile);
  }
  return formData;
}
