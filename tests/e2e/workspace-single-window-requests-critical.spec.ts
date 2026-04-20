import { expect, test } from '@playwright/test';
import { dismissCookieConsentIfPresent } from './helpers/consent';

type DecisionStage = 'review_offers' | 'confirm_contract' | 'confirm_completion' | 'completed';

function buildPrivateOverview() {
  return {
    updatedAt: '2026-04-20T09:00:00.000Z',
    user: { userId: 'client-user-1', role: 'client' },
    preferredRole: 'customer',
    requestsByStatus: {
      draft: 0,
      published: 1,
      paused: 0,
      matched: 0,
      closed: 0,
      cancelled: 0,
      total: 1,
    },
    providerOffersByStatus: { sent: 0, accepted: 0, declined: 0, withdrawn: 0, total: 0 },
    clientOffersByStatus: { sent: 1, accepted: 0, declined: 0, withdrawn: 0, total: 1 },
    providerContractsByStatus: { pending: 0, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0, total: 0 },
    clientContractsByStatus: { pending: 1, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0, total: 1 },
    favorites: { requests: 0, providers: 0 },
    reviews: { asProvider: 0, asClient: 0 },
    ratingSummary: { average: 0, count: 0 },
    profiles: { providerCompleteness: 100, clientCompleteness: 100 },
    kpis: {
      myOpenRequests: 1,
      providerActiveContracts: 0,
      clientActiveContracts: 1,
      acceptanceRate: 100,
      activityProgress: 66,
      avgResponseMinutes: 20,
      recentOffers7d: 1,
    },
    insights: {
      providerCompletedThisMonth: 0,
      providerCompletedLastMonth: 0,
      providerCompletedDeltaKind: 'none',
      providerCompletedDeltaPercent: null,
    },
    providerMonthlySeries: [],
    clientMonthlySeries: [],
  };
}

function buildWorkspaceRequestCard(stage: DecisionStage) {
  const actionType = stage === 'review_offers'
    ? 'review_offers'
    : stage === 'confirm_contract'
      ? 'confirm_contract'
      : 'confirm_completion';
  const actionLabel = stage === 'review_offers'
    ? 'Angebote prüfen'
    : stage === 'confirm_contract'
      ? 'Vertrag bestätigen'
      : 'Abschluss bestätigen';

  return {
    id: 'workspace-card-1',
    requestId: 'req-1',
    role: 'customer',
    title: 'Rohr reinigen',
    category: 'Plumbing',
    city: 'Berlin',
    createdAt: '2026-04-20T09:00:00.000Z',
    nextEventAt: '2026-04-21T10:00:00.000Z',
    budget: 140,
    agreedPrice: 150,
    state: stage === 'completed' ? 'completed' : 'open',
    stateLabel: stage === 'completed' ? 'Abgeschlossen' : 'Offen',
    urgency: 'high',
    activity: {
      label: actionLabel,
      tone: 'warning',
    },
    progress: {
      currentStep: stage === 'review_offers'
        ? 'offers'
        : stage === 'confirm_contract'
          ? 'contract'
          : 'done',
      steps: [
        { key: 'request', label: 'Anfrage', status: 'done' },
        { key: 'offers', label: 'Angebote', status: stage === 'review_offers' ? 'current' : 'done' },
        { key: 'selection', label: 'Auswahl', status: stage === 'review_offers' ? 'upcoming' : 'done' },
        { key: 'contract', label: 'Vertrag', status: stage === 'confirm_contract' ? 'current' : 'done' },
        { key: 'done', label: 'Fertig', status: stage === 'confirm_completion' || stage === 'completed' ? 'current' : 'upcoming' },
      ],
    },
    quickActions: [],
    requestPreview: {
      href: '/workspace?section=requests&scope=my&period=90d&range=90d',
      imageUrl: null,
      imageCategoryKey: 'plumbing',
      badgeLabel: 'Kunde',
      categoryLabel: 'Rohrreinigung',
      title: 'Rohr reinigen',
      excerpt: 'Küche und Bad prüfen',
      cityLabel: 'Berlin',
      dateLabel: '21 Apr',
      priceLabel: '140 €',
      priceTrend: null,
      priceTrendLabel: null,
      tags: ['Rohr', 'Küche'],
    },
    status: {
      badgeLabel: stage === 'completed' ? 'Abgeschlossen' : 'Aktion nötig',
      badgeTone: stage === 'completed' ? 'success' : 'warning',
      actions: [],
    },
    decision: {
      needsAction: true,
      actionType,
      actionPriority: 100,
      actionPriorityLevel: 'high',
      actionLabel,
      actionReason: 'Bitte erledige den nächsten Schritt direkt in dieser Ansicht.',
      lastRelevantActivityAt: '2026-04-20T09:10:00.000Z',
      primaryAction: null,
    },
  };
}

