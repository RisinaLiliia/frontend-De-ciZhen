'use client';

import type { useProviderFavoriteToggle, useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';

type RequestFavoriteToggleResult = ReturnType<typeof useRequestFavoriteToggle>;
type ProviderFavoriteToggleResult = ReturnType<typeof useProviderFavoriteToggle>;

type BuildWorkspaceFavoriteToggleHandlersArgs = {
  toggleRequestFavorite: RequestFavoriteToggleResult['toggleRequestFavorite'];
  toggleProviderFavorite: ProviderFavoriteToggleResult['toggleProviderFavorite'];
};

type BuildWorkspaceFavoriteTogglesResultArgs = {
  requestToggle: Pick<RequestFavoriteToggleResult, 'pendingFavoriteRequestIds'>;
  providerToggle: Pick<ProviderFavoriteToggleResult, 'pendingFavoriteProviderIds'>;
  onToggleRequestFavorite: (requestId: string) => void;
  onToggleProviderFavorite: (providerId: string) => void;
};

export function buildWorkspaceFavoriteToggleHandlers({
  toggleRequestFavorite,
  toggleProviderFavorite,
}: BuildWorkspaceFavoriteToggleHandlersArgs) {
  return {
    onToggleRequestFavorite(requestId: string) {
      void toggleRequestFavorite(requestId);
    },
    onToggleProviderFavorite(providerId: string) {
      void toggleProviderFavorite(providerId);
    },
  };
}

export function buildWorkspaceFavoriteTogglesResult({
  requestToggle,
  providerToggle,
  onToggleRequestFavorite,
  onToggleProviderFavorite,
}: BuildWorkspaceFavoriteTogglesResultArgs) {
  return {
    pendingFavoriteRequestIds: requestToggle.pendingFavoriteRequestIds,
    pendingFavoriteProviderIds: providerToggle.pendingFavoriteProviderIds,
    onToggleRequestFavorite,
    onToggleProviderFavorite,
  };
}
