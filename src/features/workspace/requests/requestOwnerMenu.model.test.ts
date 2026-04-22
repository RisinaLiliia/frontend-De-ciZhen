import { describe, expect, it } from 'vitest';

import {
  hasOwnerRequestManagementCapability,
  resolveOwnerMenuActions,
} from '@/features/workspace/requests/requestOwnerMenu.model';

describe('requestOwnerMenu.model', () => {
  it('detects backend owner management capability from card actions', () => {
    expect(hasOwnerRequestManagementCapability({
      status: {
        actions: [
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
    } as never)).toBe(true);

    expect(hasOwnerRequestManagementCapability({
      status: {
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
        ],
      },
    } as never)).toBe(false);
  });

  it('keeps only backend-owned owner menu actions in stable order', () => {
    const actions = resolveOwnerMenuActions({
      locale: 'de',
      card: {
        id: 'customer:req-1',
        requestId: 'req-1',
        role: 'customer',
        title: 'Test',
        category: 'Design',
        subcategory: null,
        city: 'Berlin',
        state: 'open',
        stateLabel: 'Offen',
        urgency: null,
        activity: null,
        progress: { currentStep: 'request', steps: [] },
        quickActions: [],
        requestPreview: {
          href: '/requests/req-1',
          imageUrl: null,
          imageCategoryKey: null,
          badgeLabel: null,
          categoryLabel: 'Design',
          title: 'Test',
          excerpt: null,
          cityLabel: 'Berlin',
          dateLabel: null,
          priceLabel: '100 €',
          priceTrend: null,
          priceTrendLabel: null,
          tags: [],
        },
        status: {
          badgeLabel: 'Offen',
          badgeTone: 'info',
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
            {
              key: 'duplicate-request',
              kind: 'duplicate_request',
              tone: 'secondary',
              icon: 'copy',
              label: 'Duplizieren',
              requestId: 'req-1',
            },
            {
              key: 'share-request',
              kind: 'share_request',
              tone: 'secondary',
              icon: 'share',
              label: 'Teilen',
              href: '/requests/req-1',
              requestId: 'req-1',
            },
            {
              key: 'archive-request',
              kind: 'archive_request',
              tone: 'secondary',
              icon: 'archive',
              label: 'Archivieren',
              requestId: 'req-1',
            },
            {
              key: 'delete-request',
              kind: 'delete_request',
              tone: 'danger',
              icon: 'trash',
              label: 'Löschen',
              requestId: 'req-1',
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

    expect(actions.map((action) => action.key)).toEqual([
      'edit-request',
      'duplicate-request',
      'share-request',
      'archive-request',
      'delete-request',
    ]);
  });

  it('adds missing owner actions as frontend fallback when backend payload is partial', () => {
    const actions = resolveOwnerMenuActions({
      locale: 'de',
      card: {
        id: 'customer:req-2',
        requestId: 'req-2',
        role: 'customer',
        title: 'Test',
        category: 'Design',
        subcategory: null,
        city: 'Berlin',
        state: 'open',
        stateLabel: 'Offen',
        urgency: null,
        activity: null,
        progress: { currentStep: 'request', steps: [] },
        quickActions: [],
        requestPreview: {
          href: '/requests/req-2',
          imageUrl: null,
          imageCategoryKey: null,
          badgeLabel: null,
          categoryLabel: 'Design',
          title: 'Test',
          excerpt: null,
          cityLabel: 'Berlin',
          dateLabel: null,
          priceLabel: '100 €',
          priceTrend: null,
          priceTrendLabel: null,
          tags: [],
        },
        status: {
          badgeLabel: 'Offen',
          badgeTone: 'info',
          actions: [
            {
              key: 'edit-request',
              kind: 'link',
              tone: 'secondary',
              icon: 'edit',
              label: 'Bearbeiten',
              href: '/requests/req-2/edit',
              requestId: 'req-2',
            },
            {
              key: 'delete-request',
              kind: 'delete_request',
              tone: 'danger',
              icon: 'trash',
              label: 'Löschen',
              requestId: 'req-2',
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

    expect(actions.map((action) => action.key)).toEqual([
      'edit-request',
      'duplicate-request',
      'share-request',
      'archive-request',
      'delete-request',
    ]);
  });
});
