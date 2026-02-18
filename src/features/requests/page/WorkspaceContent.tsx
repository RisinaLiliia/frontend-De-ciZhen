'use client';

import * as React from 'react';
import Link from 'next/link';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import type { FavoritesView, ReviewsView, WorkspaceStatusFilter, WorkspaceTab } from './workspace';

type ChipFilter = {
  key: WorkspaceStatusFilter;
  label: string;
};

type PrimaryAction = {
  href: string;
  label: string;
};

type Props = {
  activeWorkspaceTab: WorkspaceTab;
  showWorkspaceHeader: boolean;
  showWorkspaceHeading: boolean;
  primaryAction: PrimaryAction;
  onPrimaryActionClick: () => void;
  statusFilters: ChipFilter[];
  activeStatusFilter: WorkspaceStatusFilter;
  setStatusFilter: (status: WorkspaceStatusFilter) => void;
  filtersProps: React.ComponentProps<typeof RequestsFilters>;
  hasActivePublicFilter: boolean;
  newOrdersResetHref: string;
  newOrdersState: {
    isLoading: boolean;
    isError: boolean;
    requestsCount: number;
  };
  newOrdersListProps: React.ComponentProps<typeof RequestsList>;
  myRequestsState: {
    isLoading: boolean;
    isEmpty: boolean;
  };
  myRequestsListProps: React.ComponentProps<typeof RequestsList>;
  myOffersState: {
    isLoading: boolean;
    isEmpty: boolean;
  };
  myOffersListProps: React.ComponentProps<typeof RequestsList>;
  contractsState: {
    isLoading: boolean;
    isEmpty: boolean;
  };
  contractsListProps: React.ComponentProps<typeof RequestsList>;
  favoritesState: {
    isLoading: boolean;
    isEmpty: boolean;
    hasFavoriteRequests: boolean;
    hasFavoriteProviders: boolean;
    resolvedView: FavoritesView;
  };
  onFavoritesViewChange: (view: FavoritesView) => void;
  favoriteRequestsListProps: React.ComponentProps<typeof RequestsList>;
  favoriteProvidersNode: React.ReactNode;
  reviewsState: {
    isLoading: boolean;
    isEmpty: boolean;
    activeView: ReviewsView;
  };
  onReviewsViewChange: (view: ReviewsView) => void;
  reviewCardsNode: React.ReactNode;
  pagination: {
    page: number;
    totalPages: number;
    totalResultsLabel: string;
    resultsLabel: string;
    onPrevPage: () => void;
    onNextPage: () => void;
  };
};

