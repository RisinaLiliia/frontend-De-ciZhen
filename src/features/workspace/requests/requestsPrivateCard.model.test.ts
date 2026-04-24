import { describe, expect, it } from 'vitest';

import { buildPrivateRequestCardChrome } from '@/features/workspace/requests/requestsPrivateCard.model';

describe('requestsPrivateCard.model', () => {
  it('prefers backend decision primary action and keeps one calmer secondary action', () => {
    const chrome = buildPrivateRequestCardChrome({
      locale: 'de',
      card: {
        id: 'customer:req-1',
        requestId: 'req-1',
        role: 'customer',
        title: 'WC reparieren',
        category: 'Sanitär',
        subcategory: 'Badezimmer',
        city: 'Stuttgart',
        state: 'clarifying',
        stateLabel: 'In Klärung',
        activity: {
          label: '2 Angebote warten auf deine Auswahl',
          tone: 'warning',
        },
        progress: {
          currentStep: 'selection',
          steps: [
            { key: 'request', label: 'Anfrage', status: 'done' },
            { key: 'offers', label: 'Angebote', status: 'done' },
            { key: 'selection', label: 'Auswahl', status: 'current' },
            { key: 'contract', label: 'Vertrag', status: 'upcoming' },
            { key: 'done', label: 'Abschluss', status: 'upcoming' },
          ],
        },
        quickActions: [
          {
            key: 'open',
            label: 'Öffnen',
            tone: 'primary',
            href: '/requests/req-1',
          },
        ],
        requestPreview: {
          href: '/requests/req-1',
          imageUrl: null,
          imageCategoryKey: 'plumbing',
          badgeLabel: 'Schnellhilfe',
          categoryLabel: 'Sanitär',
          title: 'WC reparieren',
          excerpt: 'Spülung defekt, schnelle Hilfe benötigt.',
          cityLabel: 'Stuttgart',
          dateLabel: '12.04.2026',
          priceLabel: 'bis 100 €',
          priceTrend: null,
          priceTrendLabel: null,
          tags: [],
        },
        status: {
          badgeLabel: 'Neue Antworten',
          badgeTone: 'warning',
          actions: [
            {
              key: 'open',
              kind: 'link',
              tone: 'secondary',
              icon: 'briefcase',
              label: 'Öffnen',
              href: '/requests/req-1',
              requestId: 'req-1',
            },
            {
              key: 'edit-request',
              kind: 'link',
              tone: 'secondary',
              icon: 'edit',
              label: 'Bearbeiten',
              href: '/requests/req-1/edit',
              requestId: 'req-1',
            },
          ],
        },
        decision: {
          needsAction: true,
          actionType: 'review_offers',
          actionPriority: 70,
          actionPriorityLevel: 'medium',
          actionLabel: '2 Angebote prüfen',
          actionReason: 'Zwei neue Angebote warten auf deine Entscheidung.',
          lastRelevantActivityAt: '2026-04-12T10:00:00.000Z',
          primaryAction: {
            key: 'open',
            kind: 'link',
            tone: 'primary',
            icon: 'briefcase',
            label: 'Angebote prüfen',
            href: '/requests/req-1',
            requestId: 'req-1',
          },
        },
      },
    });

    expect(chrome.priorityLabel).toBe('Handlungsbedarf');
    expect(chrome.primaryAction?.label).toBe('Angebote prüfen');
    expect(chrome.secondaryAction?.label).toBe('Bearbeiten');
    expect(chrome.signalPills.map((item) => item.label)).toEqual(['2 Angebote prüfen', 'Neue Antworten']);
    expect(chrome.insights).toEqual([
      {
        key: 'decision',
        title: 'Angebote',
        description: 'Zwei neue Angebote warten auf deine Entscheidung.',
        tone: 'info',
      },
      {
        key: 'activity',
        title: 'Status',
        description: '2 Angebote warten auf deine Auswahl',
        tone: 'warning',
      },
    ]);
    expect(chrome.contextPills).toEqual([]);
  });

  it('falls back to status and quick actions when no decision action exists', () => {
    const chrome = buildPrivateRequestCardChrome({
      locale: 'de',
      card: {
        id: 'provider:req-2',
        requestId: 'req-2',
        role: 'provider',
        title: 'Büro reinigen',
        category: 'Reinigung',
        subcategory: null,
        city: 'Berlin',
        state: 'active',
        stateLabel: 'In Arbeit',
        activity: null,
        progress: {
          currentStep: 'contract',
          steps: [],
        },
        quickActions: [
          {
            key: 'contract',
            label: 'Vertrag ansehen',
            tone: 'secondary',
            href: '/requests/req-2',
          },
        ],
        requestPreview: {
          href: '/requests/req-2',
          imageUrl: null,
          imageCategoryKey: 'cleaning',
          badgeLabel: null,
          categoryLabel: 'Reinigung',
          title: 'Büro reinigen',
          excerpt: 'Einmalige Reinigung.',
          cityLabel: 'Berlin',
          dateLabel: '14.04.2026',
          priceLabel: '220 €',
          priceTrend: null,
          priceTrendLabel: null,
          tags: [],
        },
        status: {
          badgeLabel: 'Angenommen',
          badgeTone: 'success',
          actions: [
            {
              key: 'contract',
              kind: 'link',
              tone: 'primary',
              icon: 'briefcase',
              label: 'Vertrag',
              href: '/workspace?tab=completed-jobs',
              requestId: 'req-2',
              offerId: 'offer-2',
            },
            {
              key: 'chat',
              kind: 'open_chat',
              tone: 'secondary',
              icon: 'chat',
              label: 'Chat',
              requestId: 'req-2',
              offerId: 'offer-2',
              chatInput: {
                relatedEntity: { type: 'offer', id: 'offer-2' },
                participantUserId: 'provider-1',
                participantRole: 'provider',
                requestId: 'req-2',
                providerUserId: 'provider-1',
                offerId: 'offer-2',
              },
            },
          ],
        },
        decision: {
          needsAction: false,
          actionType: 'none',
          actionPriority: 0,
          actionPriorityLevel: 'none',
          actionLabel: null,
          actionReason: null,
          lastRelevantActivityAt: null,
          primaryAction: null,
        },
      },
    });

    expect(chrome.priorityLabel).toBe('In Arbeit');
    expect(chrome.primaryAction?.label).toBe('Vertrag');
    expect(chrome.secondaryAction?.label).toBe('Chat');
    expect(chrome.signalPills.map((item) => item.label)).toEqual(['Angenommen']);
    expect(chrome.insights).toEqual([]);
    expect(chrome.contextPills).toEqual([]);
  });

  it('routes card edit-request actions to request details instead of edit form', () => {
    const chrome = buildPrivateRequestCardChrome({
      locale: 'de',
      card: {
        id: 'customer:req-3',
        requestId: 'req-3',
        role: 'customer',
        title: 'Heizung prüfen',
        category: 'Heizung',
        subcategory: null,
        city: 'Karlsruhe',
        state: 'open',
        stateLabel: 'Offen',
        activity: null,
        progress: {
          currentStep: 'request',
          steps: [],
        },
        quickActions: [],
        requestPreview: {
          href: '/requests/req-3',
          imageUrl: null,
          imageCategoryKey: 'heating',
          badgeLabel: null,
          categoryLabel: 'Heizung',
          title: 'Heizung prüfen',
          excerpt: null,
          cityLabel: 'Karlsruhe',
          dateLabel: '20.04.2026',
          priceLabel: '120 €',
          priceTrend: null,
          priceTrendLabel: null,
          tags: [],
        },
        status: {
          badgeLabel: 'Entwurf',
          badgeTone: 'info',
          actions: [
            {
              key: 'edit-request',
              kind: 'link',
              tone: 'primary',
              icon: 'edit',
              label: 'Bearbeiten',
              href: '/requests/req-3/edit',
              requestId: 'req-3',
            },
          ],
        },
        decision: {
          needsAction: false,
          actionType: 'none',
          actionPriority: 0,
          actionPriorityLevel: 'none',
          actionLabel: null,
          actionReason: null,
          lastRelevantActivityAt: null,
          primaryAction: null,
        },
      },
    });

    expect(chrome.primaryAction).toEqual(
      expect.objectContaining({
        key: 'edit-request',
        href: '/requests/req-3',
      }),
    );
  });

  it('respects backend lifecycle ctas for contract and draft states', () => {
    const contractChrome = buildPrivateRequestCardChrome({
      locale: 'de',
      card: {
        id: 'customer:req-4',
        requestId: 'req-4',
        role: 'customer',
        title: 'Malerarbeiten',
        category: 'Renovierung',
        subcategory: null,
        city: 'Berlin',
        state: 'active',
        stateLabel: 'In Arbeit',
        activity: null,
        progress: {
          currentStep: 'contract',
          steps: [],
        },
        quickActions: [],
        requestPreview: {
          href: '/requests/req-4',
          imageUrl: null,
          imageCategoryKey: 'renovation',
          badgeLabel: null,
          categoryLabel: 'Renovierung',
          title: 'Malerarbeiten',
          excerpt: null,
          cityLabel: 'Berlin',
          dateLabel: '24.04.2026',
          priceLabel: '400 €',
          priceTrend: null,
          priceTrendLabel: null,
          tags: [],
        },
        status: {
          badgeLabel: 'Aktiv',
          badgeTone: 'success',
          actions: [
            {
              key: 'contract',
              kind: 'link',
              tone: 'primary',
              icon: 'briefcase',
              label: 'Vertrag ansehen',
              href: '/requests/req-4',
              requestId: 'req-4',
            },
            {
              key: 'chat',
              kind: 'open_chat',
              tone: 'secondary',
              icon: 'chat',
              label: 'Chat',
              requestId: 'req-4',
              chatInput: {
                relatedEntity: { type: 'request', id: 'req-4' },
                participantUserId: 'provider-4',
                participantRole: 'provider',
                requestId: 'req-4',
                providerUserId: 'provider-4',
                contractId: 'contract-4',
              },
            },
          ],
        },
        decision: {
          needsAction: true,
          actionType: 'confirm_contract',
          actionPriority: 90,
          actionPriorityLevel: 'high',
          actionLabel: 'Vertrag ansehen',
          actionReason: 'Die nächsten Schritte hängen von deiner Vertragsbestätigung ab.',
          lastRelevantActivityAt: '2026-04-22T09:00:00.000Z',
          primaryAction: {
            key: 'contract',
            kind: 'link',
            tone: 'primary',
            icon: 'briefcase',
            label: 'Vertrag ansehen',
            href: '/requests/req-4',
            requestId: 'req-4',
          },
        },
      },
    });

    expect(contractChrome.primaryAction).toEqual(
      expect.objectContaining({
        key: 'contract',
        label: 'Vertrag ansehen',
        href: '/requests/req-4',
      }),
    );
    expect(contractChrome.secondaryAction).toEqual(
      expect.objectContaining({
        key: 'chat',
        label: 'Chat',
      }),
    );

    const publishChrome = buildPrivateRequestCardChrome({
      locale: 'de',
      card: {
        id: 'customer:req-5',
        requestId: 'req-5',
        role: 'customer',
        title: 'Neue Anfrage',
        category: 'Reinigung',
        subcategory: null,
        city: 'Berlin',
        state: 'open',
        stateLabel: 'Offen',
        activity: null,
        progress: {
          currentStep: 'request',
          steps: [],
        },
        quickActions: [],
        requestPreview: {
          href: '/requests/req-5',
          imageUrl: null,
          imageCategoryKey: 'cleaning',
          badgeLabel: null,
          categoryLabel: 'Reinigung',
          title: 'Neue Anfrage',
          excerpt: null,
          cityLabel: 'Berlin',
          dateLabel: '25.04.2026',
          priceLabel: '120 €',
          priceTrend: null,
          priceTrendLabel: null,
          tags: [],
        },
        status: {
          badgeLabel: 'Entwurf',
          badgeTone: 'info',
          actions: [
            {
              key: 'publish-request',
              kind: 'publish_request',
              tone: 'primary',
              icon: 'send',
              label: 'Jetzt veröffentlichen',
              requestId: 'req-5',
            },
          ],
        },
        decision: {
          needsAction: false,
          actionType: 'none',
          actionPriority: 0,
          actionPriorityLevel: 'none',
          actionLabel: null,
          actionReason: null,
          lastRelevantActivityAt: null,
          primaryAction: null,
        },
      },
    });

    expect(publishChrome.primaryAction?.label).toBe('Jetzt veröffentlichen');
  });

  it('keeps duplicate as the reviewed secondary action', () => {
    const chrome = buildPrivateRequestCardChrome({
      locale: 'de',
      card: {
        id: 'customer:req-6',
        requestId: 'req-6',
        role: 'customer',
        ownerLifecycleStage: 'reviewed',
        title: 'Elektrik prüfen',
        category: 'Elektrik',
        subcategory: null,
        city: 'Berlin',
        state: 'completed',
        stateLabel: 'Abgeschlossen',
        activity: {
          label: 'Auftrag abgeschlossen und bewertet',
          tone: 'success',
        },
        progress: {
          currentStep: 'done',
          steps: [],
        },
        quickActions: [],
        requestPreview: {
          href: '/requests/req-6',
          imageUrl: null,
          imageCategoryKey: 'electrical',
          badgeLabel: null,
          categoryLabel: 'Elektrik',
          title: 'Elektrik prüfen',
          excerpt: null,
          cityLabel: 'Berlin',
          dateLabel: '26.04.2026',
          priceLabel: '180 €',
          priceTrend: null,
          priceTrendLabel: null,
          tags: [],
        },
        status: {
          badgeLabel: 'Abgeschlossen',
          badgeTone: 'success',
          actions: [
            {
              key: 'review',
              kind: 'link',
              tone: 'primary',
              icon: 'briefcase',
              label: 'Bewertung ansehen',
              href: '/requests/req-6',
              requestId: 'req-6',
            },
            {
              key: 'duplicate-request',
              kind: 'duplicate_request',
              tone: 'secondary',
              icon: 'copy',
              label: 'Duplizieren',
              requestId: 'req-6',
            },
            {
              key: 'open',
              kind: 'link',
              tone: 'secondary',
              icon: 'briefcase',
              label: 'Details ansehen',
              href: '/requests/req-6',
              requestId: 'req-6',
            },
          ],
        },
        decision: {
          needsAction: false,
          actionType: 'none',
          actionPriority: 0,
          actionPriorityLevel: 'none',
          actionLabel: null,
          actionReason: null,
          lastRelevantActivityAt: null,
          primaryAction: null,
        },
      },
    });

    expect(chrome.primaryAction?.label).toBe('Bewertung ansehen');
    expect(chrome.secondaryAction).toEqual(
      expect.objectContaining({
        key: 'duplicate-request',
        label: 'Duplizieren',
      }),
    );
  });
});
