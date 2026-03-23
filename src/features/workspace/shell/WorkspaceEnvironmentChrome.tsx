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
import { useWorkspacePublicFilters } from '@/features/workspace/public/useWorkspacePublicFilters';
import { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
import { resolveActiveWorkspaceMode, type WorkspaceModeKey } from '@/features/workspace/shell/workspaceModes';
import { RANGE_OPTIONS, rangeLabelShort } from '@/features/workspace/requests/stats/components/statisticsContext.constants';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { isWorkspaceTab, type WorkspaceTab } from '@/features/workspace/requests';

type Translator = (key: I18nKey) => string;

type WorkspaceModeItem = {
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
    contextTitle: string;
    contextDescription: string;
    nextStepTitle: string;
    scopeLabel: string;
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

const SHARED_QUERY_KEYS = ['cityId', 'categoryKey', 'subcategoryKey', 'range'] as const;
const CLEAR_QUERY_KEYS = ['cityId', 'categoryKey', 'subcategoryKey', 'range', 'sort', 'page'] as const;

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
        contextTitle: 'Context in effect',
        contextDescription: 'These filters stay visible while you move through workspace modes.',
        nextStepTitle: 'Current focus',
        scopeLabel: 'Shared scope',
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
      contextTitle: 'Aktiver Kontext',
      contextDescription: 'Diese Filter bleiben sichtbar, während du zwischen den Workspace-Modi wechselst.',
      nextStepTitle: 'Aktueller Fokus',
      scopeLabel: 'Gemeinsamer Scope',
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

function useWorkspaceSharedContext({
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

  return React.useMemo(
    () => ({
      activeMode,
      modeItems,
      title: activeModeCopy.title,
      description: activeModeCopy.description,
      railDescription: activeModeCopy.railDescription,
      scope: activeModeCopy.scope,
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

  const cityChip = model.chips.find((chip) => chip.key === 'city');
  const categoryChip = model.chips.find((chip) => chip.key === 'category');
  const serviceChip = model.chips.find((chip) => chip.key === 'service');
  const rangeChip = model.chips.find((chip) => chip.key === 'range');
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
        title={model.copy.sharedContextLabel}
        resetLabel={t(I18N_KEYS.requestsPage.clearFilters)}
        closeLabel={model.controls.closeLabel}
        city={{
          value: model.controls.cityId,
          options: model.controls.cityOptions,
          ariaLabel: t(I18N_KEYS.requestsPage.cityLabel),
          onChange: model.controls.onCityChange,
          summaryLabel: cityChip?.value ?? model.copy.contextFallbacks.city,
        }}
        category={{
          value: model.controls.categoryKey,
          options: model.controls.categoryOptions,
          ariaLabel: t(I18N_KEYS.requestsPage.categoryLabel),
          onChange: model.controls.onCategoryChange,
          summaryLabel: categoryChip?.value ?? model.copy.contextFallbacks.category,
        }}
        service={{
          value: model.controls.subcategoryKey,
          options: model.controls.serviceOptions,
          ariaLabel: t(I18N_KEYS.requestsPage.serviceLabel),
          onChange: model.controls.onSubcategoryChange,
          summaryLabel: serviceChip?.value ?? model.copy.contextFallbacks.service,
          disabled: model.controls.categoryKey === 'all',
        }}
        range={{
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
        }}
        sort={{
          value: model.controls.sortBy,
          options: model.controls.sortOptions,
          ariaLabel: t(I18N_KEYS.requestsPage.sortLabel),
          onChange: model.controls.onSortChange,
          summaryLabel: model.controls.sortOptions.find((item) => item.value === model.controls.sortBy)?.label ?? '',
        }}
        onReset={model.controls.onReset}
        surface="shell"
      />
    </section>
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

  return (
    <div className="workspace-context-rail">
      <section className="panel workspace-context-rail__panel">
        <div className="workspace-context-rail__panel-head">
          <span className="workspace-context-rail__eyebrow">{model.copy.rail.contextTitle}</span>
          <strong className="workspace-context-rail__title">{model.scope}</strong>
        </div>
        <p className="workspace-context-rail__description">{model.copy.rail.contextDescription}</p>
        <div className="workspace-context-rail__chip-list">
          {model.chips.map((chip) => (
            <div key={chip.key} className="workspace-context-rail__chip">
              <span className="workspace-context-rail__chip-icon" aria-hidden="true">{chip.icon}</span>
              <span className="workspace-context-rail__chip-copy">
                <span className="workspace-context-rail__chip-label">{chip.label}</span>
                <strong className="workspace-context-rail__chip-value">{chip.value}</strong>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel workspace-context-rail__panel">
        <div className="workspace-context-rail__panel-head">
          <span className="workspace-context-rail__eyebrow">{model.copy.rail.nextStepTitle}</span>
          <strong className="workspace-context-rail__title">{model.title}</strong>
        </div>
        <p className="workspace-context-rail__description">{model.railDescription}</p>
        <div className="workspace-context-rail__focus">
          <span className="workspace-context-rail__focus-label">{model.copy.rail.scopeLabel}</span>
          <strong className="workspace-context-rail__focus-value">{model.scope}</strong>
        </div>
      </section>

      {children}
    </div>
  );
}

export type { WorkspaceModeKey };
