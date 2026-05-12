import { describe, expect, it, vi } from 'vitest';

import {
  buildRequestsWorkspacePrivateBody,
  buildRequestsWorkspacePublicBody,
} from './RequestsWorkspaceBody';
import { buildWorkspaceRequestsSurfaceModel } from './workspaceRequestsView.model';

describe('RequestsWorkspaceBody', () => {
  it('builds an explicit public body variant', () => {
    const body = buildRequestsWorkspacePublicBody(buildWorkspaceRequestsSurfaceModel({
      variant: 'market',
      locale: 'de',
      isWorkspaceAuthed: false,
      guestLoginHref: '/auth/login',
      pagination: {
        page: 1,
        totalPages: 3,
        onPageChange: vi.fn(),
      },
      model: {
        response: {
          section: 'requests',
          scope: 'market',
          header: { title: 'Markt' },
          filters: {
            role: 'all',
            state: 'all',
            period: '30d',
            sort: 'activity',
          },
          summary: {
            items: [],
          },
          list: {
            total: 0,
            page: 1,
            limit: 20,
            hasMore: false,
            items: [],
          },
          decisionPanel: {
            summary: {
              totalNeedsAction: 0,
              highPriorityCount: 0,
              newOffersCount: 0,
              replyRequiredCount: 0,
              confirmCompletionCount: 0,
              overdueCount: 0,
            },
            primaryAction: {
              label: 'Markt prüfen',
              mode: 'decision',
              targetFilter: 'needs_action',
            },
            queue: [],
            overview: {
              highUrgency: 0,
              inProgress: 0,
              completedThisPeriod: 0,
            },
          },
          sidePanel: null,
        },
        cards: [],
        emptyMode: 'empty',
      },
      isLoading: false,
      isError: false,
      decisionState: {
        mode: 'default',
        activeRequestId: null,
        completedInSession: 0,
      },
      decisionQueueIds: [],
      onEnterDecisionMode: vi.fn(),
      onOpenDecisionItem: vi.fn(),
      onExitDecisionMode: vi.fn(),
      listContext: {
        onOpenRequest: vi.fn(),
      },
      emptyCtaHref: '/workspace?section=requests&scope=market',
      secondaryCtaHref: '/workspace?section=providers',
    }));

    expect(body.kind).toBe('public');
    if (body.kind !== 'public') {
      throw new Error('Expected public body variant');
    }
    expect(body.surface.emptyCtaHref).toBe('/workspace?section=requests&scope=market');
    expect(body.surface.variant).toBe('market');
    expect(body.surface.pagination?.totalPages).toBe(3);
  });

  it('builds an explicit private body variant', () => {
    const body = buildRequestsWorkspacePrivateBody(buildWorkspaceRequestsSurfaceModel({
      variant: 'private',
      locale: 'de',
      isWorkspaceAuthed: true,
      guestLoginHref: '/auth/login',
      pagination: {
        page: 2,
        totalPages: 5,
        onPageChange: vi.fn(),
      },
      model: {
        response: {
          section: 'requests',
          scope: 'my',
          header: { title: 'Meine Vorgänge' },
          filters: {
            role: 'all',
            state: 'all',
            period: '30d',
            sort: 'activity',
          },
          summary: {
            items: [],
          },
          list: {
            total: 0,
            page: 1,
            limit: 20,
            hasMore: false,
            items: [],
          },
          decisionPanel: {
            summary: {
              totalNeedsAction: 0,
              highPriorityCount: 0,
              newOffersCount: 0,
              replyRequiredCount: 0,
              confirmCompletionCount: 0,
              overdueCount: 0,
            },
            primaryAction: {
              label: 'Jetzt handeln',
              mode: 'decision',
              targetFilter: 'needs_action',
            },
            queue: [],
            overview: {
              highUrgency: 0,
              inProgress: 0,
              completedThisPeriod: 0,
            },
          },
          sidePanel: null,
        },
        cards: [],
        emptyMode: 'empty',
      },
      isLoading: false,
      isError: false,
      decisionState: {
        mode: 'default',
        activeRequestId: null,
        completedInSession: 0,
      },
      decisionQueueIds: [],
      onEnterDecisionMode: vi.fn(),
      onOpenDecisionItem: vi.fn(),
      onExitDecisionMode: vi.fn(),
      listContext: {},
    }));

    expect(body.kind).toBe('private');
    if (body.kind !== 'private') {
      throw new Error('Expected private body variant');
    }
    expect(body.surface.guestLoginHref).toBe('/auth/login');
    expect(body.surface.pagination?.page).toBe(2);
  });
});