function buildWorkspaceRequestsResponse(stage: DecisionStage) {
  return {
    section: 'requests',
    scope: 'my',
    header: {
      title: 'Meine Vorgänge',
      subtitle: 'Ein Fenster für Anfragen, Verträge und Entscheidungen.',
    },
    filters: {
      role: 'customer',
      state: 'attention',
      period: '90d',
      sort: 'activity',
    },
    summary: {
      items: [
        { key: 'all', label: 'Alle', value: 1, isHighlighted: false },
        { key: 'attention', label: 'Aktiv', value: 1, isHighlighted: true },
        { key: 'execution', label: 'In Ausführung', value: 0, isHighlighted: false },
        { key: 'completed', label: 'Abgeschlossen', value: stage === 'completed' ? 1 : 0, isHighlighted: false },
      ],
    },
    list: {
      total: 1,
      page: 1,
      limit: 20,
      hasMore: false,
      items: [buildWorkspaceRequestCard(stage)],
    },
    decisionPanel: {
      summary: {
        totalNeedsAction: 1,
        highPriorityCount: 1,
        newOffersCount: stage === 'review_offers' ? 1 : 0,
        replyRequiredCount: 0,
        confirmCompletionCount: stage === 'confirm_completion' || stage === 'completed' ? 1 : 0,
        overdueCount: 0,
      },
      primaryAction: {
        label: 'Jetzt handeln',
        mode: 'decision',
        targetFilter: 'needs_action',
      },
      queue: [
        {
          requestId: 'req-1',
          title: 'Rohr reinigen',
          actionType: stage === 'completed' ? 'confirm_completion' : buildWorkspaceRequestCard(stage).decision.actionType,
          actionLabel: buildWorkspaceRequestCard(stage).decision.actionLabel,
          actionPriority: 100,
          actionPriorityLevel: 'high',
          actionReason: 'Bitte erledige den nächsten Schritt direkt hier.',
          categoryLabel: 'Rohrreinigung',
          cityLabel: 'Berlin',
        },
      ],
      overview: {
        highUrgency: 1,
        inProgress: 0,
        completedThisPeriod: stage === 'completed' ? 1 : 0,
      },
    },
    sidePanel: null,
  };
}

function buildRequestDetail() {
  return {
    id: 'req-1',
    title: 'Rohr reinigen',
    description: 'Küche und Bad prüfen, Zugang ist frei.',
    price: 140,
    preferredDate: '2026-04-21T10:00:00.000Z',
    status: 'published',
    cityName: 'Berlin',
    photos: [],
  };
}

function buildOffers(stage: DecisionStage) {
  return [
    {
      id: 'offer-1',
      requestId: 'req-1',
      providerUserId: 'provider-1',
      providerDisplayName: 'Robin Service',
      status: stage === 'review_offers' ? 'sent' : 'accepted',
      amount: 150,
      message: 'Ich kann morgen zwischen 10 und 12 Uhr vorbeikommen.',
      availabilityNote: 'Morgen 10:00',
      createdAt: '2026-04-20T09:05:00.000Z',
      providerCompletedJobs: 24,
      providerRatingAvg: 4.8,
    },
  ];
}

function buildContracts(stage: DecisionStage) {
  if (stage === 'review_offers') return [];

  return [
    {
      id: 'contract-1',
      requestId: 'req-1',
      offerId: 'offer-1',
      clientId: 'client-user-1',
      status: stage === 'confirm_contract'
        ? 'pending'
        : stage === 'confirm_completion'
          ? 'confirmed'
          : 'completed',
      priceAmount: 150,
      priceType: 'fixed',
      priceDetails: null,
      confirmedAt: stage === 'confirm_contract' ? null : '2026-04-20T09:20:00.000Z',
      completedAt: stage === 'completed' ? '2026-04-20T10:00:00.000Z' : null,
      cancelledAt: null,
      cancelReason: null,
      createdAt: '2026-04-20T09:15:00.000Z',
      updatedAt: '2026-04-20T09:20:00.000Z',
      providerUserId: 'provider-1',
    },
  ];
}

