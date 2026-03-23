'use client';

import * as React from 'react';
import Link from 'next/link';

import { RequestsList } from '@/components/requests/RequestsList';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import { WorkspaceChipToggleGroup } from './WorkspaceChipToggleGroup';
import { WorkspaceContentPanels } from './WorkspaceContentPanels';
import type { FavoritesView, WorkspaceStatusFilter, WorkspaceTab } from './workspace.types';
import { getWorkspaceSectionSubtitle, getWorkspaceTabTitles } from './workspace.content';

type ChipFilter = {
  key: WorkspaceStatusFilter;
  label: string;
};

type PrimaryAction = {
  href: string;
  label: string;
};

type Props = {
  t: (key: I18nKey) => string;
  isWorkspaceAuthed: boolean;
  activeWorkspaceTab: WorkspaceTab;
  showWorkspaceHeader: boolean;
  showWorkspaceHeading: boolean;
  primaryAction: PrimaryAction;
  onPrimaryActionClick: () => void;
  statusFilters: ChipFilter[];
  activeStatusFilter: WorkspaceStatusFilter;
  setStatusFilter: (status: WorkspaceStatusFilter) => void;
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
    items: ReviewDto[];
  };
};

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
}: Props) {
  const workspaceTabTitles = React.useMemo(() => getWorkspaceTabTitles(t), [t]);
  const workspaceSectionSubtitle = React.useMemo(
    () => getWorkspaceSectionSubtitle(t, activeWorkspaceTab),
    [activeWorkspaceTab, t],
  );

  return (
    <section className="panel requests-panel" aria-labelledby={showWorkspaceHeading ? 'workspace-section-title' : undefined}>
      {showWorkspaceHeader ? (
        <SectionHeader
          className="requests-header"
          title={workspaceTabTitles[activeWorkspaceTab] ?? t(I18N_KEYS.requestsPage.navReviews)}
          subtitle={showWorkspaceHeading ? workspaceSectionSubtitle : undefined}
          titleId={showWorkspaceHeading ? 'workspace-section-title' : undefined}
          subtitleId={showWorkspaceHeading ? 'workspace-section-subtitle' : undefined}
          hideHeading={!showWorkspaceHeading}
          actions={
            activeWorkspaceTab !== 'my-requests' &&
            activeWorkspaceTab !== 'my-offers' &&
            activeWorkspaceTab !== 'profile' &&
            activeWorkspaceTab !== 'reviews' ? (
              <Link href={primaryAction.href} prefetch={false} className="btn-primary requests-primary-cta" onClick={onPrimaryActionClick}>
                {primaryAction.label}
              </Link>
            ) : null
          }
        />
      ) : null}

      <WorkspaceChipToggleGroup
        items={statusFilters}
        selectedKey={activeStatusFilter}
        onSelect={(key) => setStatusFilter(key as WorkspaceStatusFilter)}
        ariaLabel={t(I18N_KEYS.requestsPage.statusFiltersLabel)}
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
