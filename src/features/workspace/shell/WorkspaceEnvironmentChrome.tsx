'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';
import {
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconFilter,
  IconPin,
  IconSettings,
  IconUser,
} from '@/components/ui/icons/icons';
import type { FilterOption } from '@/components/requests/requestsFilters.types';
import { WorkspaceDecisionActionCard } from '@/features/workspace/requests/components/WorkspaceDecisionActionCard';
import { WorkspaceDecisionRecommendationModal } from '@/features/workspace/requests/components/WorkspaceDecisionRecommendationModal';
import { WorkspaceDecisionRecommendationSection } from '@/features/workspace/requests/components/WorkspaceDecisionRecommendationSection';
import { getWorkspaceStatisticsCopy } from '@/features/workspace/requests/stats/workspaceStatistics.copy';
import { useWorkspacePublicFilters } from '@/features/workspace/public/useWorkspacePublicFilters';
import { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
import { resolveActiveWorkspaceMode, type WorkspaceModeKey } from '@/features/workspace/shell/workspaceModes';
import { RANGE_OPTIONS, rangeLabelShort } from '@/features/workspace/requests/stats/components/statisticsContext.constants';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { isWorkspaceTab, type WorkspaceTab } from '@/features/workspace/requests/workspace.types';

type Translator = (key: I18nKey) => string;

export type WorkspaceModeItem = {
  key: WorkspaceModeKey;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
};

type WorkspaceModeCopy = {
  eyebrow: string;
  sharedContextLabel: string;
  clearContextLabel: string;
  shellHint: string;
  contextFallbacks: {
    city: string;
    category: string;
    service: string;
    range: string;
  };
  brief: {
    title: string;
    description: string;
    footprintLabel: string;
    footprintValue: string;
    syncLabel: string;
    syncValue: string;
  };
  rail: {
    nextStepTitle: string;
    scopeLabel: string;
    openModeTemplate: string;
  };
  modes: Record<WorkspaceModeKey, {
    label: string;
    title: string;
    description: string;
    railDescription: string;
    scope: string;
  }>;
};

type WorkspaceSharedContext = {
  activeMode: WorkspaceModeKey;
  modeItems: WorkspaceModeItem[];
  title: string;
  description: string;
  railDescription: string;
  scope: string;
  activeModeHref: string;
  chips: Array<{
    key: 'city' | 'category' | 'service' | 'range';
    label: string;
    value: string;
    icon: React.ReactNode;
  }>;
  copy: WorkspaceModeCopy;
  controls: {
    cityOptions: FilterOption[];
    categoryOptions: FilterOption[];
    serviceOptions: FilterOption[];
    sortOptions: FilterOption[];
    cityId: string;
    categoryKey: string;
    subcategoryKey: string;
    sortBy: string;
    range: WorkspaceStatisticsRange;
    onCityChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSubcategoryChange: (value: string) => void;
    onSortChange: (value: string) => void;
    onRangeChange: (next: WorkspaceStatisticsRange) => void;
    onReset: () => void;
    closeLabel: string;
  };
};

type WorkspaceFocusRecommendationCopy = {
  title: string;
  defaultContextLabel: string;
  loadingLabel: string;
  loadingBody: string;
  recommendationLabel: string;
  scopeLabel: string;
  actionLabel: string;
  switchLabel: string;
  modes: Record<WorkspaceModeKey, {
    heroTitleTemplate: string;
    heroText: string;
    actionText: string;
    switchText: string;
  }>;
};

const SHARED_QUERY_KEYS = ['cityId', 'categoryKey', 'subcategoryKey', 'range'] as const;
const CLEAR_QUERY_KEYS = ['cityId', 'categoryKey', 'subcategoryKey', 'range', 'sort', 'page'] as const;

function getWorkspaceFocusRecommendationCopy(locale: Locale): WorkspaceFocusRecommendationCopy {
  if (locale === 'en') {
    return {
      title: 'Next step',
      defaultContextLabel: 'Current workspace context',
      loadingLabel: "De'ci AI is prioritizing the next step…",
      loadingBody: 'The recommendation is prepared from the active workspace context, filters, and current mode.',
      recommendationLabel: 'Recommended step',
      scopeLabel: 'Shared scope',
      actionLabel: 'Recommended action',
      switchLabel: 'When switching makes sense',
      modes: {
        overview: {
          heroTitleTemplate: 'Prioritize {mode}',
          heroText: 'Overview is currently the strongest next step to triage queue, offers, and platform signals before moving deeper into execution.',
          actionText: 'Start in overview, review new requests and active offers, then move into execution or analytics with clearer priorities.',
          switchText: 'Switch to Requests when direct replies or offers are urgent, and to Analysis when pricing, timing, or market signals need a decision first.',
        },
        requests: {
          heroTitleTemplate: 'Prioritize {mode}',
          heroText: 'Requests is currently the strongest next step because the active context already narrows the work queue to relevant demand.',
          actionText: 'Work through the newest relevant requests first, keep response time low, and decide quickly whether to offer, shortlist, or move on.',
          switchText: 'Switch to Analysis when pricing or win-rate confidence is unclear, and to Providers when you need additional capacity or backup supply.',
        },
        providers: {
          heroTitleTemplate: 'Prioritize {mode}',
          heroText: 'Providers is currently the strongest next step when you need to compare supply inside the same market scope.',
          actionText: 'Use the current filters to shortlist providers, compare responsiveness and profile quality, and keep the final list tightly scoped.',
          switchText: 'Switch to Requests when demand already needs action now, and to Analysis when you need stronger confidence on competition or market depth first.',
        },
        analysis: {
          heroTitleTemplate: 'Prioritize {mode}',
          heroText: 'Analysis is currently the strongest next step when the next decision depends on timing, pricing, or market momentum.',
          actionText: 'Validate pricing, demand, and competition inside the same context before sending offers or changing activation priorities.',
          switchText: 'Switch back to Requests when the decision is ready for execution, and to Actions when profile, setup, or visibility changes are the real blocker.',
        },
        actions: {
          heroTitleTemplate: 'Prioritize {mode}',
          heroText: 'Actions is currently the strongest next step when activation, profile quality, or setup is limiting performance.',
          actionText: 'Use this mode to improve readiness, tighten profile quality, and complete operational setup without losing the shared market frame.',
          switchText: 'Switch to Analysis when you need clearer market direction first, and to Requests once the setup is strong enough for direct execution.',
        },
      },
    };
  }

  return {
    title: 'Nächster Schritt',
    defaultContextLabel: 'Aktueller Workspace-Kontext',
    loadingLabel: "De'ci KI priorisiert den nächsten Schritt…",
    loadingBody: 'Die Empfehlung wird auf Basis des aktiven Workspace-Kontexts, der Filter und des aktuellen Modus vorbereitet.',
    recommendationLabel: 'Empfohlener Schritt',
    scopeLabel: 'Gemeinsamer Scope',
    actionLabel: 'Handlungsempfehlung',
    switchLabel: 'Wann ein Wechsel sinnvoll ist',
    modes: {
      overview: {
        heroTitleTemplate: '{mode} priorisieren',
        heroText: 'Die Übersicht ist aktuell der sinnvollste nächste Schritt, um Queue, Angebote und Plattformsignale vor der tieferen Ausführung sauber zu priorisieren.',
        actionText: 'Starte in der Übersicht, prüfe neue Anfragen und aktive Angebote und gehe erst danach gezielt in Ausführung oder Analyse.',
        switchText: 'Wechsle in Aufträge, wenn direkte Antworten oder Angebote anstehen, und in Analyse, wenn Preis, Timing oder Marktchance zuerst geklärt werden müssen.',
      },
      requests: {
        heroTitleTemplate: '{mode} priorisieren',
        heroText: 'Aufträge ist aktuell der sinnvollste nächste Schritt, weil der aktive Kontext die Nachfrage bereits auf relevante Arbeit eingrenzt.',
        actionText: 'Arbeite zuerst die neuesten passenden Anfragen ab, halte Reaktionszeiten niedrig und entscheide schnell über Angebot, Shortlist oder Abschluss.',
        switchText: 'Wechsle in Analyse, wenn Preisstrategie oder Abschlusswahrscheinlichkeit unklar sind, und in Anbieter, wenn zusätzliche Kapazität oder Alternativen fehlen.',
      },
      providers: {
        heroTitleTemplate: '{mode} priorisieren',
        heroText: 'Anbieter ist aktuell der sinnvollste nächste Schritt, wenn du Angebot und Kapazität im gleichen Marktkontext vergleichen musst.',
        actionText: 'Nutze die aktuellen Filter, um Anbieter enger zu shortlistieren, Reaktionsstärke zu vergleichen und die Auswahl klar zu verdichten.',
        switchText: 'Wechsle in Aufträge, wenn die Nachfrage sofort operativ bearbeitet werden muss, und in Analyse, wenn Wettbewerb oder Marktgröße zuerst bewertet werden sollten.',
      },
      analysis: {
        heroTitleTemplate: '{mode} priorisieren',
        heroText: 'Analyse ist aktuell der sinnvollste nächste Schritt, wenn Preis, Timing oder Marktbewegung die nächste Entscheidung bestimmen.',
        actionText: 'Prüfe Pricing, Nachfrage und Wettbewerb im gleichen Kontext, bevor du Angebote verschickst oder Aktivierungen umpriorisierst.',
        switchText: 'Wechsle zurück in Aufträge, sobald die Entscheidung reif für Ausführung ist, und in Aktionen, wenn Profil, Setup oder Sichtbarkeit der eigentliche Engpass sind.',
      },
      actions: {
        heroTitleTemplate: '{mode} priorisieren',
        heroText: 'Aktionen ist aktuell der sinnvollste nächste Schritt, wenn Aktivierung, Profilqualität oder Setup die Leistung begrenzen.',
        actionText: 'Nutze diesen Modus, um Einsatzbereitschaft, Profilqualität und operative Basis zu stärken, ohne den gemeinsamen Marktkontext zu verlieren.',
        switchText: 'Wechsle in Analyse, wenn du zuerst eine klarere Marktrichtung brauchst, und in Aufträge, sobald das Setup stark genug für direkte Ausführung ist.',
      },
    },
  };
}

function getWorkspaceModeCopy(locale: Locale): WorkspaceModeCopy {
  if (locale === 'en') {
    return {
      eyebrow: 'Unified Workspace',
      sharedContextLabel: 'Shared context',
      clearContextLabel: 'Reset context',
      shellHint: 'One shell / one context / focused modes',
      contextFallbacks: {
        city: 'All cities',
        category: 'All categories',
        service: 'All services',
        range: '30 days',
      },
      brief: {
        title: 'Current operating frame',
        description: 'The same workspace context stays active across requests, provider search, analytics, and actions.',
        footprintLabel: 'Context footprint',
        footprintValue: 'Cross-mode',
        syncLabel: 'Filter sync',
        syncValue: 'Requests / Providers / Analytics',
      },
      rail: {
        nextStepTitle: 'Current focus',
        scopeLabel: 'Shared scope',
        openModeTemplate: 'Open {mode}',
      },
      modes: {
        overview: {
          label: 'Overview',
          title: 'Overview',
          description: 'Your working entry point with current queue, progress, and next decisions.',
          railDescription: 'Use the overview to orient before switching into execution or analysis.',
          scope: 'Entry point for the current work cycle',
        },
        requests: {
          label: 'Requests',
          title: 'Requests',
          description: 'Operate on incoming work, offers, and active delivery without leaving the workspace.',
          railDescription: 'The same city and category filters now narrow the request flow.',
          scope: 'Execution mode for active demand and offers',
        },
        providers: {
          label: 'Providers',
          title: 'Providers',
          description: 'Search, compare, and shortlist providers inside the same market context.',
          railDescription: 'Provider discovery inherits the same city and category scope.',
          scope: 'Sourcing mode for provider discovery',
        },
        analysis: {
          label: 'Analysis',
          title: 'Analysis',
          description: 'Decision center for market signals, timing, and pricing under the same filters.',
          railDescription: 'Analytics uses the same shared context, including the selected time range.',
          scope: 'Decision mode for market intelligence',
        },
        actions: {
          label: 'Actions',
          title: 'Actions',
          description: 'Profile, setup, and activation tools remain in the same operating shell.',
          railDescription: 'Use this mode to configure actions without losing the current market frame.',
          scope: 'Activation mode for profile and setup',
        },
      },
    };
  }

  return {
    eyebrow: 'Ein Workspace',
    sharedContextLabel: 'Gemeinsamer Kontext',
    clearContextLabel: 'Kontext zurücksetzen',
    shellHint: 'Ein Shell / ein Kontext / klare Modi',
    contextFallbacks: {
      city: 'Alle Städte',
      category: 'Alle Kategorien',
      service: 'Alle Services',
      range: '30 Tage',
    },
    brief: {
      title: 'Aktueller Arbeitsrahmen',
      description: 'Der gleiche Workspace-Kontext bleibt aktiv, wenn du zwischen Aufträgen, Anbieter-Suche, Analyse und Aktionen wechselst.',
      footprintLabel: 'Kontext-Footprint',
      footprintValue: 'Modusübergreifend',
      syncLabel: 'Filter-Sync',
      syncValue: 'Aufträge / Anbieter / Analyse',
    },
    rail: {
      nextStepTitle: 'Aktueller Fokus',
      scopeLabel: 'Gemeinsamer Scope',
      openModeTemplate: '{mode} öffnen',
    },
    modes: {
      overview: {
        label: 'Übersicht',
        title: 'Übersicht',
        description: 'Dein Einstiegspunkt mit Queue, Fortschritt und den nächsten Entscheidungen.',
        railDescription: 'Nutze die Übersicht als Startpunkt, bevor du in Ausführung oder Analyse gehst.',
        scope: 'Einstieg in den aktuellen Arbeitszyklus',
      },
      requests: {
        label: 'Aufträge',
        title: 'Aufträge',
        description: 'Arbeite an Nachfrage, Angeboten und laufender Lieferung, ohne den Workspace zu verlassen.',
        railDescription: 'Der gleiche Stadt- und Kategorie-Kontext verengt hier direkt den Auftragsfluss.',
        scope: 'Ausführungsmodus für Nachfrage und Angebote',
      },
      providers: {
        label: 'Anbieter',
        title: 'Anbieter',
        description: 'Suche, vergleiche und shortlist Anbieter im gleichen Marktkontext.',
        railDescription: 'Die Anbieter-Suche übernimmt den gleichen Stadt- und Kategorie-Scope.',
        scope: 'Sourcing-Modus für Anbieter-Auswahl',
      },
      analysis: {
        label: 'Analyse',
        title: 'Analyse',
        description: 'Decision Center für Marktsignale, Timing und Pricing unter denselben Filtern.',
        railDescription: 'Die Analyse nutzt denselben gemeinsamen Kontext inklusive Zeitraum.',
        scope: 'Entscheidungsmodus für Marktintelligenz',
      },
      actions: {
        label: 'Aktionen',
        title: 'Aktionen',
        description: 'Profil, Setup und Aktivierungen bleiben in derselben Arbeitsumgebung.',
        railDescription: 'Nutze diesen Modus für Aktivierungen, ohne den aktuellen Markt-Kontext zu verlieren.',
        scope: 'Aktivierungsmodus für Profil und Setup',
      },
    },
  };
}

function resolveRangeLabel(locale: Locale, value: string | null, fallback: string) {
  if (value === '24h') return '24h';
  if (value === '7d') return locale === 'de' ? '7 Tage' : '7 days';
  if (value === '30d') return locale === 'de' ? '30 Tage' : '30 days';
  if (value === '90d') return locale === 'de' ? '90 Tage' : '90 days';
  return fallback;
}

function resolveWorkspaceSharedRange(value: string | null): WorkspaceStatisticsRange {
  if (value === '24h' || value === '7d' || value === '30d' || value === '90d') return value;
  return '30d';
}

function fillWorkspaceModeTemplate(template: string, mode: string) {
  return template.replace('{mode}', mode);
}

function getWorkspaceChipValue(
  chips: WorkspaceSharedContext['chips'],
  key: WorkspaceSharedContext['chips'][number]['key'],
) {
  return chips.find((chip) => chip.key === key)?.value ?? '';
}

function joinWorkspaceContext(parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join(' · ');
}

function toWorkspaceHref(params: URLSearchParams) {
  const query = params.toString();
  return query ? `/workspace?${query}` : '/workspace';
}

function copySharedContextParams(searchParams: URLSearchParams) {
  const next = new URLSearchParams();
  SHARED_QUERY_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) next.set(key, value);
  });
  return next;
}