test('@critical keeps request management inside workspace modal through decision flow', async ({ page }) => {
  let stage: DecisionStage = 'review_offers';

  await page.addInitScript(() => {
    window.localStorage.setItem('dc_auth_session_hint', '1');
  });

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    const jsonHeaders = { 'content-type': 'application/json' };

    if (path === '/api/auth/refresh') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ accessToken: 'token-auth-1', expiresIn: 3600 }),
      });
    }

    if (path === '/api/users/me') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          id: 'client-user-1',
          name: 'Client User',
          email: 'client@test.com',
          role: 'client',
          acceptedPrivacyPolicy: true,
          isBlocked: false,
          createdAt: '2026-04-20T08:00:00.000Z',
          updatedAt: '2026-04-20T08:00:00.000Z',
          capabilities: { canProvide: false },
          lastMode: 'client',
          clientProfile: { id: 'cp-1', status: 'complete' },
        }),
      });
    }

    if (path === '/api/workspace/private') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(buildPrivateOverview()),
      });
    }

    if (path === '/api/workspace/requests') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(buildWorkspaceRequestsResponse(stage)),
      });
    }

    if (path === '/api/requests/my' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([buildRequestDetail()]),
      });
    }

    if (path === '/api/requests/my/req-1' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(buildRequestDetail()),
      });
    }

    if (path === '/api/offers/my-client' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(buildOffers(stage)),
      });
    }

    if (path === '/api/offers/by-request/req-1' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(buildOffers(stage)),
      });
    }

    if (path === '/api/offers/actions/offer-1/accept' && method === 'PATCH') {
      stage = 'confirm_contract';
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ accepted: true }),
      });
    }

    if (path === '/api/contracts/my' && method === 'GET' && url.searchParams.get('role') === 'client') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(buildContracts(stage)),
      });
    }

    if (path === '/api/contracts/contract-1/confirm' && method === 'POST') {
      stage = 'confirm_completion';
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(buildContracts(stage)[0]),
      });
    }

    if (path === '/api/contracts/contract-1/complete' && method === 'POST') {
      stage = 'completed';
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(buildContracts(stage)[0]),
      });
    }

    if (path === '/api/offers/my' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([]),
      });
    }

    if (path === '/api/favorites' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([]),
      });
    }

    if (path === '/api/reviews/my') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([]),
      });
    }

    if (path === '/api/contracts/my' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify([]),
      });
    }

    return route.fulfill({
      status: 404,
      headers: jsonHeaders,
      body: JSON.stringify({ message: `Mock not found: ${path}` }),
    });
  });

  await page.goto('/workspace?period=90d&range=90d&section=requests&scope=my');
  await dismissCookieConsentIfPresent(page);

  const openRequestCard = page.getByRole('link', { name: /Open request/i }).first();
  await expect(openRequestCard).toBeVisible();
  await openRequestCard.click();

  const dialog = page.getByRole('dialog', { name: 'Rohr reinigen' });
  await expect(dialog).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/workspace');
  await expect(dialog.getByRole('heading', { name: /Angebote|Offers/i })).toBeVisible();

  await dialog.getByRole('button', { name: /Annehmen|Accept/i }).click();
  await expect(dialog.getByText(/Angenommen|Accepted/i)).toBeVisible();
  await expect(dialog.getByRole('button', { name: /Vertrag bestätigen|Confirm contract/i })).toBeVisible();

  const stickyFooter = dialog.locator('.my-request-dialog__actions--sticky').first();
  await expect(stickyFooter).toBeVisible();
  await expect(stickyFooter.evaluate((node) => window.getComputedStyle(node).position)).resolves.toBe('sticky');

  await dialog.getByRole('button', { name: /Vertrag bestätigen|Confirm contract/i }).click();
  await expect(dialog.getByRole('button', { name: /Abschluss bestätigen|Confirm completion/i })).toBeVisible();

  await dialog.getByRole('button', { name: /Abschluss bestätigen|Confirm completion/i }).click();
  await expect(dialog.locator('.my-request-dialog__section-subtitle').filter({ hasText: /Abgeschlossen|Completed/i }).first()).toBeVisible();
  await expect(dialog.getByRole('button', { name: /Abschluss bestätigen|Confirm completion/i })).toBeDisabled();

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe('/workspace');
  await expect(page).not.toHaveURL(/\/requests\/req-1/);
});
