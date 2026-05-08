'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconFilter,
  IconPin,
  IconSettings,
  IconUser,
} from '@/components/ui/icons/icons';
import { RequestsViewToggle } from '@/components/requests/RequestsViewToggle';
import type { FilterOption } from '@/components/requests/requestsFilters.types';
import {
  buildWorkspaceRequestsScopeHref,
  isWorkspaceTab,
  resolveWorkspaceViewerMode,
  resolveWorkspaceRequestsRole,
  resolveWorkspaceRequestsScope,
  resolveWorkspaceRequestsState,
  type WorkspaceRequestsScope,
  type WorkspaceTab,
} from '@/features/workspace/requests';
import { RANGE_OPTIONS, rangeLabelShort } from '@/features/workspace/requests/stats/components/statisticsContext.constants';
import { getWorkspaceStatisticsCopy } from '@/features/workspace/requests/stats/workspaceStatistics.copy';
import { useWorkspacePublicFilters } from '@/features/workspace/public/useWorkspacePublicFilters';
import { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
import {
  buildModeHref,
  getRequestsScopeTitle,
  getWorkspaceModeCopy,
  resolveRangeLabel,
  type WorkspaceModeCopy,
} from '@/features/workspace/shell/workspaceEnvironment.copy';
import { resolveActiveWorkspaceMode, type WorkspaceModeKey } from '@/features/workspace/shell/workspaceModes';
import {
  resolveWorkspaceViewerModeToggleItems,
  shouldShowWorkspaceProfileViewerModeControl,
} from '@/features/workspace/shell/workspaceSharedContext.model';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import {
  resolveRequestsListDensityForPageSize,
  resolveRequestsPageSizeForDensity,
  type RequestsListDensity,
} from '@/lib/requests/pagination';

type Translator = (key: I18nKey) => string;

const CLEAR_QUERY_KEYS = ['city', 'cityId', 'category', 'categoryKey', 'service', 'subcategoryKey', 'serviceKey', 'period', 'range', 'sort', 'page', 'role', 'state'] as const;

export type WorkspaceModeItem = {
  key: WorkspaceModeKey;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
};

export type WorkspaceSharedContext = {
  activeMode: WorkspaceModeKey;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  requestsScope: WorkspaceRequestsScope;
  scopeSwitch: Array<{
    key: WorkspaceRequestsScope;
    label: string;
    href: string;
    isActive: boolean;
  }> | null;
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
  requestsListDensity: RequestsListDensity | null;
  onRequestsListDensityChange: ((value: RequestsListDensity) => void) | null;
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
    role: string;
    state: string;
    viewerMode: 'provider' | 'customer';
    onCityChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSubcategoryChange: (value: string) => void;
    onSortChange: (value: string) => void;
    onRangeChange: (next: WorkspaceStatisticsRange) => void;
    onRoleChange: (value: string) => void;
    onStateChange: (value: string) => void;
    onViewerModeChange: (value: 'provider' | 'customer') => void;
    onReset: () => void;
    closeLabel: string;
  };
};

function resolveWorkspaceSharedRange(value: string | null): WorkspaceStatisticsRange {
  if (value === '24h' || value === '7d' || value === '30d' || value === '90d') return value;
  return '30d';
}