function buildModeHref({
  currentSearch,
  mode,
}: {
  currentSearch: string;
  mode: WorkspaceModeKey;
}) {
  const current = new URLSearchParams(currentSearch);
  const next = copySharedContextParams(current);

  if (mode === 'overview') {
    next.set('section', 'overview');
    return toWorkspaceHref(next);
  }

  if (mode === 'requests') {
    next.set('section', 'requests');
    return toWorkspaceHref(next);
  }

  if (mode === 'providers') {
    next.set('section', 'providers');
    return toWorkspaceHref(next);
  }

  if (mode === 'analysis') {
    next.set('section', 'stats');
    return toWorkspaceHref(next);
  }

  next.set('section', 'profile');
  return toWorkspaceHref(next);
}

export function buildWorkspaceLocalNavItems(items: PersonalNavItem[]) {
  void items;
  return [];
}

function buildSharedContextControlsProps({
  model,
  t,
  locale,
}: {
  model: WorkspaceSharedContext;
  t: Translator;
  locale: Locale;
}) {
  const cityChip = model.chips.find((chip) => chip.key === 'city');
  const categoryChip = model.chips.find((chip) => chip.key === 'category');
  const serviceChip = model.chips.find((chip) => chip.key === 'service');
  const rangeChip = model.chips.find((chip) => chip.key === 'range');

  return {
    title: model.copy.sharedContextLabel,
    resetLabel: t(I18N_KEYS.requestsPage.clearFilters),
    closeLabel: model.controls.closeLabel,
    city: {
      value: model.controls.cityId,
      options: model.controls.cityOptions,
      ariaLabel: t(I18N_KEYS.requestsPage.cityLabel),
      onChange: model.controls.onCityChange,
      summaryLabel: cityChip?.value ?? model.copy.contextFallbacks.city,
    },
    category: {
      value: model.controls.categoryKey,
      options: model.controls.categoryOptions,
      ariaLabel: t(I18N_KEYS.requestsPage.categoryLabel),
      onChange: model.controls.onCategoryChange,
      summaryLabel: categoryChip?.value ?? model.copy.contextFallbacks.category,
    },
    service: {
      value: model.controls.subcategoryKey,
      options: model.controls.serviceOptions,
      ariaLabel: t(I18N_KEYS.requestsPage.serviceLabel),
      onChange: model.controls.onSubcategoryChange,
      summaryLabel: serviceChip?.value ?? model.copy.contextFallbacks.service,
      disabled: model.controls.categoryKey === 'all',
    },
    range: {
      value: model.controls.range,
      options: RANGE_OPTIONS.map((option) => ({
        value: option,
        label: resolveRangeLabel(locale, option, model.copy.contextFallbacks.range),
      })),
      mobileOptions: RANGE_OPTIONS.map((option) => ({
        value: option,
        label: rangeLabelShort(option),
      })),
      groupLabel: locale === 'de' ? 'Zeitraum' : 'Range',
      onChange: model.controls.onRangeChange,
      summaryLabel: rangeChip?.value ?? model.copy.contextFallbacks.range,
    },
    sort: {
      value: model.controls.sortBy,
      options: model.controls.sortOptions,
      ariaLabel: t(I18N_KEYS.requestsPage.sortLabel),
      onChange: model.controls.onSortChange,
      summaryLabel: model.controls.sortOptions.find((item) => item.value === model.controls.sortBy)?.label ?? '',
    },
    onReset: model.controls.onReset,
  };
}

