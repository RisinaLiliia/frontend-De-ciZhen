'use client';

import * as React from 'react';
import Link from 'next/link';

import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceReviewsPanel } from '@/components/reviews/WorkspaceReviewsPanel';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import type { FavoritesView, WorkspaceStatusFilter, WorkspaceTab } from './workspace.types';
import { getWorkspaceSectionSubtitle, getWorkspaceTabTitles } from './workspace.content';
import { WorkspaceProfileOnboardingForm } from './WorkspaceProfileOnboardingForm';

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
        <div className="requests-header">
          {showWorkspaceHeading ? (
            <div className="section-heading">
              <p id="workspace-section-title" className="section-title">
                {workspaceTabTitles[activeWorkspaceTab] ?? t(I18N_KEYS.requestsPage.navReviews)}
              </p>
              <p id="workspace-section-subtitle" className="section-subtitle">
                {workspaceSectionSubtitle}
              </p>
            </div>
          ) : null}
          {activeWorkspaceTab !== 'my-requests' &&
          activeWorkspaceTab !== 'my-offers' &&
          activeWorkspaceTab !== 'profile' &&
          activeWorkspaceTab !== 'reviews' ? (
            <Link href={primaryAction.href} prefetch={false} className="btn-primary requests-primary-cta" onClick={onPrimaryActionClick}>
              {primaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}

      {statusFilters.length > 0 ? (
        <div className="chip-row" role="group" aria-label={t(I18N_KEYS.requestsPage.statusFiltersLabel)}>
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
        className="requests-list is-single"
        role="region"
        aria-labelledby={showWorkspaceHeading ? 'workspace-section-title' : undefined}
        aria-describedby={showWorkspaceHeading ? 'workspace-section-subtitle' : undefined}
        aria-live="polite"
      >
        {activeWorkspaceTab === 'my-requests' ? (
          <WorkspaceContentState
            isLoading={myRequestsState.isLoading}
            isEmpty={myRequestsState.isEmpty}
            emptyTitle={t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyTitle)}
            emptyHint={t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyHint)}
            emptyCtaLabel={t(I18N_KEYS.requestsPage.workspaceMyRequestsEmptyCta)}
            emptyCtaHref="/request/create"
          >
            <RequestsList {...myRequestsListProps} />
          </WorkspaceContentState>
        ) : null}

        {activeWorkspaceTab === 'my-offers' ? (
          <div className="stack-sm">
            <WorkspaceContentState
              isLoading={myOffersState.isLoading}
              isEmpty={myOffersState.isEmpty}
              emptyTitle={t(I18N_KEYS.requestsPage.workspaceMyOffersEmptyTitle)}
              emptyHint={t(I18N_KEYS.requestsPage.workspaceMyOffersEmptyHint)}
              emptyCtaLabel={t(I18N_KEYS.requestsPage.workspaceMyOffersEmptyCta)}
              emptyCtaHref="/workspace?section=requests"
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
              emptyTitle={t(I18N_KEYS.requestsPage.workspaceContractsEmptyTitle)}
              emptyHint={t(I18N_KEYS.requestsPage.workspaceContractsEmptyHint)}
              emptyCtaLabel={t(I18N_KEYS.requestsPage.workspaceContractsEmptyCta)}
              emptyCtaHref="/workspace?tab=my-offers"
            >
              <RequestsList {...contractsListProps} />
            </WorkspaceContentState>
          </div>
        ) : null}

        {activeWorkspaceTab === 'favorites' ? (
          <div className="stack-sm">
            {!isWorkspaceAuthed ? (
              <WorkspaceContentState
                isLoading={false}
                isEmpty={true}
                emptyTitle={t(I18N_KEYS.requestsPage.favoritesGuestGateTitle)}
                emptyHint={t(I18N_KEYS.requestsPage.favoritesGuestGateHint)}
                emptyCtaLabel={t(I18N_KEYS.requestsPage.favoritesGuestGateCta)}
                emptyCtaHref="/workspace?section=profile"
              >
                <></>
              </WorkspaceContentState>
            ) : (
              <>
                <div className="chip-row" role="group" aria-label={t(I18N_KEYS.requestsPage.favoritesViewLabel)}>
                  <button
                    type="button"
                    className={`chip ${favoritesState.resolvedView === 'requests' ? 'is-active' : ''}`.trim()}
                    onClick={() => onFavoritesViewChange('requests')}
                    aria-pressed={favoritesState.resolvedView === 'requests'}
                  >
                    {t(I18N_KEYS.requestsPage.favoritesTabRequests)}
                  </button>
                  <button
                    type="button"
                    className={`chip ${favoritesState.resolvedView === 'providers' ? 'is-active' : ''}`.trim()}
                    onClick={() => onFavoritesViewChange('providers')}
                    aria-pressed={favoritesState.resolvedView === 'providers'}
                  >
                    {t(I18N_KEYS.requestsPage.favoritesTabProviders)}
                  </button>
                </div>
                <WorkspaceContentState
                  isLoading={favoritesState.isLoading}
                  isEmpty={favoritesState.isEmpty}
                  emptyTitle={
                    favoritesState.hasFavoriteRequests || favoritesState.hasFavoriteProviders
                      ? t(I18N_KEYS.requestsPage.favoritesEmptyCategoryTitle)
                      : t(I18N_KEYS.requestsPage.favoritesEmptyAllTitle)
                  }
                  emptyHint={
                    favoritesState.hasFavoriteRequests || favoritesState.hasFavoriteProviders
                      ? t(I18N_KEYS.requestsPage.favoritesEmptyCategoryHint)
                      : t(I18N_KEYS.requestsPage.favoritesEmptyAllHint)
                  }
                >
                  {favoritesState.resolvedView === 'requests' ? <RequestsList {...favoriteRequestsListProps} /> : favoriteProvidersNode}
                </WorkspaceContentState>
              </>
            )}
          </div>
        ) : null}

        {activeWorkspaceTab === 'reviews' ? (
          <div className="stack-sm">
            <WorkspaceReviewsPanel
              t={t}
              source={isWorkspaceAuthed ? 'user' : 'platform'}
              userReviews={reviewsState.items}
              isUserReviewsLoading={reviewsState.isLoading}
            />
          </div>
        ) : null}

        {activeWorkspaceTab === 'profile' ? <WorkspaceProfileOnboardingForm /> : null}
      </section>
    </section>
  );
}