export function WorkspaceContent({
  activeWorkspaceTab,
  showWorkspaceHeader,
  showWorkspaceHeading,
  primaryAction,
  onPrimaryActionClick,
  statusFilters,
  activeStatusFilter,
  setStatusFilter,
  filtersProps,
  hasActivePublicFilter,
  newOrdersResetHref,
  newOrdersState,
  newOrdersListProps,
  myRequestsState,
  myRequestsListProps,
  myOffersState,
  myOffersListProps,
  contractsState,
  contractsListProps,
  favoritesState,
  onFavoritesViewChange,
  favoriteRequestsListProps,
  favoriteProvidersNode,
  reviewsState,
  onReviewsViewChange,
  reviewCardsNode,
  pagination,
}: Props) {
  return (
    <section className="panel requests-panel" aria-labelledby={showWorkspaceHeading ? 'workspace-section-title' : undefined}>
      {showWorkspaceHeader ? (
        <div className="requests-header">
          {showWorkspaceHeading ? (
            <div className="section-heading">
              <p id="workspace-section-title" className="section-title">
                {activeWorkspaceTab === 'my-requests'
                  ? 'Meine Auftraege'
                  : activeWorkspaceTab === 'my-offers'
                    ? 'Meine Angebote'
                    : activeWorkspaceTab === 'completed-jobs'
                      ? 'Abgeschlossene Jobs'
                      : 'Bewertungen'}
              </p>
              <p id="workspace-section-subtitle" className="section-subtitle">
                {'Workspace-Ansicht fuer deine eigenen Daten und Aktionen.'}
              </p>
            </div>
          ) : null}
          {activeWorkspaceTab !== 'new-orders' && activeWorkspaceTab !== 'my-requests' && activeWorkspaceTab !== 'my-offers' ? (
            <Link href={primaryAction.href} className="btn-primary requests-primary-cta" onClick={onPrimaryActionClick}>
              {primaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}

      {activeWorkspaceTab === 'new-orders' ? <RequestsFilters {...filtersProps} /> : null}

      {statusFilters.length > 0 ? (
        <div className="chip-row" role="tablist" aria-label="Statusfilter">
          {statusFilters.map((filterItem) => (
            <button
              key={filterItem.key}
              type="button"
              className={`chip ${activeStatusFilter === filterItem.key ? 'is-active' : ''}`.trim()}
              onClick={() => setStatusFilter(filterItem.key)}
              aria-pressed={activeStatusFilter === filterItem.key}
            >
              {filterItem.label}
            </button>
          ))}
        </div>
      ) : null}

      <section
        id="requests-list"
        className="requests-list"
        role="tabpanel"
        aria-labelledby={showWorkspaceHeading ? 'workspace-section-title' : undefined}
        aria-describedby={showWorkspaceHeading ? 'workspace-section-subtitle' : undefined}
        aria-live="polite"
      >
        {activeWorkspaceTab === 'new-orders' ? (
          <WorkspaceContentState
            isLoading={newOrdersState.isLoading}
            isEmpty={!newOrdersState.isError && newOrdersState.requestsCount === 0}
            emptyTitle={hasActivePublicFilter ? 'Keine Auftraege gefunden.' : 'Noch keine Auftraege vorhanden.'}
            emptyHint={
              hasActivePublicFilter
                ? 'Passe die Filter an oder setze sie zurueck.'
                : 'Schau spaeter erneut vorbei oder pruefe eine andere Stadt.'
            }
            emptyCtaLabel={hasActivePublicFilter ? 'Filter zuruecksetzen' : undefined}
            emptyCtaHref={hasActivePublicFilter ? newOrdersResetHref : undefined}
          >
            <RequestsList {...newOrdersListProps} />
          </WorkspaceContentState>
        ) : null}

        {activeWorkspaceTab === 'my-requests' ? (
          <div className="stack-sm">
            <CreateRequestCard />
            <WorkspaceContentState
              isLoading={myRequestsState.isLoading}
              isEmpty={myRequestsState.isEmpty}
              emptyTitle="Noch keine passenden Anfragen."
              emptyHint="Erstelle eine neue Anfrage oder wechsle den Statusfilter."
              emptyCtaLabel="Neue Anfrage erstellen"
              emptyCtaHref="/request/create"
            >
              <RequestsList {...myRequestsListProps} />
            </WorkspaceContentState>
          </div>
        ) : null}

        {activeWorkspaceTab === 'my-offers' ? (
          <div className="stack-sm">
            <WorkspaceContentState
              isLoading={myOffersState.isLoading}
              isEmpty={myOffersState.isEmpty}
              emptyTitle="Noch keine passenden Angebote."
              emptyHint="Noch keine Angebote. Anfrage erstellen oder offene Auftraege ansehen."
              emptyCtaLabel="Auftraege ansehen"
              emptyCtaHref="/orders?tab=new-orders"
            >
              <RequestsList {...myOffersListProps} />
            </WorkspaceContentState>
          </div>
        ) : null}

        {activeWorkspaceTab === 'completed-jobs' ? (
          <div className="stack-sm">
            <WorkspaceContentState
              isLoading={contractsState.isLoading}
              isEmpty={contractsState.isEmpty}
              emptyTitle="Noch keine passenden Vertraege."
              emptyHint="Sobald ein Angebot angenommen wird, erscheint es hier."
              emptyCtaLabel="Meine Angebote"
              emptyCtaHref="/orders?tab=my-offers"
            >
              <RequestsList {...contractsListProps} />
            </WorkspaceContentState>
          </div>
        ) : null}

        {activeWorkspaceTab === 'favorites' ? (
          <div className="stack-sm">
            <div className="chip-row" role="tablist" aria-label="Favoriten Ansicht">
              <button
                type="button"
                className={`chip ${favoritesState.resolvedView === 'requests' ? 'is-active' : ''}`.trim()}
                onClick={() => onFavoritesViewChange('requests')}
                aria-pressed={favoritesState.resolvedView === 'requests'}
              >
                Anfragen
              </button>
              <button
                type="button"
                className={`chip ${favoritesState.resolvedView === 'providers' ? 'is-active' : ''}`.trim()}
                onClick={() => onFavoritesViewChange('providers')}
                aria-pressed={favoritesState.resolvedView === 'providers'}
              >
                Anbieter
              </button>
            </div>
            <WorkspaceContentState
              isLoading={favoritesState.isLoading}
              isEmpty={favoritesState.isEmpty}
              emptyTitle={
                favoritesState.hasFavoriteRequests || favoritesState.hasFavoriteProviders
                  ? 'Keine Elemente in dieser Kategorie.'
                  : 'Du hast noch keine Favoriten.'
              }
              emptyHint={
                favoritesState.hasFavoriteRequests || favoritesState.hasFavoriteProviders
                  ? 'Wechsle zwischen Anfragen und Anbietern.'
                  : 'Markiere Auftraege oder Anbieter mit dem Herzsymbol, um sie hier zu speichern.'
              }
            >
              {favoritesState.resolvedView === 'requests' ? <RequestsList {...favoriteRequestsListProps} /> : favoriteProvidersNode}
            </WorkspaceContentState>
          </div>
        ) : null}

        {activeWorkspaceTab === 'reviews' ? (
          <div className="stack-sm">
            <div className="chip-row" role="tablist" aria-label="Bewertungen Ansicht">
              <button
                type="button"
                className={`chip ${reviewsState.activeView === 'provider' ? 'is-active' : ''}`.trim()}
                onClick={() => onReviewsViewChange('provider')}
                aria-pressed={reviewsState.activeView === 'provider'}
              >
                Als Anbieter
              </button>
              <button
                type="button"
                className={`chip ${reviewsState.activeView === 'client' ? 'is-active' : ''}`.trim()}
                onClick={() => onReviewsViewChange('client')}
                aria-pressed={reviewsState.activeView === 'client'}
              >
                Als Kunde
              </button>
            </div>
            <WorkspaceContentState
              isLoading={reviewsState.isLoading}
              isEmpty={reviewsState.isEmpty}
              emptyTitle="Noch keine Bewertungen vorhanden."
              emptyHint="Nach abgeschlossenen Auftraegen erscheinen Bewertungen hier."
              emptyCtaLabel="Auftraege verwalten"
              emptyCtaHref="/orders?tab=completed-jobs"
            >
              <div className="proof-feed">{reviewCardsNode}</div>
            </WorkspaceContentState>
          </div>
        ) : null}
      </section>

      {activeWorkspaceTab === 'new-orders' ? (
        <div className="requests-pagination">
          <button type="button" className="btn-ghost" onClick={pagination.onPrevPage} disabled={pagination.page <= 1}>
            ←
          </button>
          <span className="typo-small">
            {pagination.resultsLabel} {pagination.totalResultsLabel} • {pagination.page}/{pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn-ghost"
            onClick={pagination.onNextPage}
            disabled={pagination.page >= pagination.totalPages}
          >
            →
          </button>
        </div>
      ) : null}
    </section>
  );
}