export function useWorkspaceSharedContext({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
}): WorkspaceSharedContext {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = React.useMemo(() => getWorkspaceModeCopy(locale), [locale]);
  const sectionParam = searchParams.get('section');
  const hasExplicitWorkspaceTab = isWorkspaceTab(searchParams.get('tab'));
  const range = searchParams.get('range');
  const [, startTransition] = React.useTransition();
  const {
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    categoryOptions,
    cityOptions,
    serviceOptions,
    sortOptions,
    onCategoryChangeTracked,
    onSubcategoryChangeTracked,
    onCityChangeTracked,
    onSortChangeTracked,
  } = useWorkspacePublicFilters({
    t,
    locale,
    shouldLoadCatalog: true,
    activePublicSection,
  });

  const rawSearch = searchParams.toString();
  const currentRange = React.useMemo(
    () => resolveWorkspaceSharedRange(range),
    [range],
  );
  const activeMode = React.useMemo(
    () => resolveActiveWorkspaceMode({
      activePublicSection,
      activeWorkspaceTab,
      pathname,
      sectionParam,
      hasExplicitWorkspaceTab,
    }),
    [activePublicSection, activeWorkspaceTab, hasExplicitWorkspaceTab, pathname, sectionParam],
  );

  const replaceSharedContext = React.useCallback((mutate: (params: URLSearchParams) => void) => {
    const current = searchParams.toString();
    const next = new URLSearchParams(current);
    mutate(next);
    const nextQuery = next.toString();
    if (nextQuery === current) return;

    startTransition(() => {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  const onRangeChange = React.useCallback((next: WorkspaceStatisticsRange) => {
    replaceSharedContext((params) => {
      params.set('range', next);
      params.delete('statsCityPage');
    });
  }, [replaceSharedContext]);

  const onReset = React.useCallback(() => {
    replaceSharedContext((params) => {
      CLEAR_QUERY_KEYS.forEach((key) => params.delete(key));
      params.delete('statsCityPage');
    });
  }, [replaceSharedContext]);

  const selectedCategoryLabel = React.useMemo(
    () => categoryOptions.find((item) => item.value === categoryKey)?.label ?? copy.contextFallbacks.category,
    [categoryKey, categoryOptions, copy.contextFallbacks.category],
  );
  const selectedServiceLabel = React.useMemo(
    () => serviceOptions.find((item) => item.value === subcategoryKey)?.label ?? copy.contextFallbacks.service,
    [copy.contextFallbacks.service, serviceOptions, subcategoryKey],
  );
  const selectedCityLabel = React.useMemo(
    () => cityOptions.find((item) => item.value === cityId)?.label ?? copy.contextFallbacks.city,
    [cityId, cityOptions, copy.contextFallbacks.city],
  );
  const chips = React.useMemo(
    () => [
      {
        key: 'city' as const,
        label: locale === 'de' ? 'Ort' : 'Location',
        value: selectedCityLabel,
        icon: <IconPin />,
      },
      {
        key: 'category' as const,
        label: locale === 'de' ? 'Kategorie' : 'Category',
        value: selectedCategoryLabel,
        icon: <IconBriefcase />,
      },
      {
        key: 'range' as const,
        label: locale === 'de' ? 'Zeitraum' : 'Range',
        value: resolveRangeLabel(locale, range, copy.contextFallbacks.range),
        icon: <IconCalendar />,
      },
      {
        key: 'service' as const,
        label: locale === 'de' ? 'Service' : 'Service',
        value: selectedServiceLabel,
        icon: <IconFilter />,
      },
    ],
    [copy.contextFallbacks.range, locale, range, selectedCategoryLabel, selectedCityLabel, selectedServiceLabel],
  );

  const modeItems = React.useMemo<WorkspaceModeItem[]>(
    () => [
      {
        key: 'overview',
        label: copy.modes.overview.label,
        description: copy.modes.overview.description,
        href: buildModeHref({ currentSearch: rawSearch, mode: 'overview' }),
        icon: <IconCheck />,
        isActive: activeMode === 'overview',
      },
      {
        key: 'requests',
        label: copy.modes.requests.label,
        description: copy.modes.requests.description,
        href: buildModeHref({ currentSearch: rawSearch, mode: 'requests' }),
        icon: <IconBriefcase />,
        isActive: activeMode === 'requests',
      },
      {
        key: 'providers',
        label: copy.modes.providers.label,
        description: copy.modes.providers.description,
        href: buildModeHref({ currentSearch: rawSearch, mode: 'providers' }),
        icon: <IconUser />,
        isActive: activeMode === 'providers',
      },
      {
        key: 'analysis',
        label: copy.modes.analysis.label,
        description: copy.modes.analysis.description,
        href: buildModeHref({ currentSearch: rawSearch, mode: 'analysis' }),
        icon: <IconFilter />,
        isActive: activeMode === 'analysis',
      },
      {
        key: 'actions',
        label: copy.modes.actions.label,
        description: copy.modes.actions.description,
        href: buildModeHref({ currentSearch: rawSearch, mode: 'actions' }),
        icon: <IconSettings />,
        isActive: activeMode === 'actions',
      },
    ],
    [activeMode, copy.modes.actions.description, copy.modes.actions.label, copy.modes.analysis.description, copy.modes.analysis.label, copy.modes.overview.description, copy.modes.overview.label, copy.modes.providers.description, copy.modes.providers.label, copy.modes.requests.description, copy.modes.requests.label, rawSearch],
  );

  const activeModeCopy = copy.modes[activeMode];
  const activeModeHref = modeItems.find((item) => item.isActive)?.href ?? '/workspace';

  return React.useMemo(
    () => ({
      activeMode,
      modeItems,
      title: activeModeCopy.title,
      description: activeModeCopy.description,
      railDescription: activeModeCopy.railDescription,
      scope: activeModeCopy.scope,
      activeModeHref,
      chips,
      copy,
      controls: {
        cityOptions,
        categoryOptions,
        serviceOptions,
        sortOptions,
        cityId,
        categoryKey,
        subcategoryKey,
        sortBy,
        range: currentRange,
        onCityChange: onCityChangeTracked,
        onCategoryChange: onCategoryChangeTracked,
        onSubcategoryChange: onSubcategoryChangeTracked,
        onSortChange: onSortChangeTracked,
        onRangeChange,
        onReset,
        closeLabel: t(I18N_KEYS.auth.closeDialog),
      },
    }),
    [
      activeMode,
      activeModeCopy.description,
      activeModeCopy.railDescription,
      activeModeCopy.scope,
      activeModeCopy.title,
      activeModeHref,
      categoryKey,
      categoryOptions,
      chips,
      cityId,
      cityOptions,
      copy,
      currentRange,
      modeItems,
      onCategoryChangeTracked,
      onCityChangeTracked,
      onSortChangeTracked,
      onSubcategoryChangeTracked,
      onRangeChange,
      onReset,
      serviceOptions,
      sortBy,
      sortOptions,
      subcategoryKey,
      t,
    ],
  );
}

export function WorkspaceModeHeader({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
}) {
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({ model, t, locale });
  return (
    <section className="workspace-environment">
      <div className="workspace-environment__hero">
        <div className="workspace-environment__copy">
          <span className="workspace-environment__eyebrow">{model.copy.eyebrow}</span>
          <div className="workspace-environment__heading">
            <h1 className="workspace-environment__title">{model.title}</h1>
            <p className="workspace-environment__description">{model.description}</p>
          </div>
        </div>
        <div className="workspace-environment__shell-hint">{model.copy.shellHint}</div>
      </div>

      <nav className="workspace-mode-nav" aria-label={locale === 'de' ? 'Workspace-Modi' : 'Workspace modes'}>
        {model.modeItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            prefetch={false}
            className={`workspace-mode-nav__item${item.isActive ? ' is-active' : ''}`.trim()}
            aria-current={item.isActive ? 'page' : undefined}
          >
            <span className="workspace-mode-nav__icon" aria-hidden="true">{item.icon}</span>
            <span className="workspace-mode-nav__copy">
              <strong className="workspace-mode-nav__label">{item.label}</strong>
              <span className="workspace-mode-nav__description">{item.description}</span>
            </span>
          </Link>
        ))}
      </nav>

      <WorkspaceSharedContextControls
        {...sharedContextControlsProps}
        surface="shell"
        className="workspace-shared-context-controls--header"
      />
    </section>
  );
}

export function WorkspaceMobileContextSection({
  locale,
  activePublicSection,
  activeWorkspaceTab,
}: {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
}) {
  const t = useT();
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
  });
  const sharedContextControlsProps = buildSharedContextControlsProps({ model, t, locale });

  return (
    <div className="workspace-mobile-context-section">
      <WorkspaceSharedContextControls
        {...sharedContextControlsProps}
        surface="shell"
        mobileBehavior="inline"
        className="workspace-mobile-context-section__controls"
      />
    </div>
  );
}

