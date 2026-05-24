/** @vitest-environment happy-dom */

import type * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RequestsView } from '@/features/workspace/requests/RequestsView';
import { buildWorkspaceRequestsSurfaceModel, type WorkspaceRequestsSurfaceModel } from '@/features/workspace/requests/workspaceRequestsView.model';

vi.mock('@/components/favorites/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

vi.mock('@/components/requests/RequestCard', () => ({
  RequestCard: ({
    topSlot,
    statusSlot,
    actionSlot,
    title,
  }: {
    topSlot?: React.ReactNode;
    statusSlot?: React.ReactNode;
    actionSlot?: React.ReactNode;
    title: string;
  }) => (
    <article data-testid="request-card">
      <div>{title}</div>
      <div data-testid="request-card-top-slot">{topSlot}</div>
      {statusSlot ? <div data-testid="request-card-status-slot">{statusSlot}</div> : null}
      {actionSlot ? <div data-testid="request-card-action-slot">{actionSlot}</div> : null}
    </article>
  ),
}));

vi.mock('@/components/requests/WorkspaceGuestRequestCard', () => ({
  WorkspaceGuestRequestCard: () => null,
}));

vi.mock('@/components/ui/LocationMeta', () => ({
  LocationMeta: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock('@/components/ui/MoreDotsLink', () => ({
  MoreDotsLink: () => <button type="button">Mehr</button>,
}));

vi.mock('@/components/ui/icons/icons', () => ({
  IconArchive: () => <span />,
  IconCalendar: () => <span />,
  IconCopy: () => <span />,
  IconEdit: () => <span />,
  IconShare: () => <span />,
  IconTrash: () => <span />,
}));

vi.mock('@/features/workspace/ai-rail/WorkspaceRequestsActionRail', () => ({
  WorkspaceRequestsActionRail: () => null,
}));

vi.mock('@/features/workspace/ai-rail/WorkspaceDecisionModeBar', () => ({
  WorkspaceDecisionModeBar: () => null,
}));

vi.mock('@/features/workspace/ai-rail/WorkspaceRequestsSectionSummary', () => ({
  WorkspaceRequestsSectionSummary: () => null,
}));

vi.mock('@/features/workspace/overlays/PrivateRequestSessionDialog', () => ({
  PrivateRequestSessionDialog: () => null,
}));

vi.mock('@/features/workspace/overlays/useWorkspaceRequestOverlayFlow', () => ({
  useWorkspaceRequestOverlayFlow: ({ listContext }: { listContext: unknown }) => ({
    activeChatState: null,
    activeOfferRequestId: null,
    activeRequestCard: null,
    activeRequestState: null,
    closeChat: vi.fn(),
    closeOfferSheet: vi.fn(),
    closeRequest: vi.fn(),
    effectiveListContext: listContext,
    openOfferSheet: vi.fn(),
  }),
}));

vi.mock('@/features/workspace/requests/RequestsViewStates', () => ({
  AuthGate: () => null,
  CardSkeletonList: () => null,
  EmptyState: () => null,
}));

vi.mock('@/features/workspace/requests/RequestsListPagination', () => ({
  RequestsListPagination: () => null,
}));

vi.mock('@/features/workspace/requests/RequestsViewInsights', () => ({
  RequestOwnerFooterNote: () => null,
  RequestOwnerInsights: () => null,
}));

vi.mock('@/features/workspace/requests/RequestsWorkflowProgress', () => ({
  WorkflowProgress: () => <div>Fortschritt</div>,
}));

function createSurface(): WorkspaceRequestsSurfaceModel {
  return buildWorkspaceRequestsSurfaceModel({
    variant: 'private',
    locale: 'de',
    isWorkspaceAuthed: true,
    guestLoginHref: '/auth/login',
    model: {
      response: {
        section: 'requests',
        scope: 'my',
        header: { title: 'Meine Auftraege' },
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
          total: 1,
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
            inProgress: 1,
            completedThisPeriod: 0,
          },
        },
        sidePanel: null,
      },
      cards: [
        {
          id: 'card-1',
          requestId: 'request-1',
          role: 'provider',
          state: 'active',
          canEdit: false,
          requestPreview: {
            href: '/workspace?section=requests&requestId=request-1',
            categoryLabel: 'Renovierung',
            title: 'Bad sanieren',
            excerpt: 'Sanierung im Altbau',
            cityLabel: 'Berlin',
            dateLabel: 'Heute',
            priceLabel: '1.200 EUR',
            priceTrend: null,
            priceTrendLabel: null,
            tags: [],
            imageUrl: null,
            imageCategoryKey: null,
            badgeLabel: null,
          },
          status: {
            badgeLabel: 'In Bearbeitung',
            badgeVariant: 'warning',
            actions: [],
          },
          decision: {
            needsAction: true,
            actionLabel: 'Antwort noetig',
            actionType: 'reply_required',
            actionReason: 'Rueckfrage offen',
            actionPriorityLevel: 'high',
          },
          activity: null,
          progress: {
            steps: [],
          },
          primaryAction: null,
          secondaryAction: null,
          chrome: {
            priorityLabel: 'Aktion noetig',
            priorityTone: 'high',
            signalPills: [],
            insights: [],
          },
        } as never,
      ],
      emptyMode: 'none',
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
  });
}

describe('RequestsView', () => {
  it('renders private priority status in the top slot without a duplicate lower status slot', () => {
    render(<RequestsView surface={createSurface()} />);

    const topSlot = screen.getByTestId('request-card-top-slot');

    expect(within(topSlot).getByText('In Bearbeitung')).toBeTruthy();
    expect(within(topSlot).getByText('Aktion noetig')).toBeTruthy();
    expect(screen.queryByTestId('request-card-status-slot')).toBeNull();
  });
});
