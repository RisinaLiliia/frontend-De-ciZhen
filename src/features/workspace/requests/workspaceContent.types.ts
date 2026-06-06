'use client';

import * as React from 'react';

import { RequestsList } from '@/components/requests/RequestsList';
import type { ReviewDto } from '@/lib/api/dto/reviews';
import type { I18nKey } from '@/lib/i18n/keys';
import type { FavoritesView, WorkspaceStatusFilter, WorkspaceTab } from '../state';

export type WorkspaceContentChipFilter = {
  key: WorkspaceStatusFilter;
  label: string;
};

export type WorkspaceContentPrimaryAction = {
  href: string;
  label: string;
};

export type WorkspaceContentProps = {
  t: (key: I18nKey) => string;
  isWorkspaceAuthed: boolean;
  activeWorkspaceTab: WorkspaceTab;
  showWorkspaceHeader: boolean;
  showWorkspaceHeading: boolean;
  primaryAction: WorkspaceContentPrimaryAction;
  onPrimaryActionClick: () => void;
  statusFilters: WorkspaceContentChipFilter[];
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
