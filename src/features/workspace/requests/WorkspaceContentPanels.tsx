'use client';

import * as React from 'react';

import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceReviewsPanel } from '@/components/reviews/WorkspaceReviewsPanel';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import { WorkspaceChipToggleGroup } from './WorkspaceChipToggleGroup';
import { WorkspaceProfileOnboardingForm } from './WorkspaceProfileOnboardingForm';
import type { FavoritesView, WorkspaceTab } from './workspace.types';

type WorkspaceContentPanelsProps = {
  t: (key: I18nKey) => string;
  isWorkspaceAuthed: boolean;
  activeWorkspaceTab: WorkspaceTab;
  showWorkspaceHeading: boolean;
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
  return (
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
            emptyCtaHref="/workspace?section=requests&scope=my&period=90d&range=90d"
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
              isEmpty
              emptyTitle={t(I18N_KEYS.requestsPage.favoritesGuestGateTitle)}
              emptyHint={t(I18N_KEYS.requestsPage.favoritesGuestGateHint)}
              emptyCtaLabel={t(I18N_KEYS.requestsPage.favoritesGuestGateCta)}
              emptyCtaHref="/workspace?section=profile"
            >
              <></>
            </WorkspaceContentState>
          ) : (
            <>
              <WorkspaceChipToggleGroup
                items={[
                  { key: 'requests', label: t(I18N_KEYS.requestsPage.favoritesTabRequests) },
                  { key: 'providers', label: t(I18N_KEYS.requestsPage.favoritesTabProviders) },
                ]}
                selectedKey={favoritesState.resolvedView}
                onSelect={(key) => onFavoritesViewChange(key as FavoritesView)}
                ariaLabel={t(I18N_KEYS.requestsPage.favoritesViewLabel)}
              />
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
                {favoritesState.resolvedView === 'requests' ? (
                  <RequestsList {...favoriteRequestsListProps} />
                ) : (
                  favoriteProvidersNode
                )}
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
  );
}
