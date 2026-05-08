'use client';

import type { FilterOption } from '@/components/requests/requestsFilters.types';
import type { Locale } from '@/lib/i18n/t';

export function buildWorkspacePrivateSortOptions(locale: Locale): FilterOption[] {
  return locale === 'de'
    ? [
      { value: 'activity', label: 'Neueste Aktivität' },
      { value: 'deadline', label: 'Bald fällig' },
      { value: 'newest', label: 'Neu erstellt' },
      { value: 'budget', label: 'Höchstes Budget' },
    ]
    : [
      { value: 'activity', label: 'Latest activity' },
      { value: 'deadline', label: 'Due soon' },
      { value: 'newest', label: 'Newest' },
      { value: 'budget', label: 'Highest budget' },
    ];
}

export function getWorkspaceRequestsScopeAriaLabel(locale: Locale) {
  return locale === 'de' ? 'Auftragsmodus' : 'Request scope';
}

export function getWorkspaceStateAriaLabel(locale: Locale) {
  return locale === 'de' ? 'Status' : 'State';
}

export function getWorkspaceRangeGroupLabel(locale: Locale) {
  return locale === 'de' ? 'Zeitraum' : 'Range';
}

export function getWorkspaceScopeSwitchLabels(locale: Locale) {
  return locale === 'de'
    ? {
      market: 'Markt',
      my: 'Meine Arbeit',
    }
    : {
      market: 'Market',
      my: 'My work',
    };
}

export function getWorkspaceChipLabels(locale: Locale) {
  return locale === 'de'
    ? {
      city: 'Ort',
      category: 'Kategorie',
      range: 'Zeitraum',
      service: 'Service',
    }
    : {
      city: 'Location',
      category: 'Category',
      range: 'Range',
      service: 'Service',
    };
}

export function getWorkspaceStateToggleItems(locale: Locale) {
  return locale === 'de'
    ? [
      { key: 'all', label: 'Alle' },
      { key: 'attention', label: 'Aktiv' },
      { key: 'execution', label: 'In Ausführung' },
      { key: 'completed', label: 'Abgeschlossen' },
    ]
    : [
      { key: 'all', label: 'All' },
      { key: 'attention', label: 'Active' },
      { key: 'execution', label: 'In execution' },
      { key: 'completed', label: 'Completed' },
    ];
}