function buildPrivateSortOptions(locale: Locale): FilterOption[] {
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

export function fillWorkspaceModeTemplate(template: string, mode: string) {
  return template.replace('{mode}', mode);
}

export function getWorkspaceChipValue(
  chips: WorkspaceSharedContext['chips'],
  key: WorkspaceSharedContext['chips'][number]['key'],
) {
  return chips.find((chip) => chip.key === key)?.value ?? '';
}

export function joinWorkspaceContext(parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join(' · ');
}

export function buildSharedContextControlsProps({
  model,
  t,
  locale,
}: {
  model: WorkspaceSharedContext;
  t: Translator;
  locale: Locale;
}): React.ComponentProps<typeof WorkspaceSharedContextControls> {
  const cityChip = model.chips.find((chip) => chip.key === 'city');
  const categoryChip = model.chips.find((chip) => chip.key === 'category');
  const serviceChip = model.chips.find((chip) => chip.key === 'service');
  const rangeChip = model.chips.find((chip) => chip.key === 'range');
  const statsCopy = getWorkspaceStatisticsCopy(locale);
  const requestsScopeControl = model.scopeSwitch ? (
    <nav className="requests-scope-switch" aria-label={locale === 'de' ? 'Auftragsmodus' : 'Request scope'}>
      {model.scopeSwitch.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          prefetch={false}
          className={`requests-scope-switch__item${item.isActive ? ' is-active' : ''}`.trim()}
          aria-current={item.isActive ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  ) : null;
  const requestsViewToggle = model.requestsListDensity && model.onRequestsListDensityChange ? (
    <div className="workspace-shared-context-controls__view-toggle">
      <RequestsViewToggle
        t={t}
        listDensity={model.requestsListDensity}
        onChange={model.onRequestsListDensityChange}
      />
    </div>
  ) : null;
  const renderViewerModeInlineControl = (
    items: ReturnType<typeof resolveWorkspaceViewerModeToggleItems>,
  ) => (
    <div className="howitworks-tabs" role="group" aria-label={statsCopy.viewerModeLabel}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={item.isActive}
          className={`howitworks-tab ${item.isActive ? 'is-active' : ''}`.trim()}
          onClick={() => model.controls.onViewerModeChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
  const viewerModeInlineControl = renderViewerModeInlineControl(
    resolveWorkspaceViewerModeToggleItems({
      viewerMode: model.controls.viewerMode,
      providerLabel: statsCopy.viewerModeProviderLabel,
      customerLabel: statsCopy.viewerModeCustomerLabel,
      invertLabels: shouldShowWorkspaceProfileViewerModeControl({
        activeWorkspaceTab: model.activeWorkspaceTab,
        activePublicSection: model.activePublicSection,
      }),
    }),
  );
  const shouldShowProfileViewerModeControl = shouldShowWorkspaceProfileViewerModeControl({
    activeWorkspaceTab: model.activeWorkspaceTab,
    activePublicSection: model.activePublicSection,
  });
  const myWorkInlineControl = shouldShowProfileViewerModeControl ? viewerModeInlineControl : model.requestsScope === 'my' ? (
    <div className="workspace-shared-context-controls__combined-row">
      {requestsScopeControl}
      <div className="howitworks-tabs" role="group" aria-label={statsCopy.viewerModeLabel}>
        <button
          type="button"
          aria-pressed={model.controls.role === 'customer'}
          className={`howitworks-tab ${model.controls.role === 'customer' ? 'is-active' : ''}`.trim()}
          onClick={() => model.controls.onRoleChange('customer')}
        >
          {statsCopy.viewerModeCustomerLabel}
        </button>
        <button
          type="button"
          aria-pressed={model.controls.role === 'provider'}
          className={`howitworks-tab ${model.controls.role === 'provider' ? 'is-active' : ''}`.trim()}
          onClick={() => model.controls.onRoleChange('provider')}
        >
          {statsCopy.viewerModeProviderLabel}
        </button>
      </div>

      <div
        className="workspace-shared-context-controls__slash-tabs"
        role="group"
        aria-label={locale === 'de' ? 'Status' : 'State'}
      >
        {(locale === 'de'
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
          ]).map((item) => {
          const isActive = model.controls.state === item.key;

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isActive}
              className={`workspace-shared-context-controls__slash-tab ${isActive ? 'is-active' : ''}`.trim()}
              onClick={() => model.controls.onStateChange(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {requestsViewToggle}
    </div>
  ) : (requestsScopeControl || requestsViewToggle) ? (
    <div className="workspace-shared-context-controls__combined-row">
      {requestsScopeControl}
      {requestsViewToggle}
    </div>
  ) : model.activePublicSection === 'stats' ? (
    viewerModeInlineControl
  ) : null;
  const extraFilters = model.requestsScope === 'my' ? undefined : undefined;

  return {
    title: model.copy.sharedContextLabel,
    locale,
    resetLabel: t(I18N_KEYS.requestsPage.clearFilters),
    closeLabel: model.controls.closeLabel,
    city: {
      value: model.controls.cityId,
      allOption: model.controls.cityOptions.find((item) => item.value === 'all'),
      ariaLabel: t(I18N_KEYS.requestsPage.cityLabel),
      onChange: model.controls.onCityChange,
      summaryLabel: cityChip?.value ?? model.copy.contextFallbacks.city,
      placeholder: cityChip?.value ?? model.copy.contextFallbacks.city,
      searchPlaceholder: t(I18N_KEYS.home.cityPlaceholder),
      loadingLabel: t(I18N_KEYS.common.refreshing),
      emptyLabel: t(I18N_KEYS.common.noResults),
      errorLabel: t(I18N_KEYS.common.loadErrorShort),
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
    extraFilters,
    inlineControl: myWorkInlineControl,
    onReset: model.controls.onReset,
  };
}

export function useWorkspaceSharedContext({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
}): WorkspaceSharedContext {
  const auth = useAuthSnapshot();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = React.useMemo(() => getWorkspaceModeCopy(locale), [locale]);
  const sectionParam = searchParams.get('section');
  const hasExplicitWorkspaceTab = isWorkspaceTab(searchParams.get('tab'));
  const requestsScope = resolveWorkspaceRequestsScope(searchParams.get('scope'), auth.status === 'authenticated');
  const requestRole = resolveWorkspaceRequestsRole(searchParams.get('role'));
  const requestState = resolveWorkspaceRequestsState(searchParams.get('state'));
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));
  const range = searchParams.get('period') ?? searchParams.get('range');
  const [, startTransition] = React.useTransition();
  const {
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    limit,
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
  const privateSortOptions = React.useMemo(() => buildPrivateSortOptions(locale), [locale]);

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
  const effectiveRequestRole = requestRole === 'all'
    ? (preferredRequestsRole ?? 'all')
    : requestRole;
  const requestsListDensity = React.useMemo(
    () => (activeMode === 'requests' ? resolveRequestsListDensityForPageSize(limit) : null),
    [activeMode, limit],
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
      params.set('period', next);
      params.set('range', next);
      params.delete('statsCityPage');
    });
  }, [replaceSharedContext]);

  const onRoleChange = React.useCallback((next: string) => {
    replaceSharedContext((params) => {
      params.set('role', next);
    });
  }, [replaceSharedContext]);

  const onStateChange = React.useCallback((next: string) => {
    replaceSharedContext((params) => {
      params.set('state', next);
    });
  }, [replaceSharedContext]);

  const onViewerModeChange = React.useCallback((next: 'provider' | 'customer') => {
    replaceSharedContext((params) => {
      params.set('viewerMode', next);
    });
  }, [replaceSharedContext]);

  const onPrivateSortChange = React.useCallback((next: string) => {
    replaceSharedContext((params) => {
      params.set('sort', next);
      params.delete('page');
    });
  }, [replaceSharedContext]);
  const onRequestsListDensityChange = React.useCallback((next: RequestsListDensity) => {
    replaceSharedContext((params) => {
      params.set('limit', String(resolveRequestsPageSizeForDensity(next)));
      params.set('page', '1');
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

  const activeModeCopy = activeMode === 'requests'
    ? {
      ...copy.modes.requests,
      ...getRequestsScopeTitle(locale, requestsScope),
    }
    : copy.modes[activeMode];
  const activeModeHref = modeItems.find((item) => item.isActive)?.href ?? '/workspace';
  const scopeSwitch = React.useMemo(
    () => (activeMode === 'requests'
      ? [
        {
          key: 'market' as const,
          label: locale === 'de' ? 'Markt' : 'Market',
          href: buildWorkspaceRequestsScopeHref({ currentSearch: rawSearch, scope: 'market' }),
          isActive: requestsScope === 'market',
        },
        {
          key: 'my' as const,
          label: locale === 'de' ? 'Meine Arbeit' : 'My work',
          href: auth.status === 'authenticated'
            ? buildWorkspaceRequestsScopeHref({ currentSearch: rawSearch, scope: 'my' })
            : `/auth/login?next=${encodeURIComponent(buildWorkspaceRequestsScopeHref({ currentSearch: rawSearch, scope: 'my' }))}`,
          isActive: requestsScope === 'my',
        },
      ]
      : null),
    [activeMode, auth.status, locale, rawSearch, requestsScope],
  );
  const effectiveSortBy = requestsScope === 'my'
    ? (searchParams.get('sort') ?? 'activity')
    : sortBy;
  const effectiveSortOptions = requestsScope === 'my' ? privateSortOptions : sortOptions;

  return React.useMemo(
    () => ({
      activeMode,
      activePublicSection,
      activeWorkspaceTab,
      requestsScope,
      scopeSwitch,
      modeItems,
      title: activeModeCopy.title,
      description: activeModeCopy.description,
      railDescription: activeModeCopy.railDescription,
      scope: activeModeCopy.scope,
      activeModeHref,
      chips,
      requestsListDensity,
      onRequestsListDensityChange: activeMode === 'requests' ? onRequestsListDensityChange : null,
      copy,
      controls: {
        cityOptions,
        categoryOptions,
        serviceOptions,
        sortOptions: effectiveSortOptions,
        cityId,
        categoryKey,
        subcategoryKey,
        sortBy: effectiveSortBy,
        range: currentRange,
        role: effectiveRequestRole,
        state: requestState,
        viewerMode,
        onCityChange: onCityChangeTracked,
        onCategoryChange: onCategoryChangeTracked,
        onSubcategoryChange: onSubcategoryChangeTracked,
        onSortChange: requestsScope === 'my' ? onPrivateSortChange : onSortChangeTracked,
        onRangeChange,
        onRoleChange,
        onStateChange,
        onViewerModeChange,
        onReset,
        closeLabel: t(I18N_KEYS.auth.closeDialog),
      },
    }),
    [
      activeMode,
      activePublicSection,
      activeWorkspaceTab,
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
      effectiveRequestRole,
      effectiveSortBy,
      effectiveSortOptions,
      modeItems,
      onCategoryChangeTracked,
      onCityChangeTracked,
      onRequestsListDensityChange,
      onPrivateSortChange,
      onRoleChange,
      onSortChangeTracked,
      onStateChange,
      onSubcategoryChangeTracked,
      onViewerModeChange,
      onRangeChange,
      onReset,
      requestState,
      requestsListDensity,
      requestsScope,
      serviceOptions,
      scopeSwitch,
      subcategoryKey,
      t,
      viewerMode,
    ],
  );
}
