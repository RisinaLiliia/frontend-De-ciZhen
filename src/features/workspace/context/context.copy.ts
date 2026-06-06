'use client';

import type { Option as FilterOption } from '@/components/ui/Select';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate } from '@/lib/i18n/t';
import type { Locale } from '@/lib/i18n/t';

export function buildWorkspacePrivateSortOptions(locale: Locale): FilterOption[] {
  return [
    { value: 'activity', label: translate(I18N_KEYS.workspace.privateSortActivity, locale) },
    { value: 'deadline', label: translate(I18N_KEYS.workspace.privateSortDeadline, locale) },
    { value: 'newest', label: translate(I18N_KEYS.workspace.privateSortNewest, locale) },
    { value: 'budget', label: translate(I18N_KEYS.workspace.privateSortBudget, locale) },
  ];
}

export function getWorkspaceRequestsScopeAriaLabel(locale: Locale) {
  return translate(I18N_KEYS.workspace.requestsScopeAriaLabel, locale);
}

export function getWorkspaceStateAriaLabel(locale: Locale) {
  return translate(I18N_KEYS.workspace.stateAriaLabel, locale);
}

export function getWorkspaceRangeGroupLabel(locale: Locale) {
  return translate(I18N_KEYS.workspace.rangeAriaLabel, locale);
}

export function getWorkspaceScopeSwitchLabels(locale: Locale) {
  return {
    market: translate(I18N_KEYS.workspace.scopeMarketLabel, locale),
    my: translate(I18N_KEYS.workspace.scopeMyLabel, locale),
  };
}

export function getWorkspaceChipLabels(locale: Locale) {
  return {
    city: translate(I18N_KEYS.workspace.chipCityLabel, locale),
    category: translate(I18N_KEYS.workspace.chipCategoryLabel, locale),
    range: translate(I18N_KEYS.workspace.chipRangeLabel, locale),
    service: translate(I18N_KEYS.workspace.chipServiceLabel, locale),
  };
}

export function getWorkspaceStateToggleItems(locale: Locale) {
  return [
    { key: 'all', label: translate(I18N_KEYS.workspace.stateAllLabel, locale) },
    { key: 'attention', label: translate(I18N_KEYS.workspace.stateAttentionLabel, locale) },
    { key: 'execution', label: translate(I18N_KEYS.workspace.stateExecutionLabel, locale) },
    { key: 'completed', label: translate(I18N_KEYS.workspace.stateCompletedLabel, locale) },
  ];
}
