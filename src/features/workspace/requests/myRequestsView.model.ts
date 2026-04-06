'use client';

import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { pickI18n } from '@/lib/i18n/helpers';
import type { Locale } from '@/lib/i18n/t';
import type {
  WorkspaceRequestsPeriod,
  WorkspaceRequestsRole,
  WorkspaceRequestsState,
} from '@/features/workspace/requests/workspaceRequestsScope.model';

type CityLookupItem = {
  id: string;
  i18n: Record<string, string>;
  name?: string;
};

type CategoryLookupItem = {
  key: string;
  i18n: Record<string, string>;
};

type ServiceLookupItem = {
  key: string;
  categoryKey: string;
  i18n: Record<string, string>;
};

type ViewActivityTone = 'info' | 'warning' | 'success' | 'neutral';
type ViewUrgency = 'low' | 'medium' | 'high' | null;

export type MyRequestsViewCard = {
  id: string;
  role: Exclude<WorkspaceRequestsRole, 'all'>;
  roleLabel: string;
  title: string;
  category: string;
  state: Exclude<WorkspaceRequestsState, 'all'>;
  stateLabel: string;
  urgency: ViewUrgency;
  city: string | null;
  createdAt: string | null;
  nextEventAt: string | null;
  budgetLabel: string | null;
  progressLabel: string;
  activity: {
    label: string;
    tone: ViewActivityTone;
  } | null;
  progressSteps: Array<{
    key: 'request' | 'offers' | 'selection' | 'contract' | 'done';
    label: string;
    status: 'done' | 'current' | 'upcoming';
  }>;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryActions: Array<{
    key: string;
    label: string;
    href: string;
  }>;
  sortActivityAt: number;
  sortCreatedAt: number;
  sortBudget: number;
  sortDeadlineAt: number | null;
};

export type MyRequestsSummaryItem = {
  key: WorkspaceRequestsState;
  label: string;
  value: number;
  isHighlighted: boolean;
};

export type MyRequestsTabItem = {
  key: WorkspaceRequestsState;
  label: string;
  count: number;
};

export type MyRequestsRailModel = {
  focus: {
    title: string;
    description: string;
    ctaLabel: string;
    href: string;
  } | null;
  recommendation: {
    title: string;
    description: string;
  } | null;
  contextItems: Array<{
    title: string;
    description: string;
    meta?: Array<{ label: string; value: string }>;
  }>;
  nextSteps: Array<{
    id: string;
    title: string;
  }>;
};

export type MyRequestsViewModel = {
  activeRole: WorkspaceRequestsRole;
  activeState: WorkspaceRequestsState;
  summary: MyRequestsSummaryItem[];
  tabs: MyRequestsTabItem[];
  cards: MyRequestsViewCard[];
  rail: MyRequestsRailModel;
  emptyMode: 'none' | 'empty' | 'filtered';
};

type BuildMyRequestsViewModelArgs = {
  locale: Locale;
  role: WorkspaceRequestsRole;
  state: WorkspaceRequestsState;
  period: WorkspaceRequestsPeriod;
  sort: string | null;
  myRequests: RequestResponseDto[];
  myOffers: OfferDto[];
  myClientOffers: OfferDto[];
  myOfferRequestsById: Map<string, RequestResponseDto>;
  myProviderContracts: ContractDto[];
  myClientContracts: ContractDto[];
  cityById: Map<string, CityLookupItem>;
  categoryByKey: Map<string, CategoryLookupItem>;
  serviceByKey: Map<string, ServiceLookupItem>;
  formatDate: (value: string | number | Date) => string;
  formatPrice: (value: number) => string;
  now?: number;
};

const STATE_WEIGHT: Record<Exclude<WorkspaceRequestsState, 'all'>, number> = {
  clarifying: 4,
  active: 3,
  open: 2,
  completed: 1,
};

const PERIOD_MS: Record<WorkspaceRequestsPeriod, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

