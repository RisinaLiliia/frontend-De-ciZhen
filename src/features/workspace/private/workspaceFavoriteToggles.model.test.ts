import { describe, expect, it, vi } from 'vitest';

import {
  buildWorkspaceFavoriteToggleHandlers,
  buildWorkspaceFavoriteTogglesResult,
} from './workspaceFavoriteToggles.model';

describe('workspaceFavoriteToggles.model', () => {
  it('binds async request/provider toggles to void workspace handlers', () => {
    const toggleRequestFavorite = vi.fn(async () => undefined);
    const toggleProviderFavorite = vi.fn(async () => undefined);

    const handlers = buildWorkspaceFavoriteToggleHandlers({
      toggleRequestFavorite,
      toggleProviderFavorite,
    });

    handlers.onToggleRequestFavorite('req-1');
    handlers.onToggleProviderFavorite('provider-1');

    expect(toggleRequestFavorite).toHaveBeenCalledWith('req-1');
    expect(toggleProviderFavorite).toHaveBeenCalledWith('provider-1');
  });

  it('assembles workspace favorite toggle result from pending state and bound handlers', () => {
    const onToggleRequestFavorite = vi.fn();
    const onToggleProviderFavorite = vi.fn();

    const result = buildWorkspaceFavoriteTogglesResult({
      requestToggle: {
        pendingFavoriteRequestIds: new Set(['req-1']),
      },
      providerToggle: {
        pendingFavoriteProviderIds: new Set(['provider-1']),
      },
      onToggleRequestFavorite,
      onToggleProviderFavorite,
    });

    expect(result.pendingFavoriteRequestIds).toEqual(new Set(['req-1']));
    expect(result.pendingFavoriteProviderIds).toEqual(new Set(['provider-1']));
    expect(result.onToggleRequestFavorite).toBe(onToggleRequestFavorite);
    expect(result.onToggleProviderFavorite).toBe(onToggleProviderFavorite);
  });
});
