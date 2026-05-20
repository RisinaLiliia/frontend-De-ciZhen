'use client';

import * as React from 'react';

import { RequestsList } from '@/components/requests/RequestsList';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import type { I18nKey } from '@/lib/i18n/keys';
import type { FavoritesView, WorkspaceTab } from '../state';

export type WorkspaceRequestsPanelState = {
  isLoading: boolean;
  isEmpty: boolean;
};

export type WorkspaceFavoritesPanelState = WorkspaceRequestsPanelState & {
  hasFavoriteRequests: boolean;
  hasFavoriteProviders: boolean;
  resolvedView: FavoritesView;
};

export type WorkspaceReviewsPanelState = {
  isLoading: boolean;
  items: ReviewDto[];
};

export type WorkspaceContentPanelsProps = {
  t: (key: I18nKey) => string;
  isWorkspaceAuthed: boolean;
  activeWorkspaceTab: WorkspaceTab;
  showWorkspaceHeading: boolean;
  myRequestsState: WorkspaceRequestsPanelState;
  myRequestsListProps: React.ComponentProps<typeof RequestsList>;
  myOffersState: WorkspaceRequestsPanelState;
  myOffersListProps: React.ComponentProps<typeof RequestsList>;
  contractsState: WorkspaceRequestsPanelState;
  contractsListProps: React.ComponentProps<typeof RequestsList>;
  favoritesState: WorkspaceFavoritesPanelState;
  onFavoritesViewChange: (view: FavoritesView) => void;
  favoriteRequestsListProps: React.ComponentProps<typeof RequestsList>;
  favoriteProvidersNode: React.ReactNode;
  reviewsState: WorkspaceReviewsPanelState;
};