function parseDateToMs(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pickLatestByRequest<T extends { requestId: string; updatedAt?: string | null; createdAt?: string | null }>(
  items: T[],
) {
  return items.reduce((map, item) => {
    const current = map.get(item.requestId);
    const currentTs = parseDateToMs(current?.updatedAt ?? current?.createdAt ?? null) ?? 0;
    const nextTs = parseDateToMs(item.updatedAt ?? item.createdAt ?? null) ?? 0;
    if (!current || nextTs >= currentTs) {
      map.set(item.requestId, item);
    }
    return map;
  }, new Map<string, T>());
}

function resolveCategoryLabel(args: {
  locale: Locale;
  request?: RequestResponseDto | null;
  categoryByKey: Map<string, CategoryLookupItem>;
  serviceByKey: Map<string, ServiceLookupItem>;
}) {
  if (args.request?.categoryName?.trim()) return args.request.categoryName.trim();
  const service = args.request?.serviceKey ? args.serviceByKey.get(args.request.serviceKey) : null;
  const category = args.request?.categoryKey
    ? args.categoryByKey.get(args.request.categoryKey)
    : (service ? args.categoryByKey.get(service.categoryKey) : null);
  if (category) return pickI18n(category.i18n, args.locale);
  if (service) return pickI18n(service.i18n, args.locale);
  return args.locale === 'de' ? 'Service' : 'Service';
}

function resolveCityLabel(args: {
  locale: Locale;
  request?: RequestResponseDto | null;
  cityById: Map<string, CityLookupItem>;
}) {
  if (args.request?.cityName?.trim()) return args.request.cityName.trim();
  const city = args.request?.cityId ? args.cityById.get(args.request.cityId) : null;
  if (!city) return null;
  return pickI18n(city.i18n, args.locale) || city.name || null;
}

function resolveRequestTitle(args: {
  locale: Locale;
  request?: RequestResponseDto | null;
  category: string;
}) {
  if (args.request?.title?.trim()) return args.request.title.trim();
  if (args.request?.description?.trim()) return args.request.description.trim().slice(0, 88);
  return args.locale === 'de' ? `${args.category} anfragen` : `${args.category} request`;
}

function resolveStateLabel(locale: Locale, state: Exclude<WorkspaceRequestsState, 'all'>) {
  if (locale === 'de') {
    if (state === 'open') return 'Offen';
    if (state === 'clarifying') return 'In Klärung';
    if (state === 'active') return 'In Arbeit';
    return 'Abgeschlossen';
  }

  if (state === 'open') return 'Open';
  if (state === 'clarifying') return 'Clarifying';
  if (state === 'active') return 'Active';
  return 'Completed';
}

function resolveRoleLabel(locale: Locale, role: Exclude<WorkspaceRequestsRole, 'all'>) {
  if (locale === 'de') return role === 'customer' ? 'Kunde' : 'Anbieter';
  return role === 'customer' ? 'Customer' : 'Provider';
}

function resolveUrgency(deadlineAt: number | null, now: number): ViewUrgency {
  if (!deadlineAt) return null;
  const delta = deadlineAt - now;
  if (delta <= 2 * 24 * 60 * 60 * 1000) return 'high';
  if (delta <= 7 * 24 * 60 * 60 * 1000) return 'medium';
  return 'low';
}

function resolveProgressSteps(locale: Locale, currentStep: 'request' | 'offers' | 'selection' | 'contract' | 'done') {
  const steps = locale === 'de'
    ? [
      { key: 'request' as const, label: 'Anfrage' },
      { key: 'offers' as const, label: 'Angebote' },
      { key: 'selection' as const, label: 'Auswahl' },
      { key: 'contract' as const, label: 'Vertrag' },
      { key: 'done' as const, label: 'Abschluss' },
    ]
    : [
      { key: 'request' as const, label: 'Request' },
      { key: 'offers' as const, label: 'Offers' },
      { key: 'selection' as const, label: 'Selection' },
      { key: 'contract' as const, label: 'Contract' },
      { key: 'done' as const, label: 'Done' },
    ];
  const activeIndex = steps.findIndex((step) => step.key === currentStep);

  return steps.map((step, index) => ({
    ...step,
    status:
      index < activeIndex
        ? ('done' as const)
        : index === activeIndex
          ? ('current' as const)
          : ('upcoming' as const),
  }));
}

function buildCustomerCard(args: {
  locale: Locale;
  request: RequestResponseDto;
  offers: OfferDto[];
  contract: ContractDto | null;
  cityById: Map<string, CityLookupItem>;
  categoryByKey: Map<string, CategoryLookupItem>;
  serviceByKey: Map<string, ServiceLookupItem>;
  formatDate: BuildMyRequestsViewModelArgs['formatDate'];
  formatPrice: BuildMyRequestsViewModelArgs['formatPrice'];
  now: number;
}): MyRequestsViewCard {
  const { locale, request, offers, contract, cityById, categoryByKey, serviceByKey, formatDate, formatPrice, now } = args;
  const category = resolveCategoryLabel({ locale, request, categoryByKey, serviceByKey });
  const title = resolveRequestTitle({ locale, request, category });
  const city = resolveCityLabel({ locale, request, cityById });
  const preferredAt = parseDateToMs(request.preferredDate);
  const createdAt = parseDateToMs(request.createdAt) ?? now;
  const contractConfirmedAt = parseDateToMs(contract?.confirmedAt ?? contract?.createdAt ?? null);

  let state: Exclude<WorkspaceRequestsState, 'all'> = 'open';
  let progressStep: 'request' | 'offers' | 'selection' | 'contract' | 'done' = 'request';
  let activity: MyRequestsViewCard['activity'] = null;

  if (contract) {
    if (contract.status === 'completed' || contract.status === 'cancelled') {
      state = 'completed';
      progressStep = 'done';
      activity = {
        label: locale === 'de' ? 'Vorgang abgeschlossen' : 'Process completed',
        tone: 'success',
      };
    } else {
      state = 'active';
      progressStep = 'contract';
      activity = {
        label: contractConfirmedAt
          ? locale === 'de'
            ? `Termin bestätigt für ${formatDate(contract.confirmedAt ?? contract.createdAt)}`
            : `Confirmed for ${formatDate(contract.confirmedAt ?? contract.createdAt)}`
          : (locale === 'de' ? 'Vertrag aktiv' : 'Contract active'),
        tone: 'info',
      };
    }
  } else if (request.status === 'closed' || request.status === 'cancelled') {
    state = 'completed';
    progressStep = 'done';
    activity = {
      label: locale === 'de' ? 'Anfrage geschlossen' : 'Request closed',
      tone: 'neutral',
    };
  } else if (offers.length > 0 || request.status === 'matched') {
    state = 'clarifying';
    progressStep = offers.length > 0 ? 'selection' : 'offers';
    activity = {
      label: locale === 'de'
        ? `${offers.length} neue Angebote warten auf deine Auswahl`
        : `${offers.length} new offers are waiting for your decision`,
      tone: 'warning',
    };
  } else {
    activity = {
      label: locale === 'de'
        ? 'Anfrage ist aktiv und wartet auf Rückmeldungen'
        : 'Request is active and waiting for replies',
      tone: 'neutral',
    };
  }

  const budgetValue = contract?.priceAmount ?? request.price ?? null;
  const deadlineAt = contractConfirmedAt ?? preferredAt;
  const urgency = resolveUrgency(deadlineAt, now);

  return {
    id: `customer:${request.id}`,
    role: 'customer',
    roleLabel: resolveRoleLabel(locale, 'customer'),
    title,
    category,
    state,
    stateLabel: resolveStateLabel(locale, state),
    urgency,
    city,
    createdAt: request.createdAt ? formatDate(request.createdAt) : null,
    nextEventAt: contract?.confirmedAt
      ? formatDate(contract.confirmedAt)
      : request.preferredDate
        ? formatDate(request.preferredDate)
        : null,
    budgetLabel: typeof budgetValue === 'number' ? formatPrice(budgetValue) : null,
    progressLabel: resolveProgressSteps(locale, progressStep).find((step) => step.status === 'current')?.label ?? '',
    activity,
    progressSteps: resolveProgressSteps(locale, progressStep),
    primaryAction: {
      label: locale === 'de' ? 'Öffnen' : 'Open',
      href: `/requests/${request.id}`,
    },
    secondaryActions: [
      ...(offers.length > 0 && !contract ? [{
        key: 'compare',
        label: locale === 'de' ? 'Anbieter vergleichen' : 'Compare providers',
        href: `/requests/${request.id}`,
      }] : []),
      ...(contract ? [{
        key: 'contract',
        label: locale === 'de' ? 'Vertrag ansehen' : 'View contract',
        href: `/requests/${request.id}`,
      }] : []),
    ],
    sortActivityAt: contractConfirmedAt ?? preferredAt ?? createdAt,
    sortCreatedAt: createdAt,
    sortBudget: budgetValue ?? 0,
    sortDeadlineAt: deadlineAt,
  };
}

function buildProviderCard(args: {
  locale: Locale;
  offer: OfferDto;
  request: RequestResponseDto | null;
  contract: ContractDto | null;
  cityById: Map<string, CityLookupItem>;
  categoryByKey: Map<string, CategoryLookupItem>;
  serviceByKey: Map<string, ServiceLookupItem>;
  formatDate: BuildMyRequestsViewModelArgs['formatDate'];
  formatPrice: BuildMyRequestsViewModelArgs['formatPrice'];
  now: number;
}): MyRequestsViewCard {
  const { locale, offer, request, contract, cityById, categoryByKey, serviceByKey, formatDate, formatPrice, now } = args;
  const category = resolveCategoryLabel({ locale, request, categoryByKey, serviceByKey });
  const title = resolveRequestTitle({ locale, request, category });
  const city = resolveCityLabel({ locale, request, cityById });
  const offerCreatedAt = parseDateToMs(offer.createdAt) ?? now;
  const nextEventAt = parseDateToMs(contract?.confirmedAt ?? request?.preferredDate ?? offer.availableAt ?? null);
  const contractCompleted = contract && (contract.status === 'completed' || contract.status === 'cancelled');

  let state: Exclude<WorkspaceRequestsState, 'all'>;
  let progressStep: 'request' | 'offers' | 'selection' | 'contract' | 'done';
  let activity: MyRequestsViewCard['activity'];

  if (contractCompleted) {
    state = 'completed';
    progressStep = 'done';
    activity = {
      label: locale === 'de' ? 'Auftrag abgeschlossen' : 'Job completed',
      tone: 'success',
    };
  } else if (contract) {
    state = 'active';
    progressStep = 'contract';
    activity = {
      label: nextEventAt
        ? locale === 'de'
          ? `Auftrag beginnt ${formatDate(contract.confirmedAt ?? request?.preferredDate ?? offer.availableAt ?? offer.updatedAt)}`
          : `Job starts ${formatDate(contract.confirmedAt ?? request?.preferredDate ?? offer.availableAt ?? offer.updatedAt)}`
        : (locale === 'de' ? 'Vertrag aktiv' : 'Contract active'),
      tone: 'info',
    };
  } else if (offer.status === 'accepted') {
    state = 'active';
    progressStep = 'contract';
    activity = {
      label: locale === 'de' ? 'Warte auf Vertragsbestätigung' : 'Waiting for contract confirmation',
      tone: 'warning',
    };
  } else if (offer.status === 'declined' || offer.status === 'withdrawn' || request?.status === 'cancelled') {
    state = 'completed';
    progressStep = 'done';
    activity = {
      label: locale === 'de' ? 'Anfrage nicht weiter aktiv' : 'Request is no longer active',
      tone: 'neutral',
    };
  } else {
    state = 'clarifying';
    progressStep = 'selection';
    activity = {
      label: locale === 'de' ? 'Warte auf Rückmeldung des Kunden' : 'Waiting for the customer reply',
      tone: 'warning',
    };
  }

  const budgetValue = contract?.priceAmount ?? offer.amount ?? request?.price ?? null;

  return {
    id: `provider:${offer.requestId}`,
    role: 'provider',
    roleLabel: resolveRoleLabel(locale, 'provider'),
    title,
    category,
    state,
    stateLabel: resolveStateLabel(locale, state),
    urgency: resolveUrgency(nextEventAt, now),
    city,
    createdAt: formatDate(offer.createdAt),
    nextEventAt: contract?.confirmedAt
      ? formatDate(contract.confirmedAt)
      : request?.preferredDate
        ? formatDate(request.preferredDate)
        : offer.availableAt
          ? formatDate(offer.availableAt)
          : null,
    budgetLabel: typeof budgetValue === 'number' ? formatPrice(budgetValue) : null,
    progressLabel: resolveProgressSteps(locale, progressStep).find((step) => step.status === 'current')?.label ?? '',
    activity,
    progressSteps: resolveProgressSteps(locale, progressStep),
    primaryAction: {
      label: locale === 'de' ? 'Öffnen' : 'Open',
      href: `/requests/${offer.requestId}`,
    },
    secondaryActions: [
      {
        key: 'message',
        label: locale === 'de' ? 'Nachricht schreiben' : 'Write message',
        href: `/chat`,
      },
      ...(state === 'active' ? [{
        key: 'contract',
        label: locale === 'de' ? 'Vertrag ansehen' : 'View contract',
        href: `/requests/${offer.requestId}`,
      }] : []),
    ],
    sortActivityAt: parseDateToMs(contract?.updatedAt ?? offer.updatedAt ?? offer.createdAt) ?? offerCreatedAt,
    sortCreatedAt: offerCreatedAt,
    sortBudget: budgetValue ?? 0,
    sortDeadlineAt: nextEventAt,
  };
}

function buildSummary(args: {
  locale: Locale;
  cards: MyRequestsViewCard[];
  activeState: WorkspaceRequestsState;
}) {
  const counts = {
    all: args.cards.length,
    open: args.cards.filter((card) => card.state === 'open').length,
    clarifying: args.cards.filter((card) => card.state === 'clarifying').length,
    active: args.cards.filter((card) => card.state === 'active').length,
    completed: args.cards.filter((card) => card.state === 'completed').length,
  };

  return [
    {
      key: 'all' as const,
      label: args.locale === 'de' ? 'Aktiv' : 'Active',
      value: counts.all,
      isHighlighted: args.activeState === 'all',
    },
    {
      key: 'clarifying' as const,
      label: args.locale === 'de' ? 'In Klärung' : 'Clarifying',
      value: counts.clarifying,
      isHighlighted: args.activeState === 'clarifying',
    },
    {
      key: 'active' as const,
      label: args.locale === 'de' ? 'In Arbeit' : 'In progress',
      value: counts.active,
      isHighlighted: args.activeState === 'active',
    },
    {
      key: 'completed' as const,
      label: args.locale === 'de' ? 'Abgeschlossen' : 'Completed',
      value: counts.completed,
      isHighlighted: args.activeState === 'completed',
    },
  ] satisfies MyRequestsSummaryItem[];
}

function buildTabs(args: {
  locale: Locale;
  cards: MyRequestsViewCard[];
}) {
  const counts = {
    all: args.cards.length,
    open: args.cards.filter((card) => card.state === 'open').length,
    clarifying: args.cards.filter((card) => card.state === 'clarifying').length,
    active: args.cards.filter((card) => card.state === 'active').length,
    completed: args.cards.filter((card) => card.state === 'completed').length,
  };

  return [
    { key: 'all' as const, label: args.locale === 'de' ? 'Alle' : 'All', count: counts.all },
    { key: 'open' as const, label: args.locale === 'de' ? 'Offen' : 'Open', count: counts.open },
    {
      key: 'clarifying' as const,
      label: args.locale === 'de' ? 'In Klärung' : 'Clarifying',
      count: counts.clarifying,
    },
    { key: 'active' as const, label: args.locale === 'de' ? 'In Arbeit' : 'In progress', count: counts.active },
    {
      key: 'completed' as const,
      label: args.locale === 'de' ? 'Abgeschlossen' : 'Completed',
      count: counts.completed,
    },
  ] satisfies MyRequestsTabItem[];
}

function buildRail(args: {
  locale: Locale;
  role: WorkspaceRequestsRole;
  cards: MyRequestsViewCard[];
}) {
  const actionableCards = [...args.cards].sort((left, right) => {
    const leftWeight = (STATE_WEIGHT[left.state] * 10) + (left.urgency === 'high' ? 3 : left.urgency === 'medium' ? 2 : 1);
    const rightWeight = (STATE_WEIGHT[right.state] * 10) + (right.urgency === 'high' ? 3 : right.urgency === 'medium' ? 2 : 1);
    return rightWeight - leftWeight || right.sortActivityAt - left.sortActivityAt;
  });
  const focusCard = actionableCards[0] ?? null;
  const clarifyingCount = args.cards.filter((card) => card.state === 'clarifying').length;
  const activeCount = args.cards.filter((card) => card.state === 'active').length;
  const highUrgencyCount = args.cards.filter((card) => card.urgency === 'high').length;
  const customerCount = args.cards.filter((card) => card.role === 'customer').length;
  const providerCount = args.cards.filter((card) => card.role === 'provider').length;

  return {
    focus: focusCard
      ? {
        title: args.locale === 'de' ? 'Aktueller Fokus' : 'Current focus',
        description: focusCard.activity?.label
          ?? (args.locale === 'de' ? 'Dieser Vorgang sollte als Nächstes geöffnet werden.' : 'This item should be opened next.'),
        ctaLabel: focusCard.primaryAction.label,
        href: focusCard.primaryAction.href,
      }
      : null,
    recommendation: {
      title: args.locale === 'de' ? 'KI-Empfehlung' : 'AI recommendation',
      description: (() => {
        if (args.role === 'provider') {
          return args.locale === 'de'
            ? 'Schnelle Rückmeldungen auf laufende Vorgänge erhöhen aktuell deine Abschlusschance.'
            : 'Fast replies on active flows improve your close rate right now.';
        }
        if (args.role === 'customer') {
          return args.locale === 'de'
            ? 'Prüfe neue Angebote zeitnah, damit Auswahl und Terminbestätigung nicht liegen bleiben.'
            : 'Review new offers quickly so selection and confirmation keep moving.';
        }
        return args.locale === 'de'
          ? 'Halte Klärungen kurz und bestätige aktive Vorgänge früh, damit offene Arbeit nicht blockiert.'
          : 'Keep clarifications short and confirm active work early so the queue stays unblocked.';
      })(),
    },
    contextItems: [
      {
        title: args.locale === 'de' ? 'Kontext' : 'Context',
        description: args.locale === 'de'
          ? `Kunde ${customerCount} · Anbieter ${providerCount}`
          : `Customer ${customerCount} · Provider ${providerCount}`,
        meta: [
          {
            label: args.locale === 'de' ? 'In Klärung' : 'Clarifying',
            value: String(clarifyingCount),
          },
          {
            label: args.locale === 'de' ? 'Hohe Dringlichkeit' : 'High urgency',
            value: String(highUrgencyCount),
          },
        ],
      },
      {
        title: args.locale === 'de' ? 'Laufende Arbeit' : 'Active work',
        description: args.locale === 'de'
          ? `${activeCount} Vorgänge sind aktuell in Arbeit.`
          : `${activeCount} items are currently active.`,
      },
    ],
    nextSteps: [
      ...(clarifyingCount > 0 ? [{
        id: 'clarifying',
        title: args.locale === 'de' ? 'Neue Rückmeldungen prüfen' : 'Review new responses',
      }] : []),
      ...(highUrgencyCount > 0 ? [{
        id: 'urgent',
        title: args.locale === 'de' ? 'Dringende Vorgänge priorisieren' : 'Prioritize urgent items',
      }] : []),
      ...(activeCount > 0 ? [{
        id: 'active',
        title: args.locale === 'de' ? 'Laufende Arbeit bestätigen oder abschließen' : 'Confirm or close active work',
      }] : []),
    ],
  } satisfies MyRequestsRailModel;
}

export function buildMyRequestsViewModel({
  locale,
  role,
  state,
  period,
  sort,
  myRequests,
  myOffers,
  myClientOffers,
  myOfferRequestsById,
  myProviderContracts,
  myClientContracts,
  cityById,
  categoryByKey,
  serviceByKey,
  formatDate,
  formatPrice,
  now = Date.now(),
}: BuildMyRequestsViewModelArgs): MyRequestsViewModel {
  const customerOffersByRequest = myClientOffers.reduce((map, offer) => {
    const items = map.get(offer.requestId) ?? [];
    items.push(offer);
    map.set(offer.requestId, items);
    return map;
  }, new Map<string, OfferDto[]>());
  const providerOfferByRequest = pickLatestByRequest(myOffers);
  const providerContractByRequest = pickLatestByRequest(myProviderContracts);
  const clientContractByRequest = pickLatestByRequest(myClientContracts);

  const customerCards = myRequests.map((request) =>
    buildCustomerCard({
      locale,
      request,
      offers: customerOffersByRequest.get(request.id) ?? [],
      contract: clientContractByRequest.get(request.id) ?? null,
      cityById,
      categoryByKey,
      serviceByKey,
      formatDate,
      formatPrice,
      now,
    }));

  const providerCards = Array.from(providerOfferByRequest.values())
    .map((offer) =>
      buildProviderCard({
        locale,
        offer,
        request: myOfferRequestsById.get(offer.requestId) ?? null,
        contract: providerContractByRequest.get(offer.requestId) ?? null,
        cityById,
        categoryByKey,
        serviceByKey,
        formatDate,
        formatPrice,
        now,
      }));

  const allCards = [...customerCards, ...providerCards];
  const periodCutoff = now - PERIOD_MS[period];
  const cardsInPeriod = allCards.filter((card) => card.sortActivityAt >= periodCutoff);
  const cardsByRole = role === 'all'
    ? cardsInPeriod
    : cardsInPeriod.filter((card) => card.role === role);
  const cardsByState = state === 'all'
    ? cardsByRole
    : cardsByRole.filter((card) => card.state === state);

  const sortedCards = [...cardsByState].sort((left, right) => {
    if (sort === 'deadline') {
      if (left.sortDeadlineAt == null) return 1;
      if (right.sortDeadlineAt == null) return -1;
      return left.sortDeadlineAt - right.sortDeadlineAt || right.sortActivityAt - left.sortActivityAt;
    }
    if (sort === 'newest') return right.sortCreatedAt - left.sortCreatedAt;
    if (sort === 'budget' || sort === 'price_desc') return right.sortBudget - left.sortBudget;
    if (sort === 'oldest' || sort === 'date_asc') return left.sortCreatedAt - right.sortCreatedAt;
    return right.sortActivityAt - left.sortActivityAt;
  });

  return {
    activeRole: role,
    activeState: state,
    summary: buildSummary({ locale, cards: cardsByRole, activeState: state }),
    tabs: buildTabs({ locale, cards: cardsByRole }),
    cards: sortedCards,
    rail: buildRail({ locale, role, cards: cardsByRole }),
    emptyMode: allCards.length === 0 ? 'empty' : sortedCards.length === 0 ? 'filtered' : 'none',
  };
}
