import { describe, expect, it, vi } from 'vitest';

import {
  buildRequestsWorkspacePrivateBody,
  buildRequestsWorkspacePublicBody,
} from './RequestsWorkspaceBody';

describe('RequestsWorkspaceBody', () => {
  it('builds an explicit public body variant', () => {
    const body = buildRequestsWorkspacePublicBody({
      t: vi.fn(),
      locale: 'de',
      emptyCtaHref: '/workspace?section=requests&scope=market',
      topBar: { kind: 'none' },
      totalResultsLabel: '12',
      requests: [],
      isLoading: false,
      isError: false,
      pendingOfferRequestId: null,
      totalPages: 1,
      openOfferSheet: vi.fn(),
      toggleRequestFavorite: vi.fn(),
      formatDate: new Intl.DateTimeFormat('de-DE'),
      formatPrice: new Intl.NumberFormat('de-DE'),
      categoryOptions: [],
      serviceOptions: [],
      cityOptions: [],
      sortOptions: [],
      categoryKey: '',
      subcategoryKey: '',
      cityId: '',
      sortBy: 'date_desc',
      page: 1,
      limit: 20,
      isCategoriesLoading: false,
      isServicesLoading: false,
      isPending: false,
      appliedFilterChips: [],
      onCategoryChange: vi.fn(),
      onSubcategoryChange: vi.fn(),
      onCityChange: vi.fn(),
      onSortChange: vi.fn(),
      onReset: vi.fn(),
      setPage: vi.fn(),
      serviceByKey: new Map(),
      categoryByKey: new Map(),
      cityById: new Map(),
    });

    expect(body.kind).toBe('public');
    if (body.kind !== 'public') {
      throw new Error('Expected public body variant');
    }
    expect(body.props.emptyCtaHref).toBe('/workspace?section=requests&scope=market');
  });

  it('builds an explicit private body variant', () => {
    const body = buildRequestsWorkspacePrivateBody({
      locale: 'de',
      isWorkspaceAuthed: true,
      guestLoginHref: '/auth/login',
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
          decisionPanel: null,
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
    });

    expect(body.kind).toBe('private');
    if (body.kind !== 'private') {
      throw new Error('Expected private body variant');
    }
    expect(body.props.guestLoginHref).toBe('/auth/login');
  });
});
