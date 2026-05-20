'use client';

import { WorkspaceContractsTabPanel } from './components/WorkspaceContractsTabPanel';
import { WorkspaceFavoritesTabPanel } from './components/WorkspaceFavoritesTabPanel';
import { WorkspaceOffersTabPanel } from './components/WorkspaceOffersTabPanel';
import { WorkspaceProfileTabPanel } from './components/WorkspaceProfileTabPanel';
import { WorkspaceRequestsTabPanel } from './components/WorkspaceRequestsTabPanel';
import { WorkspaceReviewsTabPanel } from './components/WorkspaceReviewsTabPanel';
import type { WorkspaceContentPanelsProps } from './workspaceContentPanels.types';

export function WorkspaceContentPanels({
  t,
  isWorkspaceAuthed,
  activeWorkspaceTab,
  showWorkspaceHeading,
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
}: WorkspaceContentPanelsProps) {
  let content: React.ReactNode = null;

  switch (activeWorkspaceTab) {
    case 'my-requests':
      content = (
        <WorkspaceRequestsTabPanel
          t={t}
          myRequestsState={myRequestsState}
          myRequestsListProps={myRequestsListProps}
        />
      );
      break;
    case 'my-offers':
      content = (
        <WorkspaceOffersTabPanel
          t={t}
          myOffersState={myOffersState}
          myOffersListProps={myOffersListProps}
        />
      );
      break;
    case 'completed-jobs':
      content = (
        <WorkspaceContractsTabPanel
          t={t}
          contractsState={contractsState}
          contractsListProps={contractsListProps}
        />
      );
      break;
    case 'favorites':
      content = (
        <WorkspaceFavoritesTabPanel
          t={t}
          isWorkspaceAuthed={isWorkspaceAuthed}
          favoritesState={favoritesState}
          onFavoritesViewChange={onFavoritesViewChange}
          favoriteRequestsListProps={favoriteRequestsListProps}
          favoriteProvidersNode={favoriteProvidersNode}
        />
      );
      break;
    case 'reviews':
      content = (
        <WorkspaceReviewsTabPanel
          t={t}
          isWorkspaceAuthed={isWorkspaceAuthed}
          reviewsState={reviewsState}
        />
      );
      break;
    case 'profile':
      content = <WorkspaceProfileTabPanel />;
      break;
    default:
      content = null;
  }

  return (
    <section
      id="requests-list"
      className="requests-list is-single"
      role="region"
      aria-labelledby={showWorkspaceHeading ? 'workspace-section-title' : undefined}
      aria-describedby={showWorkspaceHeading ? 'workspace-section-subtitle' : undefined}
      aria-live="polite"
    >
      {content}
    </section>
  );
}