export function WorkspaceContextAside({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  children,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  children: React.ReactNode;
}) {
  const model = useWorkspaceSharedContext({
    t,
    locale,
    activePublicSection,
    activeWorkspaceTab,
  });
  const statsCopy = React.useMemo(() => getWorkspaceStatisticsCopy(locale), [locale]);
  const focusCopy = React.useMemo(() => getWorkspaceFocusRecommendationCopy(locale), [locale]);
  const focusActionLabel = React.useMemo(
    () => fillWorkspaceModeTemplate(model.copy.rail.openModeTemplate, model.title),
    [model.copy.rail.openModeTemplate, model.title],
  );
  const [isFocusOpen, setIsFocusOpen] = React.useState(false);
  const [isAnalyzingFocus, setIsAnalyzingFocus] = React.useState(false);
  const cityValue = React.useMemo(() => getWorkspaceChipValue(model.chips, 'city'), [model.chips]);
  const categoryValue = React.useMemo(() => getWorkspaceChipValue(model.chips, 'category'), [model.chips]);
  const serviceValue = React.useMemo(() => getWorkspaceChipValue(model.chips, 'service'), [model.chips]);
  const rangeValue = React.useMemo(() => getWorkspaceChipValue(model.chips, 'range'), [model.chips]);
  const selectedService = serviceValue !== model.copy.contextFallbacks.service ? serviceValue : '';
  const selectedCategory = categoryValue !== model.copy.contextFallbacks.category ? categoryValue : '';
  const selectedCity = cityValue !== model.copy.contextFallbacks.city ? cityValue : '';
  const focusContextLabel = React.useMemo(() => {
    const primaryScope = selectedService || selectedCategory;
    return joinWorkspaceContext([primaryScope, selectedCity]) || focusCopy.defaultContextLabel;
  }, [focusCopy.defaultContextLabel, selectedCategory, selectedCity, selectedService]);
  const focusScopeMetric = React.useMemo(
    () => joinWorkspaceContext([selectedService || selectedCategory, selectedCity, rangeValue]) || model.scope,
    [model.scope, rangeValue, selectedCategory, selectedCity, selectedService],
  );
  const focusModeCopy = focusCopy.modes[model.activeMode];
  const focusHeroTitle = React.useMemo(
    () => fillWorkspaceModeTemplate(focusModeCopy.heroTitleTemplate, model.title),
    [focusModeCopy.heroTitleTemplate, model.title],
  );
  const openFocusRecommendation = React.useCallback(() => {
    setIsAnalyzingFocus(true);
    setIsFocusOpen(true);
  }, []);
  const closeFocusRecommendation = React.useCallback(() => {
    setIsFocusOpen(false);
    setIsAnalyzingFocus(false);
  }, []);
  const focusScopeText = React.useMemo(() => {
    if (locale === 'de') {
      return `Der aktuelle Workspace-Kontext bleibt über alle Modi hinweg aktiv: ${focusScopeMetric}. ${model.scope}.`;
    }
    return `The current workspace context stays active across modes: ${focusScopeMetric}. ${model.scope}.`;
  }, [focusScopeMetric, locale, model.scope]);
  const focusActionText = React.useMemo(
    () => `${focusModeCopy.actionText} ${model.railDescription}`,
    [focusModeCopy.actionText, model.railDescription],
  );

  React.useEffect(() => {
    if (!isFocusOpen || !isAnalyzingFocus) return;
    const timeoutId = window.setTimeout(() => {
      setIsAnalyzingFocus(false);
    }, 1400);
    return () => window.clearTimeout(timeoutId);
  }, [isAnalyzingFocus, isFocusOpen]);

  return (
    <div className="workspace-context-rail">
      <section className="panel workspace-context-rail__panel">
        <span className="workspace-environment__eyebrow">{model.copy.rail.nextStepTitle}</span>
        <WorkspaceDecisionActionCard
          className="workspace-context-rail__decision"
          layout="stacked"
          avatarLabel={statsCopy.insightsAssistantAvatarLabel}
          name={statsCopy.insightsAssistantName}
          role={statsCopy.priceRecommendationLabel}
          description={model.railDescription}
          actionLabel={focusActionLabel}
          onActionClick={openFocusRecommendation}
          actionAriaHasPopup
        />
        <WorkspaceDecisionRecommendationModal
          generatedLabel={statsCopy.insightsGeneratedLabel}
          assistantAvatarLabel={statsCopy.insightsAssistantAvatarLabel}
          assistantName={statsCopy.insightsAssistantName}
          assistantRole={statsCopy.priceRecommendationLabel}
          loadingLabel={focusCopy.loadingLabel}
          loadingBody={focusCopy.loadingBody}
          title={focusCopy.title}
          titleContext={focusContextLabel}
          summaryLabel={model.title}
          closeLabel={model.controls.closeLabel}
          isOpen={isFocusOpen}
          isLoading={isAnalyzingFocus}
          onClose={closeFocusRecommendation}
        >
          <article className="workspace-decision-modal__content-stack form-stack">
            <WorkspaceDecisionRecommendationSection
              badgeLabel={focusCopy.recommendationLabel}
              badgeTone="info"
              tone="performance"
              metric={model.title}
              title={focusHeroTitle}
              text={focusModeCopy.heroText}
              featured
              className="workspace-decision-modal__hero"
            />
            <WorkspaceDecisionRecommendationSection
              badgeLabel={focusCopy.scopeLabel}
              badgeTone="info"
              tone="performance"
              metric={focusScopeMetric}
              text={focusScopeText}
              className="workspace-decision-modal__section"
            />
            <WorkspaceDecisionRecommendationSection
              badgeLabel={focusCopy.actionLabel}
              badgeTone="success"
              tone="opportunity"
              text={focusActionText}
              className="workspace-decision-modal__section"
            />
            <WorkspaceDecisionRecommendationSection
              badgeLabel={focusCopy.switchLabel}
              badgeTone="warning"
              tone="promotion"
              text={focusModeCopy.switchText}
              className="workspace-decision-modal__section"
            />
          </article>
        </WorkspaceDecisionRecommendationModal>
      </section>

      {children}
    </div>
  );
}

export type { WorkspaceModeKey };
