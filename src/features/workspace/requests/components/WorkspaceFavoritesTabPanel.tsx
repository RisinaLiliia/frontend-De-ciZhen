'use client';

import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { WorkspaceChipToggleGroup } from '@/features/workspace/shared';
import type { FavoritesView } from '../../state';
import type { WorkspaceContentPanelsProps } from '../workspaceContentPanels.types';

type Props = Pick<
  WorkspaceContentPanelsProps,
  | 't'
  | 'isWorkspaceAuthed'
  | 'favoritesState'
  | 'onFavoritesViewChange'
  | 'favoriteRequestsListProps'
  | 'favoriteProvidersNode'
>;

export function WorkspaceFavoritesTabPanel({
  t,
  isWorkspaceAuthed,
  favoritesState,
  onFavoritesViewChange,
  favoriteRequestsListProps,
  favoriteProvidersNode,
}: Props) {
  return (
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
  );
}
