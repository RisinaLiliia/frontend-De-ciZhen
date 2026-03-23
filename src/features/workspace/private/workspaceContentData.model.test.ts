import { describe, expect, it } from 'vitest';

import { buildWorkspaceContentDataResult, buildWorkspaceViewModelPatch } from './workspaceContentData.model';

function createArgs() {
  const primaryAction = { href: '/request/create', label: 'Create' };
  const favoriteProviderCards = ['card-1'];

  return {
    derived: {
      showWorkspaceHeader: true,
      showWorkspaceHeading: false,
      primaryAction,
      statusFilters: [{ key: 'all', label: 'All', count: 3 }],
      filteredMyRequests: [{ id: 'req-1' }],
      filteredMyOffers: [{ id: 'offer-1' }],
      myOfferRequests: [{ id: 'req-1' }],
      filteredContracts: [{ id: 'contract-1' }],
      hasFavoriteRequests: true,
      hasFavoriteProviders: true,
      resolvedFavoritesView: 'providers',
      favoritesItems: [{ id: 'favorite-1' }],
      isFavoritesLoading: false,
    },
    contract: {
      contractRequests: [{ id: 'req-1' }],
      contractOffersByRequest: new Map([['req-1', [{ id: 'offer-1' }]]]),
    },
    cards: {
      favoriteProviderCards,
    },
  } as never;
}

describe('workspaceContentData.model', () => {
  it('builds workspace view-model patch from derived, contract and card slices', () => {
    const patch = buildWorkspaceViewModelPatch(createArgs());

    expect(patch.showWorkspaceHeader).toBe(true);
    expect(patch.resolvedFavoritesView).toBe('providers');
    expect(patch.contractOffersByRequest.get('req-1')).toEqual([{ id: 'offer-1' }]);
    expect(patch.favoriteProviderCards).toEqual(['card-1']);
  });

  it('returns primary action together with the assembled patch', () => {
    const result = buildWorkspaceContentDataResult(createArgs());

    expect(result.primaryAction.href).toBe('/request/create');
    expect(result.viewModelPatch.primaryAction.label).toBe('Create');
    expect(result.viewModelPatch.filteredContracts).toEqual([{ id: 'contract-1' }]);
  });
});
