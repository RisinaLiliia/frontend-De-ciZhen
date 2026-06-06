'use client';

import { workspaceRequestsPanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { WorkspaceContentHeader } from './components/WorkspaceContentHeader';
import { WorkspaceContentStatusFilters } from './components/WorkspaceContentStatusFilters';
import { WorkspaceContentPanels } from './WorkspaceContentPanels';
import type { WorkspaceContentProps } from './workspaceContent.types';

export function WorkspaceContent({
  t,
  isWorkspaceAuthed,
  activeWorkspaceTab,
  showWorkspaceHeader,
  showWorkspaceHeading,
  primaryAction,
  onPrimaryActionClick,
  statusFilters,
  activeStatusFilter,
  setStatusFilter,
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
}: WorkspaceContentProps) {
  return (
    <section
      className={workspaceRequestsPanelShell()}
      aria-labelledby={showWorkspaceHeading ? 'workspace-section-title' : undefined}
    >
      {showWorkspaceHeader ? (
        <WorkspaceContentHeader
          t={t}
          activeWorkspaceTab={activeWorkspaceTab}
          showWorkspaceHeading={showWorkspaceHeading}
          primaryAction={primaryAction}
          onPrimaryActionClick={onPrimaryActionClick}
        />
      ) : null}

      <WorkspaceContentStatusFilters
        t={t}
        statusFilters={statusFilters}
        activeStatusFilter={activeStatusFilter}
        setStatusFilter={setStatusFilter}
      />

      <WorkspaceContentPanels
        t={t}
        isWorkspaceAuthed={isWorkspaceAuthed}
        activeWorkspaceTab={activeWorkspaceTab}
        showWorkspaceHeading={showWorkspaceHeading}
        myRequestsState={myRequestsState}
        myRequestsListProps={myRequestsListProps}
        myOffersState={myOffersState}
        myOffersListProps={myOffersListProps}
        contractsState={contractsState}
        contractsListProps={contractsListProps}
        favoritesState={favoritesState}
        onFavoritesViewChange={onFavoritesViewChange}
        favoriteRequestsListProps={favoriteRequestsListProps}
        favoriteProvidersNode={favoriteProvidersNode}
        reviewsState={reviewsState}
      />
    </section>
  );
}
