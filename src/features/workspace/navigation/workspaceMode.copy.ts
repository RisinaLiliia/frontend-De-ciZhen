'use client';

import type { WorkspaceRequestsScope } from '@/features/workspace/state';
import type { WorkspaceModeKey } from '@/features/workspace/navigation/resolveActiveWorkspaceMode';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

const SHARED_QUERY_KEYS = ['city', 'category', 'service', 'period', 'range'] as const;

export type WorkspaceModeCopy = {
  sharedContextLabel: string;
  clearContextLabel: string;
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

export type WorkspaceFocusRecommendationCopy = {
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

export function getWorkspaceFocusRecommendationCopy(locale: Locale): WorkspaceFocusRecommendationCopy {
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
        profile: {
          heroTitleTemplate: 'Prioritize {mode}',
          heroText: 'Profile is currently the strongest next step when activation readiness, profile quality, or setup is limiting performance.',
          actionText: 'Use this mode to improve readiness, tighten profile quality, and complete operational setup without losing the shared market frame.',
          switchText: 'Switch to Analysis when you need clearer market direction first, and to Requests once the setup is strong enough for direct execution.',
        },
        chat: {
          heroTitleTemplate: 'Prioritize {mode}',
          heroText: 'Chat is currently the strongest next step when open conversations, reply speed, and follow-through need direct attention.',
          actionText: 'Use the current workspace context to answer active conversations faster and move requests into the next concrete step.',
          switchText: 'Switch to Requests when execution details are ready, and to Analysis when pricing or timing still needs validation before you reply.',
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
        profile: {
          heroTitleTemplate: '{mode} priorisieren',
          heroText: 'Profil ist aktuell der sinnvollste nächste Schritt, wenn Einsatzbereitschaft, Profilqualität oder Setup die Leistung begrenzen.',
          actionText: 'Nutze diesen Modus, um Einsatzbereitschaft, Profilqualität und operative Basis zu stärken, ohne den gemeinsamen Marktkontext zu verlieren.',
          switchText: 'Wechsle in Analyse, wenn du zuerst eine klarere Marktrichtung brauchst, und in Aufträge, sobald das Setup stark genug für direkte Ausführung ist.',
        },
      chat: {
        heroTitleTemplate: '{mode} priorisieren',
        heroText: 'Nachrichten ist aktuell der sinnvollste nächste Schritt, wenn offene Gespräche, Antwortgeschwindigkeit und nächste Zusagen direkte Aufmerksamkeit brauchen.',
        actionText: 'Nutze den aktuellen Workspace-Kontext, um aktive Gespräche schneller zu beantworten und Anfragen in den nächsten konkreten Schritt zu führen.',
        switchText: 'Wechsle in Aufträge, wenn die Ausführung bereit ist, und in Analyse, wenn Preis oder Timing vor der Antwort noch geklärt werden müssen.',
      },
    },
  };
}

export function getWorkspaceModeCopy(locale: Locale): WorkspaceModeCopy {
  if (locale === 'en') {
    return {
      sharedContextLabel: 'Shared context',
      clearContextLabel: 'Reset context',
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
        profile: {
          label: 'Profile',
          title: 'Profile',
          description: 'Profile, setup, and activation tools remain in the same operating shell.',
          railDescription: 'Use this mode to improve profile readiness without losing the current market frame.',
          scope: 'Profile mode for setup and activation',
        },
        chat: {
          label: 'Messages',
          title: 'Messages',
          description: 'Keep conversations, request context, and follow-up actions inside the same workspace shell.',
          railDescription: 'Messages now stay tied to the same shared context and execution flow.',
          scope: 'Conversation mode for active threads and follow-up',
        },
      },
    };
  }

  return {
    sharedContextLabel: 'Gemeinsamer Kontext',
    clearContextLabel: 'Kontext zurücksetzen',
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
      profile: {
        label: 'Profil',
        title: 'Profil',
        description: 'Profil, Setup und Aktivierungen bleiben in derselben Arbeitsumgebung.',
        railDescription: 'Nutze diesen Modus, um Profil und Einsatzbereitschaft zu verbessern, ohne den aktuellen Markt-Kontext zu verlieren.',
        scope: 'Profilmodus für Setup und Aktivierung',
      },
      chat: {
        label: 'Nachrichten',
        title: 'Nachrichten',
        description: 'Halte Gespräche, Anfrage-Kontext und Follow-ups in derselben Workspace-Shell.',
        railDescription: 'Nachrichten bleiben jetzt mit demselben gemeinsamen Kontext und Ausführungsfluss verbunden.',
        scope: 'Gesprächsmodus für aktive Threads und Follow-ups',
      },
    },
  };
}

export function resolveRangeLabel(locale: Locale, value: string | null, fallback: string) {
  if (value === '24h') return '24h';
  if (value === '7d') return translate(I18N_KEYS.workspace.range7dLabel, locale);
  if (value === '30d') return translate(I18N_KEYS.workspace.range30dLabel, locale);
  if (value === '90d') return translate(I18N_KEYS.workspace.range90dLabel, locale);
  return fallback;
}

export function getRequestsScopeTitle(locale: Locale, scope: WorkspaceRequestsScope) {
  if (scope === 'my') {
    return {
      title: translate(I18N_KEYS.workspace.myScopeTitle, locale),
      description: translate(I18N_KEYS.workspace.myScopeDescription, locale),
      railDescription: translate(I18N_KEYS.workspace.myScopeRailDescription, locale),
      scope: translate(I18N_KEYS.workspace.myScopeContext, locale),
    };
  }

  return {
    title: translate(I18N_KEYS.workspace.marketScopeTitle, locale),
    description: translate(I18N_KEYS.workspace.marketScopeDescription, locale),
    railDescription: translate(I18N_KEYS.workspace.marketScopeRailDescription, locale),
    scope: translate(I18N_KEYS.workspace.marketScopeContext, locale),
  };
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

export function buildModeHref({
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

  if (mode === 'chat') {
    next.set('section', 'chat');
    return toWorkspaceHref(next);
  }

  next.set('section', 'profile');
  return toWorkspaceHref(next);
}
