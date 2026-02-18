import type { WorkspaceStatusFilter, WorkspaceTab } from '@/features/requests/page/workspace';

type HintContent = {
  text: string;
  ctaLabel: string;
  ctaHref: string;
};

export const WORKSPACE_TAB_TITLES: Partial<Record<WorkspaceTab, string>> = {
  'my-requests': 'Meine Auftraege',
  'my-offers': 'Meine Angebote',
  'completed-jobs': 'Abgeschlossene Jobs',
  reviews: 'Bewertungen',
};

export const WORKSPACE_SECTION_SUBTITLE = 'Workspace-Ansicht fuer deine eigenen Daten und Aktionen.';

export const WORKSPACE_STATUS_FILTERS: Array<{ key: WorkspaceStatusFilter; label: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'open', label: 'Offen' },
  { key: 'in_progress', label: 'In Arbeit' },
  { key: 'completed', label: 'Abgeschlossen' },
];

export const WORKSPACE_PRIMARY_ACTION_BY_TAB: Partial<Record<WorkspaceTab, { href: string; label: string }>> = {
  'my-requests': { label: 'Neue Anfrage erstellen', href: '/request/create' },
  'my-offers': { label: 'Neue Auftraege finden', href: '/orders?tab=new-orders' },
  'completed-jobs': { label: 'Aktive Auftraege', href: '/orders?tab=my-offers&status=in_progress' },
  favorites: { label: 'Neue Favoriten', href: '/orders?tab=new-orders' },
  reviews: { label: 'Meine Auftraege', href: '/orders?tab=my-offers' },
};

export function getProviderHint(profileCompleteness: number, recentOffers7d: number, acceptanceRate: number): HintContent {
  if (profileCompleteness < 80) {
    return {
      text: `Profil zu ${profileCompleteness}% ausgefuellt. Vervollstaendige es fuer bessere Annahmequoten.`,
      ctaLabel: 'Profil vervollstaendigen',
      ctaHref: '/profile/workspace',
    };
  }
  if (recentOffers7d === 0) {
    return {
      text: 'Seit 7 Tagen keine neuen Angebote. Pruefe Services, Standort und Verfuegbarkeit.',
      ctaLabel: 'Auftraege ansehen',
      ctaHref: '/orders?tab=new-orders',
    };
  }
  if (acceptanceRate < 25) {
    return {
      text: 'Deine Annahmequote ist niedrig. Optimiere Preis und Nachricht fuer mehr Zusagen.',
      ctaLabel: 'Angebote verbessern',
      ctaHref: '/orders?tab=new-orders',
    };
  }
  return {
    text: 'Starke Performance. Halte Profil und Preise aktuell fuer stabile Auslastung.',
    ctaLabel: 'Meine Vertraege',
    ctaHref: '/orders?tab=completed-jobs',
  };
}

export function getClientHint(myRequestsCount: number, myOpenRequestsCount: number): HintContent {
  if (myRequestsCount === 0) {
    return {
      text: 'Noch keine Anfrage erstellt. Starte mit deinem ersten Auftrag.',
      ctaLabel: 'Anfrage erstellen',
      ctaHref: '/request/create',
    };
  }
  if (myOpenRequestsCount > 0) {
    return {
      text: 'Du hast aktive Anfragen. Vergleiche Angebote und entscheide schneller.',
      ctaLabel: 'Meine Anfragen',
      ctaHref: '/orders?tab=my-requests',
    };
  }
  return {
    text: 'Deine Anfragen laufen stabil. Lege neue Aufgaben an, wenn du weitere Hilfe brauchst.',
    ctaLabel: 'Neue Anfrage',
    ctaHref: '/request/create',
  };
}
